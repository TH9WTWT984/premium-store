import Link from "next/link";
import { isVisibleStorefrontCategory } from "@/lib/storefront-categories";
import ProductImage from "./product-image";
import styles from "./collection-grid.module.css";

export type StoreCategory = { id: string; name: string; slug: string; description?: string | null; imageUrl?: string | null; isActive?: boolean };
type EditorialCollection = { slug: string; name: string; kicker: string; image: string; subs: string[] };

export const storefrontCollections: EditorialCollection[] = [
  { slug: "t-shirts", name: "T-Shirts", kicker: "Everyday forms", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=85", subs: ["plain", "printed", "embroidered", "off-shoulder", "compression", "knitted", "polo", "boxy-fit-full-sleeves"] },
  { slug: "shirts", name: "Shirts", kicker: "Refined layers", image: "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1400&q=85", subs: ["lining", "plain", "stripped", "printed", "boxy", "check", "pin-check", "linen", "half-sleeve-linen", "deniem"] },
  { slug: "polos", name: "Polos", kicker: "Quiet structure", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1400&q=85", subs: ["classic", "knitted", "textured", "relaxed"] },
  { slug: "jeans", name: "Jeans", kicker: "Denim essentials", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1400&q=85", subs: ["boot-cut", "straight fit", "formal", "narrow", "baggy", "damaged", "cargos"] },
  { slug: "lowers", name: "Lowers", kicker: "Easy movement", image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1400&q=85", subs: ["parachute", "linen", "joggers", "cotton"] },
  { slug: "joggers", name: "Joggers", kicker: "Off-duty comfort", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1400&q=85", subs: ["everyday", "cargo", "relaxed", "tapered"] },
  { slug: "sneakers", name: "Sneakers", kicker: "Built to move", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=85", subs: ["low-top", "high-top", "classic", "statement"] },
  { slug: "linen", name: "Linen", kicker: "Lightweight essentials", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=85", subs: ["shirts", "half-sleeve", "trousers", "resort"] },
  { slug: "outerwear", name: "Outerwear", kicker: "For changing days", image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1400&q=85", subs: ["jackets", "overshirts", "lightweight", "statement"] },
];

export function getCollection(slug: string) {
  return storefrontCollections.find((item) => item.slug === slug);
}

export function CollectionGrid({ categories }: { categories: StoreCategory[] }) {
  const visibleCategories = categories.filter((category) => isVisibleStorefrontCategory(category.slug));

  return (
    <div className={styles.wrap}>
      <div className={styles.rule} />
      <div className={styles.grid}>
        {visibleCategories.map((category, index) => {
          return (
            <Link key={category.id} href={`/collections/${category.slug}`} className={styles.card}>
              <div className={styles.media}>
                <ProductImage src={category.imageUrl} alt={category.name} />
                <div className={styles.scrim} />
                <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.arrow} aria-hidden="true">↗</span>
                <div className={styles.caption}>
                  <span className={styles.kicker}>Collection</span>
                  <h3>{category.name}</h3>
                  <span className={styles.count}>{category.description || "Explore the collection"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
