"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./shop-drawer.module.css";

type Tab = "men" | "women" | "sneakers";

type ShopCard = {
  name: string;
  slug: string;
  eyebrow: string;
  image: string;
};

type Category = {
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: string[];
};

const shopAllData: Record<Tab, ShopCard[]> = {
  women: [
    {
      name: "New Arrivals",
      slug: "new-arrivals",
      eyebrow: "NEW",
      image:
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "Office Edit",
      slug: "office-edit",
      eyebrow: "OFFICE",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "Bestsellers",
      slug: "bestsellers",
      eyebrow: "BEST",
      image:
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "Loungewear",
      slug: "loungewear",
      eyebrow: "LOUNGE",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "Petite",
      slug: "petite",
      eyebrow: "PETITE",
      image:
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=520&q=85",
    },
  ],
  men: [
    {
      name: "New Arrivals",
      slug: "new-arrivals",
      eyebrow: "NEW",
      image:
        "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "Casual Edit",
      slug: "casual",
      eyebrow: "CASUAL",
      image:
        "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "Shirts",
      slug: "shirts",
      eyebrow: "SHIRTS",
      image:
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "T-Shirts",
      slug: "t-shirts",
      eyebrow: "TEES",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "Bottomwear",
      slug: "bottomwear",
      eyebrow: "DENIM",
      image:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=520&q=85",
    },
  ],
  sneakers: [
    {
      name: "Latest",
      slug: "latest-sneakers",
      eyebrow: "01",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "Lifestyle",
      slug: "lifestyle",
      eyebrow: "02",
      image:
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "Running",
      slug: "running",
      eyebrow: "03",
      image:
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "High Tops",
      slug: "high-tops",
      eyebrow: "04",
      image:
        "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=520&q=85",
    },
    {
      name: "Bestsellers",
      slug: "sneaker-bestsellers",
      eyebrow: "05",
      image:
        "https://images.unsplash.com/photo-1554134840-4b5d6b4f7a4b?auto=format&fit=crop&w=520&q=85",
    },
  ],
};

const categories: Category[] = [
  {
    name: "T-Shirts",
    slug: "t-shirts",
    description: "A focused edit of everyday tees, statement silhouettes and considered essentials.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    subcategories: [
      "plain",
      "printed",
      "embrodided",
      "off-shoulder",
      "compression",
      "knitted",
      "polo",
      "boxy-fit-fullsleeves",
    ],
  },
  {
    name: "Shirts",
    slug: "shirts",
    description: "Clean shirting across relaxed, tailored and fabric-led silhouettes.",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
    subcategories: [
      "lining",
      "plain",
      "stripped",
      "printed",
      "boxy",
      "check",
      "pin-check",
      "linen",
      "half-sleeve-linen",
      "deniem",
    ],
  },
  {
    name: "Lowers",
    slug: "lowers",
    description: "Relaxed lower silhouettes built around comfort, movement and modern proportions.",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
    subcategories: [
      "parachute",
      "linen",
      "joggers",
      "cotton",
    ],
  },
  {
    name: "Jeans",
    slug: "jeans",
    description: "Denim organised by fit, attitude and everyday styling direction.",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=85",
    subcategories: [
      "boot-cut",
      "straight fit",
      "formal",
      "narrow",
      "baggy",
      "damaged",
      "cargos",
    ],
  },
];

const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

export default function ShopDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [tab, setTab] = useState<Tab>("women");
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedShopCard, setSelectedShopCard] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      document.body.style.overflow = "hidden";
      return;
    }

    if (!mounted) return;

    setClosing(true);
    const timer = window.setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = "";
    }, 340);

    return () => window.clearTimeout(timer);
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  useEffect(() => {
    if (!open) return;
    setSelectedCategory(null);
    setSelectedShopCard(null);
    setSelectedSubcategory(null);
  }, [open, tab]);

  const shopCards = shopAllData[tab];
  const selectedCategoryData = selectedCategory
    ? categoryBySlug.get(selectedCategory) ?? null
    : null;
  const selectedShop = useMemo(
    () => shopCards.find((card) => card.slug === selectedShopCard) ?? null,
    [shopCards, selectedShopCard],
  );

  if (!mounted) return null;

  const stayOnPage = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return createPortal(
    <div className={`${styles.root} ${closing ? styles.isClosing : ""}`}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close shop menu"
        onClick={onClose}
      />

      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Shop menu"
      >
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeading}>
            <span className={styles.kicker}>THE COLLECTION</span>
            <div className={styles.drawerTitle}>Shop</div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close shop menu"
          >
            <span />
            <span />
          </button>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Shop departments">
          {(["men", "women", "sneakers"] as Tab[]).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className={`${styles.tab} ${tab === item ? styles.activeTab : ""}`}
              onClick={() => setTab(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.sectionHeaderStatic}>
              <span>Shop All</span>
              <span className={styles.chevronUp}>⌃</span>
            </div>

            <div className={styles.cardRail}>
              {shopCards.map((card) => {
                const active = selectedShopCard === card.slug;

                return (
                  <button
                    key={`${tab}-${card.slug}`}
                    type="button"
                    className={`${styles.card} ${active ? styles.cardActive : ""}`}
                    onClick={() => {
                      setSelectedShopCard(active ? null : card.slug);
                      setSelectedCategory(null);
                    }}
                  >
                    <span
                      className={styles.cardVisual}
                      style={{ backgroundImage: `url("${card.image}")` }}
                    >
                      <span className={styles.cardOverlay} />
                      <span className={styles.cardMark}>{card.eyebrow}</span>
                    </span>
                    <span className={styles.cardName}>{card.name}</span>
                  </button>
                );
              })}
            </div>

            <div className={`${styles.detailPanel} ${selectedShop ? styles.detailPanelOpen : ""}`}>
              {selectedShop && (
                <div className={styles.detailPanelInner}>
                  <div
                    className={styles.detailImage}
                    style={{ backgroundImage: `url("${selectedShop.image}")` }}
                  />
                  <div className={styles.detailCopy}>
                    <span className={styles.detailEyebrow}>{selectedShop.eyebrow}</span>
                    <h3>{selectedShop.name}</h3>
                    <p>Explore the edit, silhouettes and pieces selected for the current collection.</p>
                    <button type="button" className={styles.detailAction} onClick={stayOnPage}>
                      Browse selection <span>↗</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={() => setCategoriesOpen((value) => !value)}
            >
              <span>Categories</span>
              <span className={styles.chevron}>{categoriesOpen ? "⌃" : "⌄"}</span>
            </button>

            <div className={`${styles.categoryList} ${categoriesOpen ? styles.categoryListOpen : ""}`}>
              {categories.map((category) => {
                const active = selectedCategory === category.slug;

                return (
                  <div key={category.slug} className={styles.categoryItem}>
                    <button
                      type="button"
                      className={`${styles.categoryButton} ${active ? styles.categoryButtonActive : ""}`}
                      onClick={() => {
                        setSelectedCategory(active ? null : category.slug);
                        setSelectedShopCard(null);
                        setSelectedSubcategory(null);
                      }}
                      aria-expanded={active}
                    >
                      <span>{category.name}</span>
                      <span className={styles.categoryArrow}>{active ? "−" : "+"}</span>
                    </button>

                    <div className={`${styles.categoryDrawer} ${active ? styles.categoryDrawerOpen : ""}`}>
                      {active && (
                        <div className={styles.categoryDrawerInner}>
                          <div
                            className={styles.categoryPhoto}
                            style={{ backgroundImage: `url("${category.image}")` }}
                          />
                          <div className={styles.categoryDetail}>
                            <span className={styles.detailEyebrow}>ATELIER EDIT</span>
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                            <div className={styles.subcategoryGrid}>
                              {category.subcategories.map((subcategory) => (
                                <button
                                  type="button"
                                  key={subcategory}
                                  onClick={() =>
                                    setSelectedSubcategory(
                                      selectedSubcategory === `${category.slug}:${subcategory}`
                                        ? null
                                        : `${category.slug}:${subcategory}`,
                                    )
                                  }
                                  className={
                                    selectedSubcategory === `${category.slug}:${subcategory}`
                                      ? styles.subcategoryActive
                                      : undefined
                                  }
                                >
                                  {subcategory}
                                  <span>{selectedSubcategory === `${category.slug}:${subcategory}` ? "✓" : "↗"}</span>
                                </button>
                              ))}
                            </div>
                            <div className={styles.selectionNote} aria-live="polite">
                              {selectedSubcategory?.startsWith(`${category.slug}:`)
                                ? `Selected: ${selectedSubcategory.split(":")[1]}`
                                : "Select a style to preview the category direction."}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className={styles.quickLinks}>
            <button type="button" onClick={stayOnPage}>New Arrivals</button>
            <button type="button" onClick={stayOnPage}>Bestsellers</button>
            <button type="button" onClick={stayOnPage}>Sale</button>
            <button type="button" onClick={stayOnPage}>Request a Quote</button>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
