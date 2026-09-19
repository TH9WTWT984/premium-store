"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./catalog-browser.module.css";
import WishlistButton from "./wishlist-button";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  featured: boolean;
  category: string;
  categorySlug: string;
  image: string | null;
  alt: string;
  inStock: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

type Current = {
  q: string;
  category: string;
  style?: string;
  sort: string;
  min?: number;
  max?: number;
  inStock: boolean;
  page: number;
};

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  startItem: number;
  endItem: number;
};

function hrefFor(current: Current, patch: Partial<Current>, basePath = "/shop") {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  if (next.category && basePath === "/shop") params.set("category", next.category);
  if (next.style) params.set("style", next.style);
  if (next.sort && next.sort !== "featured") {
    params.set("sort", next.sort);
  }
  if (next.min !== undefined) params.set("min", String(next.min));
  if (next.max !== undefined) params.set("max", String(next.max));
  if (next.inStock) params.set("stock", "1");
  if (next.page > 1) params.set("page", String(next.page));

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function pageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ];
}

export default function CatalogBrowser({
  products,
  categories,
  current,
  pagination,
  basePath = "/shop",
}: {
  products: Product[];
  categories: Category[];
  current: Current;
  pagination: Pagination;
  basePath?: string;
}) {
  const [mobileFilters, setMobileFilters] = useState(false);

  const activeLabel = useMemo(() => {
    if (current.category) {
      return (
        categories.find((item) => item.slug === current.category)?.name ||
        "Collection"
      );
    }
    return "All pieces";
  }, [categories, current.category]);

  const clearHref = hrefFor(
    {
      q: "",
      category: "",
      sort: "featured",
      min: undefined,
      max: undefined,
      inStock: false,
      page: 1,
    },
    {},
  );

  const pages = pageItems(pagination.currentPage, pagination.totalPages);
  const makeHref = (patch: Partial<Current>) => hrefFor(current, patch, basePath);

  return (
    <section className={styles.wrapper}>
      <div className={styles.categoryRail}>
        <div className={styles.categoryIntro}>
          <span>Explore</span>
          <strong>Collections</strong>
        </div>

        <Link
          className={!current.category ? styles.categoryActive : ""}
          href={basePath === "/shop" ? makeHref({ category: "", page: 1 }) : "/shop"}
        >
          All
        </Link>

        {categories.map((category) => (
          <Link
            href={
              basePath === "/shop"
                ? makeHref({ category: category.slug, page: 1 })
                : `/shop?category=${encodeURIComponent(category.slug)}`
            }
            className={
              current.category === category.slug
                ? styles.categoryActive
                : ""
            }
            key={category.id}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.resultText}>
          <span>{activeLabel}</span>
          <strong>
            {pagination.totalProducts}{" "}
            {pagination.totalProducts === 1 ? "piece" : "pieces"}
          </strong>
        </div>

        <div className={styles.toolbarRight}>
          <button
            type="button"
            className={styles.mobileFilterButton}
            onClick={() => setMobileFilters((value) => !value)}
          >
            {mobileFilters ? "Hide filters" : "Filter & refine"}
          </button>

          <label className={styles.sort}>
            <span>Sort</span>
            <select
              value={current.sort}
              onChange={(event) =>
                window.location.assign(
                  makeHref({
                    sort: event.target.value,
                    page: 1,
                  }),
                )
              }
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
            </select>
          </label>
        </div>
      </div>

      <div
        className={`${styles.filterPanel} ${
          mobileFilters ? styles.filterOpen : ""
        }`}
      >
        <div>
          <span>Price</span>
          <div className={styles.filterLinks}>
            <Link
              className={
                current.min === undefined && current.max === undefined
                  ? styles.activeFilter
                  : ""
              }
              href={makeHref({
                min: undefined,
                max: undefined,
                page: 1,
              })}
            >
              All
            </Link>

            <Link
              className={
                current.max === 1999 ? styles.activeFilter : ""
              }
              href={makeHref({
                min: undefined,
                max: 1999,
                page: 1,
              })}
            >
              Under ₹2,000
            </Link>

            <Link
              className={
                current.min === 2000 && current.max === 3999
                  ? styles.activeFilter
                  : ""
              }
              href={makeHref({
                min: 2000,
                max: 3999,
                page: 1,
              })}
            >
              ₹2,000–₹3,999
            </Link>

            <Link
              className={
                current.min === 4000 ? styles.activeFilter : ""
              }
              href={makeHref({
                min: 4000,
                max: undefined,
                page: 1,
              })}
            >
              ₹4,000+
            </Link>
          </div>
        </div>

        <div>
          <span>Availability</span>
          <div className={styles.filterLinks}>
            <Link
              className={!current.inStock ? styles.activeFilter : ""}
              href={makeHref({ inStock: false, page: 1 })}
            >
              All
            </Link>

            <Link
              className={current.inStock ? styles.activeFilter : ""}
              href={makeHref({ inStock: true, page: 1 })}
            >
              In stock
            </Link>
          </div>
        </div>

        {(current.q ||
          current.category ||
          current.min !== undefined ||
          current.max !== undefined ||
          current.inStock) && (
          <Link href={clearHref} className={styles.clear}>
            Clear all ↗
          </Link>
        )}
      </div>

      <div className={styles.catalogMeta}>
        <span>
          {pagination.totalProducts === 0
            ? "No pieces"
            : `Showing ${pagination.startItem}–${pagination.endItem} of ${pagination.totalProducts}`}
        </span>

        {pagination.totalPages > 1 && (
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        )}
      </div>

      <div className={styles.grid}>
        {products.map((product, index) => (
          <div className={styles.productWrap} key={product.id}>
          <Link href={`/product/${product.slug}`} className={styles.product}>
            <div className={styles.image}>
              {product.image ? (
                <img src={product.image} alt={product.alt} />
              ) : (
                <div className={styles.placeholder}>ATELIER</div>
              )}

              <span className={styles.index}>
                {String(
                  (pagination.currentPage - 1) * 12 + index + 1,
                ).padStart(2, "0")}
              </span>

              {product.featured && (
                <span className={styles.featured}>Featured</span>
              )}

              {!product.inStock && (
                <span className={styles.soldOut}>Out of stock</span>
              )}
            </div>

            <div className={styles.productMeta}>
              <div>
                <span>{product.category}</span>
                <strong>{product.name}</strong>
              </div>

              <div className={styles.price}>
                <strong>
                  ₹{product.price.toLocaleString("en-IN")}
                </strong>

                {product.compareAtPrice &&
                  product.compareAtPrice > product.price && (
                    <del>
                      ₹
                      {product.compareAtPrice.toLocaleString(
                        "en-IN",
                      )}
                    </del>
                  )}
              </div>
            </div>
          </Link>
          <WishlistButton productId={product.id} initialWishlisted={false} compact />
          </div>
        ))}

        {!products.length && (
          <div className={styles.empty}>
            <span>NO MATCHES</span>
            <h2>Nothing in this edit.</h2>
            <p>
              Try a different search, category, price range or
              availability filter.
            </p>
            <Link
              href="/shop"
              className={styles.emptyLink}
            >
              View all pieces ↗
            </Link>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <nav
          className={styles.pagination}
          aria-label="Product pagination"
        >
          <Link
            className={`${styles.pageArrow} ${
              pagination.currentPage === 1
                ? styles.pageDisabled
                : ""
            }`}
            href={makeHref({
              page: Math.max(1, pagination.currentPage - 1),
            })}
            aria-disabled={pagination.currentPage === 1}
          >
            ← Previous
          </Link>

          <div className={styles.pageNumbers}>
            {pages.map((item, index) =>
              typeof item === "string" ? (
                <span
                  className={styles.ellipsis}
                  key={`${item}-${index}`}
                >
                  …
                </span>
              ) : (
                <Link
                  key={item}
                  href={makeHref({ page: item })}
                  className={
                    item === pagination.currentPage
                      ? styles.pageActive
                      : styles.pageNumber
                  }
                  aria-current={
                    item === pagination.currentPage
                      ? "page"
                      : undefined
                  }
                >
                  {String(item).padStart(2, "0")}
                </Link>
              ),
            )}
          </div>

          <Link
            className={`${styles.pageArrow} ${
              pagination.currentPage === pagination.totalPages
                ? styles.pageDisabled
                : ""
            }`}
            href={makeHref({
              page: Math.min(
                pagination.totalPages,
                pagination.currentPage + 1,
              ),
            })}
            aria-disabled={
              pagination.currentPage === pagination.totalPages
            }
          >
            Next →
          </Link>
        </nav>
      )}
    </section>
  );
}
