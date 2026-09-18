import { NextResponse } from "next/server";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

const MEDIA_DIR = path.join(process.cwd(), "public", "uploads", "media");
const META_FILE = path.join(MEDIA_DIR, ".media-meta.json");
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

type MetaRecord = {
  originalName?: string;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  folder?: string;
  tags?: string[];
  width?: number | null;
  height?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

async function ensureMediaDir() {
  await mkdir(MEDIA_DIR, { recursive: true });
}

async function readMeta(): Promise<Record<string, MetaRecord>> {
  try {
    return JSON.parse(await readFile(META_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeMeta(meta: Record<string, MetaRecord>) {
  await writeFile(META_FILE, JSON.stringify(meta, null, 2), "utf8");
}

function safeFileName(value: string) {
  return path.basename(value);
}

function detectDimensions(buffer: Buffer, mimeType: string): { width: number | null; height: number | null } {
  try {
    if (mimeType === "image/png" && buffer.length > 24) {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }

    if (mimeType === "image/gif" && buffer.length > 10) {
      return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
    }

    if (mimeType === "image/webp" && buffer.length > 30 && buffer.toString("ascii", 0, 4) === "RIFF") {
      const chunk = buffer.toString("ascii", 12, 16);
      if (chunk === "VP8X") {
        const width = 1 + buffer.readUIntLE(24, 3);
        const height = 1 + buffer.readUIntLE(27, 3);
        return { width, height };
      }
    }

    if (mimeType === "image/jpeg" && buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset += 1;
          continue;
        }

        const marker = buffer[offset + 1];
        const length = buffer.readUInt16BE(offset + 2);
        const isSof =
          marker >= 0xc0 &&
          marker <= 0xc3 ||
          marker >= 0xc5 &&
          marker <= 0xc7 ||
          marker >= 0xc9 &&
          marker <= 0xcb ||
          marker >= 0xcd &&
          marker <= 0xcf;

        if (isSof && offset + 8 < buffer.length) {
          return {
            width: buffer.readUInt16BE(offset + 7),
            height: buffer.readUInt16BE(offset + 5),
          };
        }

        if (!length) break;
        offset += 2 + length;
      }
    }
  } catch {}

  return { width: null, height: null };
}

async function usageFor(url: string) {
  const [productImages, categories, homepage] = await Promise.all([
    prisma.productImage.count({ where: { url } }),
    prisma.category.count({ where: { imageUrl: url } }),
    prisma.cmsHomepage.count({
      where: {
        OR: [
          { heroImageUrl: url },
        ],
      },
    }),
  ]);

  const sources: string[] = [];
  if (productImages) sources.push(`Product images (${productImages})`);
  if (categories) sources.push(`Categories (${categories})`);
  if (homepage) sources.push("Homepage hero");

  return { usage: productImages + categories + homepage, sources };
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.role.permissions.some((permission) => permission.key === "products.read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureMediaDir();
  const meta = await readMeta();
  const entries = (await readdir(MEDIA_DIR)).filter((name) => !name.startsWith("."));

  const items = await Promise.all(
    entries.map(async (filename) => {
      const absolute = path.join(MEDIA_DIR, safeFileName(filename));
      const fileStat = await stat(absolute);
      const record = meta[filename] || {};
      const url = `/uploads/media/${encodeURIComponent(filename)}`;
      const usage = await usageFor(url);

      return {
        filename,
        originalName: record.originalName || filename,
        url,
        mimeType:
          filename.endsWith(".png") ? "image/png" :
          filename.endsWith(".webp") ? "image/webp" :
          filename.endsWith(".gif") ? "image/gif" : "image/jpeg",
        sizeBytes: fileStat.size,
        width: record.width ?? null,
        height: record.height ?? null,
        title: record.title || record.originalName || filename,
        altText: record.altText || "",
        caption: record.caption || "",
        description: record.description || "",
        folder: record.folder || "media",
        tags: record.tags || [],
        createdAt: record.createdAt || fileStat.birthtime.toISOString(),
        updatedAt: record.updatedAt || fileStat.mtime.toISOString(),
        usage: usage.usage,
        usageSources: usage.sources,
      };
    }),
  );

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.role.permissions.some((permission) => permission.key === "products.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureMediaDir();

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file was provided." }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use JPG, PNG, WebP or GIF." },
        { status: 400 },
      );
    }

    if (file.size < 1 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be between 1 byte and 8 MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = ALLOWED.get(file.type)!;
    const base = path
      .basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "media";

    const filename = `${base}-${crypto.randomUUID().slice(0, 8)}${extension}`;
    await writeFile(path.join(MEDIA_DIR, filename), buffer);

    const dimensions = detectDimensions(buffer, file.type);
    const now = new Date().toISOString();
    const meta = await readMeta();

    meta[filename] = {
      originalName: file.name,
      title: path.basename(file.name, path.extname(file.name)),
      altText: "",
      caption: "",
      description: "",
      folder: "media",
      tags: [],
      width: dimensions.width,
      height: dimensions.height,
      createdAt: now,
      updatedAt: now,
    };

    await writeMeta(meta);
    await prisma.activityLog.create({
      data: {
        adminUserId: admin.id,
        action: "UPLOAD",
        entity: "Media",
        entityId: filename,
        metadata: { filename, originalName: file.name, sizeBytes: file.size, mimeType: file.type },
      },
    });

    return NextResponse.json({
      item: {
        filename,
        originalName: file.name,
        url: `/uploads/media/${encodeURIComponent(filename)}`,
        mimeType: file.type,
        sizeBytes: file.size,
        width: dimensions.width,
        height: dimensions.height,
        title: meta[filename].title || filename,
        altText: "",
        caption: "",
        description: "",
        folder: "media",
        tags: [],
        createdAt: now,
        updatedAt: now,
        usage: 0,
        usageSources: [],
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/media", error);
    return NextResponse.json({ error: "Unable to upload media right now." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.role.permissions.some((permission) => permission.key === "products.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const filename = safeFileName(new URL(request.url).searchParams.get("filename") || "");
  if (!filename) return NextResponse.json({ error: "Media filename is required." }, { status: 400 });

  try {
    await unlink(path.join(MEDIA_DIR, filename));
    const meta = await readMeta();
    delete meta[filename];
    await writeMeta(meta);

    await prisma.activityLog.create({
      data: {
        adminUserId: admin.id,
        action: "DELETE",
        entity: "Media",
        entityId: filename,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete media." }, { status: 404 });
  }
}
