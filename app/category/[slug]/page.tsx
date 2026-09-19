import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StoreHeader from "@/app/components/store-header";
import StoreFooter from "@/app/components/store-footer";
import MobileNav from "@/app/components/mobile-nav";
import ProductImage from "@/app/components/product-image";
import WishlistButton from "@/app/components/wishlist-button";
import styles from "./category-page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return { title: "Collection not found", robots: { index: false, follow: false } };
  }

  return {
    title: `${category.name} — ATELIER`,
    description: category.description?.trim() || `Explore the ${category.name} collection at ATELIER.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "ACTIVE" },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        include: {
          category: { select: { name: true } },
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

  if (!category) notFound();

  return (
    <>
      <StoreHeader />

      <main className={styles.categoryShell}>
        {/* Split Editorial Hero Header (Screenshot 4 Style) */}
        <section className={styles.heroSection}>
          <div className={styles.heroCopy}>
            <Link href="/#collections" className={styles.backLink}>
              ← Collections
            </Link>
            <div className={styles.eyebrow}>EVERYDAY FORMS</div>
            <h1 className={styles.title}>{category.name}</h1>
            <p className={styles.description}>
              {category.description || "Considered essentials arranged for easy discovery."}
            </p>
            <div className={styles.countBadge}>
              <strong>{category.products.length}</strong> {category.products.length === 1 ? "PIECE" : "PIECES"} IN VIEW
            </div>
          </div>

          <div className={styles.heroImageWrap}>
            <ProductImage
              src={category.imageUrl}
              alt={category.name}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className={styles.heroImg}
            />
          </div>
        </section>

        {/* Product Catalog Grid */}
        <section className={styles.catalogSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>All {category.name}</h2>
            <Link href="/shop" className={styles.browseAllLink}>
              Browse Full Catalog →
            </Link>
          </div>

          {category.products.length > 0 ? (
            <div className={styles.productGrid}>
              {category.products.map((product) => {
                const primary = product.images[0]?.url || category.imageUrl;
                const secondary = product.images[1]?.url || primary;
                const inStock = product.variants.some((v) => v.stock > 0);

                return (
                  <article key={product.id} className={styles.productCard}>
                    <div className={styles.cardMediaWrap}>
                      <Link href={`/product/${product.slug}`} className={styles.cardLink}>
                        <ProductImage
                          src={primary}
                          alt={product.images[0]?.alt || product.name}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className={styles.primaryImg}
                        />
                        {secondary && (
                          <ProductImage
                            src={secondary}
                            alt={`${product.name} alternate`}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className={styles.secondaryImg}
                          />
                        )}
                      </Link>

                      {product.featured && <span className={styles.featuredBadge}>Featured</span>}
                      {!inStock && <span className={styles.soldOutBadge}>Sold Out</span>}

                      <div className={styles.wishlistWrap}>
                        <WishlistButton productId={product.id} initialWishlisted={false} compact />
                      </div>
                    </div>

                    <Link href={`/product/${product.slug}`} className={styles.cardInfoLink}>
                      <div className={styles.cardTitle}>{product.name}</div>
                      <div className={styles.cardCategory}>{product.category.name}</div>
                      <div className={styles.priceRow}>
                        <span className={styles.price}>
                          ₹{Number(product.price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                        {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                          <del className={styles.delPrice}>
                            ₹{Number(product.compareAtPrice).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </del>
                        )}
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No products currently available in this collection.</p>
              <Link href="/shop" className={styles.emptyCta}>
                Explore Other Collections
              </Link>
            </div>
          )}
        </section>
      </main>

      <StoreFooter />
      <MobileNav />
    </>
  );
}
