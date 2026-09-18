import { prisma } from "@/lib/prisma";

export async function getActiveProducts(options?: {
  categorySlug?: string;
  query?: string;
  featuredOnly?: boolean;
  limit?: number;
}) {
  const query = options?.query?.trim();

  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(options?.featuredOnly ? { featured: true } : {}),
      ...(options?.categorySlug
        ? { category: { slug: options.categorySlug, isActive: true } }
        : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
              { shortDescription: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    ...(options?.limit ? { take: options.limit } : {}),
    include: {
      category: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { reviews: true } },
    },
  });
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getProductBySlug(slug: string) {
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
