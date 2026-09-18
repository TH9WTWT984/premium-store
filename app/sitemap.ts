import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.cmsPage.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }).catch(() => []),
  ]);

  const staticRoutes: Array<{
    route: string;
    changeFrequency: "daily" | "monthly";
    priority: number;
  }> = [
    { route: "/", changeFrequency: "daily", priority: 1 },
    { route: "/shop", changeFrequency: "daily", priority: 0.9 },
    { route: "/about", changeFrequency: "monthly", priority: 0.5 },
    { route: "/faq", changeFrequency: "monthly", priority: 0.5 },
    { route: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { route: "/shipping", changeFrequency: "monthly", priority: 0.5 },
    { route: "/returns", changeFrequency: "monthly", priority: 0.5 },
    { route: "/privacy", changeFrequency: "monthly", priority: 0.5 },
    { route: "/terms", changeFrequency: "monthly", priority: 0.5 },
    { route: "/refund", changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticRoutes.map((item) => ({
      url: `${baseUrl}${item.route}`,
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })),
    ...categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...pages
      .filter((page) => page.slug)
      .map((page) => ({
        url: `${baseUrl}/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
  ];
}
