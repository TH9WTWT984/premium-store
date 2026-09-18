import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(2).max(120),
  eyebrow: z.string().trim().max(80).optional().or(z.literal("")),
  excerpt: z.string().trim().max(320).optional().or(z.literal("")),
  content: z.string().trim().min(1).max(30000),
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

async function actor() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  if (!admin.role.permissions.some((p) => ["settings.manage", "pages.manage", "products.write"].includes(p.key)) && admin.role.name !== "SUPER ADMIN" && admin.role.name !== "ADMIN") return null;
  return admin;
}

export async function GET() {
  const admin = await actor();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const pages = await prisma.cmsPage.findMany({ orderBy: [{ status: "asc" }, { updatedAt: "desc" }] });
  return NextResponse.json({ pages });
}

export async function POST(request: Request) {
  const admin = await actor();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the page fields." }, { status: 400 });
  try {
    const page = await prisma.cmsPage.create({ data: parsed.data });
    await prisma.activityLog.create({ data: { adminUserId: admin.id, action: "CMS_PAGE_CREATED", entity: "CmsPage", entityId: page.id, metadata: { slug: page.slug } } });
    return NextResponse.json({ page }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "A page with this slug already exists." }, { status: 409 });
    console.error(error);
    return NextResponse.json({ error: "Could not create page." }, { status: 500 });
  }
}
