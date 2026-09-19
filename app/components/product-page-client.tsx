"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductImage from "@/app/components/product-image";
import styles from "./product-page-client.module.css";

type ProductImageItem = {
  url: string;
  alt?: string | null;
};

type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  price: number | string | null;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number | string;
  compareAtPrice: number | string | null;
  sku: string | null;
  category: { name: string; slug: string };
  images: ProductImageItem[];
  variants: ProductVariant[];
};

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string | null;
  alt: string;
};

const SIZE_GUIDE = [
  ["S", "36-38 in", "27-28 in"],
  ["M", "38-40 in", "28-29 in"],
  ["L", "40-42 in", "29-30 in"],
  ["XL", "42-44 in", "30-31 in"],
  ["XXL", "44-46 in", "31-32 in"],
];

function money(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Icon({
  name,
}: {
  name: "share" | "bag" | "truck" | "ruler";
}) {
  if (name === "share") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path d="m8.2 10.8 7.5-4.4M8.2 13.2l7.5 4.4" />
      </svg>
    );
  }

  if (name === "bag") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8h14l-1 12H6L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </svg>
    );
  }

  if (name === "truck") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="1.7" />
        <circle cx="18" cy="18" r="1.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8h14M7 5v6M17 5v6M4 15h16M4 12v7M20 12v7" />
    </svg>
  );
}

export default function ProductPageClient({
  product,
  relatedProducts = [],
}: {
  product: Product;
  relatedProducts?: RelatedProduct[];
}) {
  const router = useRouter();

  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id || "",
  );

  const [busy, setBusy] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [message, setMessage] = useState("");

  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);

  const images = product.images.length
    ? product.images
    : [{ url: "", alt: product.name }];

  const selectedVariant = useMemo(
    () =>
      product.variants.find(
        (variant) => variant.id === selectedVariantId,
      ) ||
      product.variants[0] ||
      null,
    [product.variants, selectedVariantId],
  );

  const currentPrice = Number(
    selectedVariant?.price ?? product.price,
  );

  const compareAtPrice = Number(
    product.compareAtPrice ?? 0,
  );

  const stock = selectedVariant?.stock ?? 0;
  const inStock = stock > 0;
  const maxQuantity = Math.max(1, stock);

  function changeQuantity(delta: number) {
    setQuantity((current) =>
      Math.min(
        maxQuantity,
        Math.max(1, current + delta),
      ),
    );
  }

  async function addToCart(goToCheckout = false) {
    setMessage("");

    if (!inStock) return;

    if (product.variants.length > 0 && !selectedVariantId) {
      setMessage("Please select a size first.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariantId || undefined,
          quantity,
        }),
      });

      const payload = await response
        .json()
        .catch(() => ({}));

      if (response.status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(
            window.location.pathname +
              window.location.search,
          )}`,
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to add this item to your bag.",
        );
      }

      if (goToCheckout) {
        router.push("/checkout");
      } else {
        setMessage("Added to cart.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function addToWishlist() {
    setMessage("");
    setWishlistBusy(true);

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      const payload = await response
        .json()
        .catch(() => ({}));

      if (response.status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(
            window.location.pathname +
              window.location.search,
          )}`,
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to add this item to your wishlist.",
        );
      }

      setMessage("Added to wishlist.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setWishlistBusy(false);
    }
  }

  function goToBag() {
    router.push("/bag");
  }

  async function shareProduct() {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          window.location.href,
        );

        setMessage("Product link copied.");
      }
    } catch {
      // Sharing was cancelled by the customer.
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.productHero}>
        <div className={styles.gallery}>
          <div
            className={styles.thumbs}
            aria-label="Product images"
          >
            {images.slice(0, 5).map((image, index) => (
              <button
                type="button"
                key={`${image.url}-${index}`}
                className={`${styles.thumb} ${
                  index === active
                    ? styles.thumbActive
                    : ""
                }`}
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1}`}
              >
                <ProductImage
                  src={image.url}
                  alt={image.alt || product.name}
                />
              </button>
            ))}
          </div>

          <div className={styles.mainImageWrap}>
            <ProductImage
              src={images[active]?.url}
              alt={
                images[active]?.alt ||
                product.name
              }
              className={styles.mainImage}
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.galleryArrow} ${styles.galleryPrev}`}
                  onClick={() =>
                    setActive(
                      (current) =>
                        (current - 1 + images.length) %
                        images.length,
                    )
                  }
                  aria-label="Previous product image"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className={`${styles.galleryArrow} ${styles.galleryNext}`}
                  onClick={() =>
                    setActive(
                      (current) =>
                        (current + 1) %
                        images.length,
                    )
                  }
                  aria-label="Next product image"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>

        <aside className={styles.info}>
          <div className={styles.breadcrumb}>
            <Link href="/shop">Shop</Link>
            <span>/</span>
            <Link
              href={`/category/${product.category.slug}`}
            >
              {product.category.name}
            </Link>
          </div>

          <h1 className={styles.title}>
            {product.name}
          </h1>

          <div className={styles.priceRow}>
            <strong>
              Rs. {money(currentPrice)}
            </strong>

            {compareAtPrice > currentPrice && (
              <del>
                Rs. {money(compareAtPrice)}
              </del>
            )}
          </div>

          <div className={styles.rule} />

          {product.variants.length > 0 && (
            <section className={styles.optionBlock}>
              <div className={styles.optionHead}>
                <span>Size</span>

                <button
                  type="button"
                  onClick={() =>
                    setSizeGuideOpen(
                      (open) => !open,
                    )
                  }
                >
                  <Icon name="ruler" />

                  <span>
                    {sizeGuideOpen
                      ? "Hide size chart"
                      : "Size Chart"}
                  </span>
                </button>
              </div>

              <div className={styles.sizeGrid}>
                {product.variants.map(
                  (variant) => (
                    <button
                      type="button"
                      key={variant.id}
                      className={`${styles.sizeButton} ${
                        selectedVariant?.id ===
                        variant.id
                          ? styles.sizeSelected
                          : ""
                      }`}
                      disabled={
                        variant.stock <= 0
                      }
                      onClick={() => {
                        setSelectedVariantId(
                          variant.id,
                        );
                        setQuantity(1);
                      }}
                    >
                      {variant.name}
                    </button>
                  ),
                )}
              </div>

              {sizeGuideOpen && (
                <div className={styles.sizeGuide}>
                  <div
                    className={styles.guideTitle}
                  >
                    ATELIER size guide
                  </div>

                  <div
                    className={
                      styles.guideTable
                    }
                  >
                    <div>SIZE</div>
                    <div>CHEST</div>
                    <div>BODY LENGTH</div>

                    {SIZE_GUIDE.map(
                      ([
                        size,
                        chest,
                        length,
                      ]) => (
                        <div
                          className={
                            styles.guideRow
                          }
                          key={size}
                        >
                          <span>
                            {size}
                          </span>
                          <span>
                            {chest}
                          </span>
                          <span>
                            {length}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          <div
            className={`${styles.stock} ${
              !inStock
                ? styles.stockOut
                : ""
            }`}
          >
            <span
              className={styles.stockDot}
            />

            <span>
              {inStock
                ? "In stock"
                : "Currently unavailable"}
            </span>
          </div>

          <p className={styles.covered}>
            We&apos;ve got you covered. Returns
            &amp; Exchanges accepted
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className={styles.shareButton}
              onClick={shareProduct}
            >
              <Icon name="share" />
              <strong>Share</strong>
            </button>

            <button
              type="button"
              className={styles.shareButton}
              onClick={addToWishlist}
              disabled={wishlistBusy}
            >
              <span
                aria-hidden="true"
                style={{
                  fontSize: "21px",
                  lineHeight: 1,
                }}
              >
                ♡
              </span>

              <strong>
                {wishlistBusy
                  ? "Adding..."
                  : "Add to wishlist"}
              </strong>
            </button>
          </div>

          <div className={styles.actionRow}>
            <div className={styles.quantityBox}>
              <button
                type="button"
                onClick={() =>
                  changeQuantity(-1)
                }
                aria-label="Decrease quantity"
              >
                -
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  changeQuantity(1)
                }
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              className={styles.addButton}
              type="button"
              disabled={
                busy || !inStock
              }
              onClick={() =>
                addToCart(false)
              }
            >
              <Icon name="bag" />

              <span>
                {busy
                  ? "Adding..."
                  : "Add to cart"}
              </span>
            </button>
          </div>

          <button
            className={styles.buyButton}
            type="button"
            disabled={
              busy || !inStock
            }
            onClick={() =>
              addToCart(true)
            }
          >
            Buy It Now
          </button>

         <button
  type="button"
  onClick={() => router.push("/cart")}
  style={{
    width: "100%",
    marginTop: "10px",
    padding: "14px 20px",
    border: "1px solid #111",
    borderRadius: "8px",
    background: "#fff",
    color: "#111",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  Go to Cart
</button>

          {message && (
            <p
              className={styles.message}
              role="status"
            >
              {message}
            </p>
          )}

          <div className={styles.paymentStrip}>
            <span>UPI</span>
            <span>RuPay</span>
            <span>VISA</span>
            <span>MC</span>

            <span
              className={styles.delivery}
            >
              <Icon name="truck" />
            </span>
          </div>

          <div
            className={styles.accordions}
          >
            <button
              type="button"
              onClick={() =>
                setDescriptionOpen(
                  (open) => !open,
                )
              }
            >
              <span>Description</span>

              <span>
                {descriptionOpen
                  ? "-"
                  : "+"}
              </span>
            </button>

            {descriptionOpen && (
              <div
                className={
                  styles.accordionBody
                }
              >
                {product.description}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setShippingOpen(
                  (open) => !open,
                )
              }
            >
              <span>Shipping</span>

              <span>
                {shippingOpen
                  ? "-"
                  : "+"}
              </span>
            </button>

            {shippingOpen && (
              <div
                className={
                  styles.accordionBody
                }
              >
                Shipping charges and
                delivery estimates are
                shown during checkout
                after your delivery
                address is entered.
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setReturnsOpen(
                  (open) => !open,
                )
              }
            >
              <span>
                Return policy
              </span>

              <span>
                {returnsOpen
                  ? "-"
                  : "+"}
              </span>
            </button>

            {returnsOpen && (
              <div
                className={
                  styles.accordionBody
                }
              >
                Returns and exchanges
                are subject to the
                store&apos;s published
                return policy.
              </div>
            )}
          </div>
        </aside>
      </section>

      {relatedProducts.length > 0 && (
        <section className={styles.related} aria-labelledby="related-products-title">
          <div className={styles.relatedHead}>
            <div><span className={styles.relatedKicker}>Keep exploring</span><h2 id="related-products-title">You may also like</h2></div>
            <Link href={`/category/${product.category.slug}`}>View the collection ↗</Link>
          </div>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((item) => (
              <Link href={`/product/${item.slug}`} className={styles.relatedCard} key={item.id}>
                <div className={styles.relatedImage}><ProductImage src={item.image} alt={item.alt} /></div>
                <div className={styles.relatedMeta}><div><span>{item.category}</span><strong>{item.name}</strong></div><b>Rs. {money(item.price)}</b></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}