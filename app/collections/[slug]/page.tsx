import Link from "next/link";
import ProductImage from "../../components/product-image";
import StoreHeader from "../../components/store-header";
import { getCollection, storefrontCollections } from "../../components/collection-grid";
import { getPublicCategoryPage as getCategory } from "@/lib/storefront-cache";
import styles from "./page.module.css";
import StoreFooter from "../../components/store-footer";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return storefrontCollections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  return {
    title: collection ? `${collection.name} — ATELIER` : "Collection — ATELIER",
    description: collection ? `Explore the ATELIER ${collection.name.toLowerCase()} collection.` : "Explore the ATELIER collection.",
  };
}

const tshirtImages = [
  "/images/tshirts/01-plain.jpg",
  "/images/tshirts/02-printed.jpg",
  "/images/tshirts/03-embroidered.jpg",
  "/images/tshirts/04-off-shoulder.jpg",
  "/images/tshirts/05-compression.jpg",
  "/images/tshirts/06-knitted.jpg",
  "/images/tshirts/07-polo.jpg",
  "/images/tshirts/08-boxy-fit-full-sleeves.jpg",
  "/images/tshirts/09-graphic-essential.jpg",
  "/images/tshirts/10-love-graphic.jpg",
  "/images/tshirts/11-classic-crew.jpg",
  "/images/tshirts/12-logo-statement.jpg",
  "/images/tshirts/13-bauhaus-print.jpg",
  "/images/tshirts/14-soft-studio.jpg",
  "/images/tshirts/15-street-edition.jpg",
  "/images/tshirts/16-everyday-oversized.jpg",
];

const tshirtDesigns = [
  "Graphic Essential",
  "Love Graphic",
  "Classic Crew",
  "Logo Statement",
  "Bauhaus Print",
  "Soft Studio",
  "Street Edition",
  "Everyday Oversized",
];

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) {
    return (
      <>
        <StoreHeader />
        <main className={styles.notFound}><div className="eyebrow">ATELIER COLLECTIONS</div><h1>Collection not found.</h1><Link href="/#collections">Back to collections</Link></main>
        <StoreFooter />
      </>
    );
  }

  const isTshirts = collection.slug === "t-shirts";
  const tshirtCategory = isTshirts ? await getCategory("t-shirts") : null;
  const findProductSlug = (term: string) => {
    const needle = term.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
    const product = tshirtCategory?.products.find((item) => {
      const haystack = `${item.name} ${item.shortDescription || ""} ${item.description}`.toLowerCase();
      return haystack.includes(needle);
    });
    return product?.slug || null;
  };
  const styleImages = isTshirts ? tshirtImages.slice(0, 8) : collection.subs.map((_, index) => collection.image);

  return (
    <>
      <StoreHeader />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <Link href="/#collections" className={styles.back}>← Collections</Link>
            <div className="eyebrow">{collection.kicker}</div>
            <h1>{collection.name}</h1>
            <p>Explore the collection through its different silhouettes, materials and everyday expressions.</p>
          </div>
          <div className={styles.heroImage}><ProductImage src={isTshirts ? tshirtImages[0] : collection.image} alt={collection.name} /></div>
        </section>

        <section className={styles.stylesSection}>
          <div className={styles.sectionHead}>
            <div><div className="eyebrow">Explore {collection.name}</div><h2>{isTshirts ? "16 looks" : `${collection.subs.length} edits`}</h2></div>
            <Link href={`/category/${collection.slug}`} className={styles.shopLink}>Browse all {collection.name} →</Link>
          </div>

          <div className={styles.subGrid}>
            {isTshirts ? (
              <>
                {collection.subs.map((sub, index) => {
                  const image = tshirtImages[index];
                  const productSlug = findProductSlug(sub);
                  const href = productSlug ? `/product/${productSlug}` : `/category/${collection.slug}?style=${encodeURIComponent(sub)}`;
                  return (
                    <Link href={href} key={`style-${sub}`} className={styles.subCard}>
                      <div className={styles.subMedia}><ProductImage src={image} alt={sub} /><span>{String(index + 1).padStart(2, "0")}</span></div>
                      <div className={styles.subMeta}><h3>{sub}</h3><span>Explore ↗</span></div>
                    </Link>
                  );
                })}
                {tshirtDesigns.map((design, index) => {
                  const image = tshirtImages[index + 8];
                  const productSlug = findProductSlug(design);
                  const href = productSlug ? `/product/${productSlug}` : `/category/${collection.slug}?design=${encodeURIComponent(design)}`;
                  return (
                    <Link href={href} key={`design-${design}`} className={styles.subCard}>
                      <div className={styles.subMedia}><ProductImage src={image} alt={design} /><span>{String(index + 9).padStart(2, "0")}</span></div>
                      <div className={styles.subMeta}><h3>{design}</h3><span>Explore ↗</span></div>
                    </Link>
                  );
                })}
              </>
            ) : (
              collection.subs.map((sub, index) => {
                const image = styleImages[index];
                return (
                  <Link href={`/category/${collection.slug}`} key={`${collection.slug}-${sub}-${index}`} className={styles.subCard}>
                    <div className={styles.subMedia}><ProductImage src={image} alt={sub} /><span>{String(index + 1).padStart(2, "0")}</span></div>
                    <div className={styles.subMeta}><h3>{sub}</h3><span>Explore ↗</span></div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </main>
      <StoreFooter />
    </>
  );
}
