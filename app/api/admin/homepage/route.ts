import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  announcement: z.string().trim().max(8000),
  heroEyebrow: z.string().trim().max(100),
  heroTitle: z.string().trim().min(2).max(180),
  heroExcerpt: z.string().trim().max(500),
  heroCtaLabel: z.string().trim().max(60),
  heroCtaHref: z.string().trim().max(200),
  heroImageUrl: z.string().trim().max(500).or(z.literal("")),
  collectionEyebrow: z.string().trim().max(100),
  collectionTitle: z.string().trim().max(140),
  collectionLinkLabel: z.string().trim().max(60),
  storyEyebrow: z.string().trim().max(100),
  storyTitle: z.string().trim().max(140),
  storyExcerpt: z.string().trim().max(500),
  storyCtaLabel: z.string().trim().max(60),
  storyCtaHref: z.string().trim().max(200),
  newsletterEyebrow: z.string().trim().max(100),
  newsletterTitle: z.string().trim().max(140),
  newsletterText: z.string().trim().max(300),
  newsletterButtonLabel: z.string().trim().max(60),
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
  const homepage = await prisma.cmsHomepage.findUnique({ where: { id: "home" } });
  return NextResponse.json({ homepage });
}

export async function PATCH(request: Request) {
  const admin = await actor();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the homepage fields." }, { status: 400 });
  const homepage = await prisma.cmsHomepage.upsert({ where: { id: "home" }, create: { id: "home", ...parsed.data }, update: parsed.data });
  await prisma.activityLog.create({ data: { adminUserId: admin.id, action: "CMS_HOMEPAGE_UPDATED", entity: "CmsHomepage", entityId: homepage.id, metadata: { changed: "homepage_content" } } });
  return NextResponse.json({ homepage });
}
