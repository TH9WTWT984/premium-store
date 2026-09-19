import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

async function fetchPublicProductPage(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      category: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      _count: { select: { reviews: true } },
    },
  });
}

export const getPublicProductPage = (slug: string) =>
  unstable_cache(
    () => fetchPublicProductPage(slug),
    ["public-product-page", slug],
    { revalidate: 300, tags: ["public-products", `product:${slug}`] },
  )();

async function fetchPublicCategoryPage(slug: string) {
  return prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      products: {
        where: { status: "ACTIVE" },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        include: {
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 2,
          },
          variants: {
            where: { isActive: true },
            select: { stock: true },
          },
        },
      },
    },
  });
}

export const getPublicCategoryPage = (slug: string) =>
  unstable_cache(
    () => fetchPublicCategoryPage(slug),
    ["public-category-page", slug],
    { revalidate: 300, tags: ["public-categories", `category:${slug}`] },
  )();
