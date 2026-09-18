import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();

  if (!admin || !admin.role.permissions.some((permission) => permission.key === "products.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const value = formData.get("file");

    if (!(value instanceof File)) {
      return NextResponse.json({ error: "No image file was provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(value.type)) {
      return NextResponse.json({ error: "Unsupported image type. Use JPG, PNG or WebP." }, { status: 400 });
    }

    if (value.size <= 0 || value.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be between 1 byte and 8 MB." }, { status: 400 });
    }

    const extension = ALLOWED_TYPES.get(value.type)!;
    const filename = `${randomUUID()}.${extension}`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "products");
    const diskPath = path.join(uploadDirectory, filename);

    await mkdir(uploadDirectory, { recursive: true });
    const bytes = Buffer.from(await value.arrayBuffer());
    await writeFile(diskPath, bytes);

    return NextResponse.json({
      url: `/uploads/products/${filename}`,
      filename,
      size: value.size,
      type: value.type,
    });
  } catch (error) {
    console.error("Product image upload failed", error);
    return NextResponse.json({ error: "Unable to upload image right now." }, { status: 500 });
  }
}
