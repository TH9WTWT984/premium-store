import { NextResponse } from "next/server";
import { readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

const MEDIA_DIR = path.join(process.cwd(), "public", "uploads", "media");
const META_FILE = path.join(MEDIA_DIR, ".media-meta.json");

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

function safeFileName(value: string) {
  return path.basename(value);
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

async function buildItem(filename: string, meta: Record<string, MetaRecord>) {
  const fileStat = await stat(path.join(MEDIA_DIR, filename));
  const record = meta[filename] || {};
  const url = `/uploads/media/${encodeURIComponent(filename)}`;

  const [productImages, categories, homepage] = await Promise.all([
    prisma.productImage.count({ where: { url } }),
    prisma.category.count({ where: { imageUrl: url } }),
    prisma.cmsHomepage.count({ where: { heroImageUrl: url } }),
  ]);

  const sources: string[] = [];
  if (productImages) sources.push(`Product images (${productImages})`);
  if (categories) sources.push(`Categories (${categories})`);
  if (homepage) sources.push("Homepage hero");

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
    usage: productImages + categories + homepage,
    usageSources: sources,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.role.permissions.some((permission) => permission.key === "products.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { filename: rawFilename } = await params;
  const filename = safeFileName(rawFilename);

  try {
    await stat(path.join(MEDIA_DIR, filename));
  } catch {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  const body = await request.json();
  const meta = await readMeta();
  const current = meta[filename] || {};

  meta[filename] = {
    ...current,
    title: typeof body.title === "string" ? body.title.slice(0, 160) : current.title || "",
    altText: typeof body.altText === "string" ? body.altText.slice(0, 300) : current.altText || "",
    caption: typeof body.caption === "string" ? body.caption.slice(0, 300) : current.caption || "",
    description: typeof body.description === "string" ? body.description.slice(0, 2000) : current.description || "",
    folder: typeof body.folder === "string" ? body.folder.slice(0, 80) : current.folder || "media",
    tags: Array.isArray(body.tags) ? body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean).slice(0, 30) : current.tags || [],
    updatedAt: new Date().toISOString(),
  };

  await writeMeta(meta);

  await prisma.activityLog.create({
    data: {
      adminUserId: admin.id,
      action: "UPDATE",
      entity: "Media",
      entityId: filename,
      metadata: { fields: Object.keys(body) },
    },
  });

  return NextResponse.json({ item: await buildItem(filename, meta) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.role.permissions.some((permission) => permission.key === "products.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { filename: rawFilename } = await params;
  const filename = safeFileName(rawFilename);

  const refs = await Promise.all([
    prisma.productImage.count({ where: { url: `/uploads/media/${encodeURIComponent(filename)}` } }),
    prisma.category.count({ where: { imageUrl: `/uploads/media/${encodeURIComponent(filename)}` } }),
    prisma.cmsHomepage.count({ where: { heroImageUrl: `/uploads/media/${encodeURIComponent(filename)}` } }),
  ]);

  if (refs.some(Boolean)) {
    return NextResponse.json(
      { error: "This media file is still in use. Remove those references before deleting it." },
      { status: 409 },
    );
  }

  try {
    await unlink(path.join(MEDIA_DIR, filename));
    const meta = await readMeta();
    delete meta[filename];
    await writeMeta(meta);

    await prisma.activityLog.create({
      data: { adminUserId: admin.id, action: "DELETE", entity: "Media", entityId: filename },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete media." }, { status: 404 });
  }
}
