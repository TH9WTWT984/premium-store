import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StoreHeader from "@/app/components/store-header";
import CatalogBrowser from "@/app/components/catalog-browser";
import styles from "@/app/components/catalog-browser.module.css";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  min?: string;
  max?: string;
  stock?: string;
  page?: string;
};

const PAGE_SIZE = 12;

function toNumber(value?: string) {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toPage(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function safeSort(value?: string) {
  return value === "newest" ||
    value === "price-asc" ||
    value === "price-desc"
    ? value
    : "featured";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const category = params.category?.trim() || "";
  const min = toNumber(params.min);
  const max = toNumber(params.max);
  const inStock = params.stock === "1";
  const sort = safeSort(params.sort);
  const requestedPage = toPage(params.page);

  const where = {
    status: "ACTIVE" as const,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            {
              shortDescription: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(category
      ? {
          category: {
            slug: category,
            isActive: true,
          },
        }
      : {}),
    ...(min !== undefined || max !== undefined
      ? {
          price: {
            ...(min !== undefined ? { gte: min } : {}),
            ...(max !== undefined ? { lte: max } : {}),
          },
        }
      : {}),
    ...(inStock
      ? {
          variants: {
            some: {
              isActive: true,
              stock: { gt: 0 },
            },
          },
        }
      : {}),
  };

  const orderBy =
    sort === "price-asc"
      ? [{ price: "asc" as const }]
      : sort === "price-desc"
        ? [{ price: "desc" as const }]
        : sort === "newest"
          ? [{ createdAt: "desc" as const }]
          : [{ featured: "desc" as const }, { createdAt: "desc" as const }];

  const [totalProducts, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: PAGE_SIZE,
    include: {
      category: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
      variants: {
        where: { isActive: true },
        select: { stock: true },
      },
    },
  });

  const startItem = totalProducts === 0 ? 0 : skip + 1;
  const endItem = Math.min(skip + products.length, totalProducts);

  return (
    <>
      <StoreHeader />

      <main className={styles.catalogPageShell}>
        <section className={styles.catalogHero}>
          <div className={styles.catalogBreadcrumb}>
            <Link href="/">Home</Link>
            <span>→</span>
            <strong>{q ? "Search" : "Shop"}</strong>
          </div>

          <div className={styles.catalogHeroContent}>
            <div>
              <div className={styles.catalogEyebrow}>The collection</div>
              <h1 className="serif">
                {q ? (
                  <>
                    Results for <em>“{q}”</em>
                  </>
                ) : (
                  "Shop the collection."
                )}
              </h1>
              <p>
                A considered edit of garments and everyday pieces, arranged for
                easy discovery.
              </p>
            </div>

            <div className={styles.catalogHeroNote}>
              <span>CATALOG</span>
              <strong>{totalProducts.toString().padStart(2, "0")}</strong>
              <small>{totalProducts === 1 ? "piece" : "pieces"} in view</small>
            </div>
          </div>
        </section>

        <CatalogBrowser
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: Number(product.price),
            compareAtPrice: product.compareAtPrice
              ? Number(product.compareAtPrice)
              : null,
            featured: product.featured,
            category: product.category.name,
            categorySlug: product.category.slug,
            image:
              product.images[0]?.url ||
              product.category.imageUrl ||
              null,
            alt: product.images[0]?.alt || product.name,
            inStock: product.variants.some((variant) => variant.stock > 0),
          }))}
          categories={categories}
          current={{
            q,
            category,
            sort,
            min,
            max,
            inStock,
            page: currentPage,
          }}
          pagination={{
            currentPage,
            totalPages,
            totalProducts,
            startItem,
            endItem,
          }}
        />
      </main>
    </>
  );
}
