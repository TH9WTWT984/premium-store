"use client";

import { useState, useMemo, useEffect } from "react";
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
  price: number | null;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  category: { name: string; slug: string };
  images: ProductImageItem[];
  variants: ProductVariant[];
};

type VariantLook = {
  id: string;
  name: string;
  slug: string;
  image: string;
  active: boolean;
};

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  primaryImage: string | null;
  secondaryImage: string | null;
  alt: string;
};

const CLOTHING_SIZE_CHART = [
  ["S", "38 in", "28 in", "17.5 in"],
  ["M", "40 in", "29 in", "18.5 in"],
  ["L", "42 in", "30 in", "19.5 in"],
  ["XL", "44 in", "31 in", "20.5 in"],
  ["XXL", "46 in", "32 in", "21.5 in"],
];

const FOOTWEAR_SIZE_CHART = [
  ["UK 6", "EU 40", "US 7", "25.4 cm"],
  ["UK 7", "EU 41", "US 8", "26.0 cm"],
  ["UK 8", "EU 42", "US 9", "26.7 cm"],
  ["UK 9", "EU 43", "US 10", "27.3 cm"],
  ["UK 10", "EU 44", "US 11", "28.0 cm"],
  ["UK 11", "EU 45", "US 12", "28.6 cm"],
  ["UK 12", "EU 46", "US 13", "29.2 cm"],
];

function formatCurrency(value: number) {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function ProductPageClient({
  product,
  variantLooks = [],
  relatedProducts = [],
}: {
  product: Product;
  variantLooks?: VariantLook[];
  relatedProducts?: RelatedProduct[];
}) {
  const router = useRouter();

  // 1. Variant & Size state
  // Auto-select first in-stock variant if available
  const initialVariant = useMemo(() => {
    return product.variants.find((v) => v.stock > 0) || product.variants[0] || null;
  }, [product.variants]);

  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant?.id || "");
  const [quantity, setQuantity] = useState(1);

  // 2. Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // 3. Modals & Accordions
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [descOpen, setDescOpen] = useState(true);

  // 4. Interactive widgets
  const [pincode, setPincode] = useState("");
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [pincodeValid, setPincodeValid] = useState<boolean | null>(null);

  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [cartBusy, setCartBusy] = useState(false);
  const [cartFeedback, setCartFeedback] = useState("");

  const selectedVariant = useMemo(() => {
    return product.variants.find((v) => v.id === selectedVariantId) || initialVariant;
  }, [product.variants, selectedVariantId, initialVariant]);

  const inStock = Boolean(selectedVariant && selectedVariant.stock > 0);
  const stockCount = selectedVariant?.stock ?? 0;
  const currentPrice = selectedVariant?.price ?? product.price;
  const isFootwear = product.variants.some((v) => v.name.toLowerCase().includes("uk"));

  // Handle ESC key for Lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((idx) => (idx - 1 + product.images.length) % product.images.length);
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((idx) => (idx + 1) % product.images.length);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, product.images.length]);

  // Wishlist Action
  async function toggleWishlist() {
    setWishlistBusy(true);
    setCartFeedback("");
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (res.ok) {
        setWishlisted((prev) => !prev);
        setCartFeedback(wishlisted ? "Removed from wishlist." : "Added to wishlist.");
      }
    } catch {
      setCartFeedback("Unable to update wishlist.");
    } finally {
      setWishlistBusy(false);
    }
  }

  // Add to Cart Action
  async function handleAddToCart(goToCheckout = false) {
    setCartFeedback("");
    if (product.variants.length > 0 && !selectedVariantId) {
      setCartFeedback("Please select a size first.");
      return;
    }
    if (!inStock) {
      setCartFeedback("This variant is currently out of stock.");
      return;
    }

    setCartBusy(true);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariantId || undefined,
          quantity,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Unable to add to cart.");
      }

      if (goToCheckout) {
        router.push("/checkout");
      } else {
        setCartFeedback("Item successfully added to bag!");
      }
    } catch (err: any) {
      setCartFeedback(err.message || "Failed to add to cart. Please try again.");
    } finally {
      setCartBusy(false);
    }
  }

  // Pincode validation
  function handleCheckPincode(e: React.FormEvent) {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setPincodeValid(false);
      setPincodeMessage("Please enter a valid 6-digit Indian postal code.");
      return;
    }
    setPincodeValid(true);
    setPincodeMessage("Delivery available: Estimated arrival in 3–5 business days.");
  }

  // Social Share
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Explore ${product.name} at ATELIER`,
          url: window.location.href,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCartFeedback("Product link copied to clipboard!");
    }
  }

  return (
    <div className={styles.pdpShell}>
      {/* 1. Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={styles.crumbSep}>/</span>
        <Link href={`/category/${product.category.slug}`}>{product.category.name}</Link>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbCurrent}>{product.name}</span>
      </nav>

      {/* 2. Main Two-Column Product Container */}
      <section className={styles.productMainLayout}>
        {/* Left Column: Multi-Image Grid Gallery (~58-60%) */}
        <div className={styles.galleryCol}>
          <div className={styles.galleryGrid} role="region" aria-label="Product Image Gallery">
            {product.images.map((img, index) => (
              <div
                key={`${img.url}-${index}`}
                className={styles.galleryCell}
                onClick={() => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Enlarge product image ${index + 1}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }
                }}
              >
                <ProductImage
                  src={img.url}
                  alt={img.alt || `${product.name} view ${index + 1}`}
                  sizes="(max-width: 768px) 100vw, 30vw"
                  priority={index === 0}
                  className={styles.cellImg}
                />
                <span className={styles.zoomHint} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Product Information & Purchase Area (~40-42%) */}
        <aside className={styles.infoCol}>
          {/* Header & Subtitle */}
          <div className={styles.headerBlock}>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <div className={styles.categorySub}>{product.category.name}</div>
          </div>

          {/* Price Strip */}
          <div className={styles.priceRow}>
            <span className={styles.mainPrice}>{formatCurrency(currentPrice)}</span>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <>
                <del className={styles.strikePrice}>{formatCurrency(product.compareAtPrice)}</del>
                <span className={styles.discountBadge}>
                  {Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)}% OFF
                </span>
              </>
            )}
            <button
              type="button"
              className={`${styles.quickWishlistBtn} ${wishlisted ? styles.wishlisted : ""}`}
              onClick={toggleWishlist}
              disabled={wishlistBusy}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              title="Save to Wishlist"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={wishlisted ? "#d8232a" : "none"} stroke={wishlisted ? "#d8232a" : "currentColor"} strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
          <div className={styles.taxNotice}>Price incl. of all taxes</div>

          {/* Shop by Variant / Look (Section 10) */}
          {variantLooks.length > 0 && (
            <div className={styles.variantLookSection}>
              <div className={styles.sectionLabel}>SHOP BY VARIANT / LOOK</div>
              <div className={styles.variantThumbRow}>
                {variantLooks.map((look) => (
                  <Link
                    key={look.id}
                    href={`/product/${look.slug}`}
                    className={`${styles.variantThumb} ${look.active ? styles.variantThumbActive : ""}`}
                    title={look.name}
                  >
                    <ProductImage src={look.image} alt={look.name} sizes="70px" className={styles.thumbMedia} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection Area (Section 11 & 12) */}
          {product.variants.length > 0 && (
            <div className={styles.sizeSection}>
              <div className={styles.sizeHeader}>
                <span className={styles.sectionLabel}>PLEASE SELECT A SIZE.</span>
                <button
                  type="button"
                  className={styles.sizeChartLink}
                  onClick={() => setSizeChartOpen(true)}
                  aria-haspopup="dialog"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.3 8.7 8.7 21.3c-1 1-2.6 1-3.6 0l-1.4-1.4c-1-1-1-2.6 0-3.6L16.3 3.7c1-1 2.6-1 3.6 0l1.4 1.4c1 1 1 2.6 0 3.6zM7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2" />
                  </svg>
                  SIZE CHART
                </button>
              </div>

              <div className={styles.sizeGrid} role="radiogroup" aria-label="Available sizes">
                {product.variants.map((v) => {
                  const isAvail = v.stock > 0;
                  const isSelected = selectedVariantId === v.id;
                  const isLow = v.stock > 0 && v.stock <= 5;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!isAvail}
                      className={`${styles.sizeBtn} ${isSelected ? styles.sizeBtnSelected : ""} ${!isAvail ? styles.sizeBtnDisabled : ""}`}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setQuantity(1);
                      }}
                      role="radio"
                      aria-checked={isSelected}
                    >
                      <span className={styles.sizeText}>{v.name}</span>
                      {isLow && <span className={styles.lowStockTag}>{v.stock} Left</span>}
                      {!isAvail && <span className={styles.strikeDiagonal} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              {/* Out of stock alert notification trigger */}
              <div className={styles.outOfStockAlert}>
                <button
                  type="button"
                  className={styles.notifyLink}
                  onClick={() => {
                    setNotifyMessage("We've noted your interest. You'll be notified as soon as this size is restocked.");
                    setTimeout(() => setNotifyMessage(""), 5000);
                  }}
                >
                  <span className={styles.bellIcon}>🔔</span>
                  <span>Size not available? <strong>Notify Me When Available</strong></span>
                </button>
                {notifyMessage && <div className={styles.notifyToast}>{notifyMessage}</div>}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className={styles.quantityRow}>
            <span className={styles.qtyLabel}>Quantity:</span>
            <div className={styles.qtyBox}>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || !inStock}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className={styles.qtyVal}>{String(quantity).padStart(2, "0")}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(stockCount, q + 1))}
                disabled={quantity >= stockCount || !inStock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons: ADD TO CART, WISHLIST, BUY NOW */}
          <div className={styles.buttonStack}>
            <button
              type="button"
              className={styles.primaryAddBtn}
              onClick={() => handleAddToCart(false)}
              disabled={cartBusy || !inStock}
            >
              {cartBusy ? "ADDING TO CART..." : inStock ? "ADD TO CART" : "OUT OF STOCK"}
            </button>

            <div className={styles.secondaryBtnRow}>
              <button
                type="button"
                className={styles.outlineWishlistBtn}
                onClick={toggleWishlist}
                disabled={wishlistBusy}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "#d8232a" : "none"} stroke={wishlisted ? "#d8232a" : "currentColor"} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{wishlisted ? "WISHLISTED" : "WISHLIST"}</span>
              </button>

              <button
                type="button"
                className={styles.buyNowBtn}
                onClick={() => handleAddToCart(true)}
                disabled={cartBusy || !inStock}
              >
                BUY IT NOW
              </button>
            </div>

            <button
              type="button"
              className={styles.goToCartBtn}
              onClick={() => router.push("/cart")}
            >
              GO TO CART →
            </button>

            {cartFeedback && (
              <div className={styles.feedbackAlert} role="status">
                {cartFeedback}
              </div>
            )}
          </div>

          {/* Share Links */}
          <div className={styles.shareStrip}>
            <span className={styles.shareLabel}>Share:</span>
            <div className={styles.shareIcons}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(product.name + " " + typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className={styles.shareIcon}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.21c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23z" />
                </svg>
              </a>
              <button type="button" onClick={handleShare} className={styles.shareIcon} aria-label="Share or copy link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>

          {/* Delivery Details Pincode Checker */}
          <div className={styles.deliveryCard}>
            <div className={styles.cardHeaderSmall}>DELIVERY DETAILS</div>
            <form onSubmit={handleCheckPincode} className={styles.pincodeForm}>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter Pincode"
                className={styles.pincodeInput}
              />
              <button type="submit" className={styles.pincodeBtn}>
                CHECK
              </button>
            </form>
            {pincodeMessage && (
              <p className={`${styles.pincodeNotice} ${pincodeValid ? styles.pinSuccess : styles.pinError}`}>
                {pincodeMessage}
              </p>
            )}
          </div>

          {/* Return & Exchange Guarantee Card */}
          <div className={styles.returnInfoCard}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.8" className={styles.returnIcon}>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <p className={styles.returnText}>
              This product is eligible for return or exchange under our 30-day return policy. No questions asked.
            </p>
          </div>

          {/* Product Details Accordion */}
          <div className={styles.accordionGroup}>
            <div className={styles.accordionItem}>
              <button
                type="button"
                className={styles.accordionHead}
                onClick={() => setDetailsOpen((o) => !o)}
                aria-expanded={detailsOpen}
              >
                <span>Product Details</span>
                <span className={styles.accordionSign}>{detailsOpen ? "−" : "+"}</span>
              </button>
              {detailsOpen && (
                <div className={styles.accordionContent}>
                  <div className={styles.specGroup}>
                    <strong>Material &amp; Care:</strong>
                    <ul className={styles.specList}>
                      {isFootwear ? (
                        <>
                          <li><strong>Upper:</strong> Moulded EVA construction with a textured matte finish for durability and premium comfort.</li>
                          <li><strong>Footbed:</strong> Extra soft, cushioned EVA with deep anatomical arch contours.</li>
                          <li><strong>Build:</strong> Seamless one-piece injection-moulded design for flexibility and water resistance.</li>
                          <li><strong>Care:</strong> Wipe with mild soapy water using a soft clean cloth. Air dry in shade.</li>
                        </>
                      ) : (
                        <>
                          <li><strong>Fabric:</strong> 100% long-staple combed cotton / French flax linen.</li>
                          <li><strong>Feel:</strong> Breathable, tactile and pre-shrunk to maintain structure.</li>
                          <li><strong>Care:</strong> Machine wash cold with like colours. Do not tumble dry.</li>
                        </>
                      )}
                      <li><strong>Country of Origin:</strong> India</li>
                      <li><strong>Manufactured &amp; Sold By:</strong> ATELIER Private Ltd.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.accordionItem}>
              <button
                type="button"
                className={styles.accordionHead}
                onClick={() => setDescOpen((o) => !o)}
                aria-expanded={descOpen}
              >
                <span>Product Description</span>
                <span className={styles.accordionSign}>{descOpen ? "−" : "+"}</span>
              </button>
              {descOpen && (
                <div className={styles.accordionContent}>
                  <p className={styles.descText}>{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>

      {/* 3. OTHERS ALSO BOUGHT (Related Products Carousel) */}
      {relatedProducts.length > 0 && (
        <section className={styles.othersAlsoBoughtSection}>
          <div className={styles.othersHead}>
            <h2 className={styles.othersTitle}>Others Also Bought</h2>
          </div>

          <div className={styles.othersGrid}>
            {relatedProducts.map((rel) => (
              <article key={rel.id} className={styles.relCard}>
                <Link href={`/product/${rel.slug}`} className={styles.relCardLink}>
                  <div className={styles.relImageWrap}>
                    {/* Primary Image */}
                    <ProductImage
                      src={rel.primaryImage}
                      alt={rel.alt}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className={styles.relImgPrimary}
                    />
                    {/* Secondary Image for smooth hover crossfade */}
                    {rel.secondaryImage && (
                      <ProductImage
                        src={rel.secondaryImage}
                        alt={`${rel.name} alternate view`}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className={styles.relImgSecondary}
                      />
                    )}
                  </div>
                  <div className={styles.relMeta}>
                    <div className={styles.relName}>{rel.name}</div>
                    <div className={styles.relCategory}>{rel.category}</div>
                    <div className={styles.relPrice}>{formatCurrency(rel.price)}</div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 4. Lightbox Zoom Modal */}
      {lightboxOpen && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxOpen(false)}>
          <div className={styles.lightboxContainer} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setLightboxOpen(false)}
              aria-label="Close enlarged preview"
            >
              ✕
            </button>
            <div className={styles.lightboxImgWrap}>
              <ProductImage
                src={product.images[lightboxIndex]?.url}
                alt={product.images[lightboxIndex]?.alt || product.name}
                sizes="90vw"
                className={styles.lightboxImg}
              />
            </div>
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.lightboxArrow} ${styles.lightboxPrev}`}
                  onClick={() =>
                    setLightboxIndex((idx) => (idx - 1 + product.images.length) % product.images.length)
                  }
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
                  onClick={() =>
                    setLightboxIndex((idx) => (idx + 1) % product.images.length)
                  }
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
            <div className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {product.images.length}
            </div>
          </div>
        </div>
      )}

      {/* 5. Size Chart Modal */}
      {sizeChartOpen && (
        <div className={styles.modalOverlay} onClick={() => setSizeChartOpen(false)}>
          <div className={styles.sizeModalBox} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Size Chart">
            <div className={styles.sizeModalHead}>
              <h3>{isFootwear ? "Footwear Size Guide" : "Garment Size Guide"}</h3>
              <button type="button" onClick={() => setSizeChartOpen(false)} aria-label="Close size guide">
                ✕
              </button>
            </div>
            <div className={styles.sizeModalBody}>
              <p className={styles.sizeGuideNote}>
                Measurements are in inches / centimeters. For the best fit, measure your foot length or chest circumference.
              </p>
              <table className={styles.sizeTable}>
                <thead>
                  <tr>
                    {isFootwear ? (
                      <>
                        <th>UK SIZE</th>
                        <th>EU</th>
                        <th>US</th>
                        <th>FOOT LENGTH</th>
                      </>
                    ) : (
                      <>
                        <th>SIZE</th>
                        <th>CHEST</th>
                        <th>LENGTH</th>
                        <th>SHOULDER</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(isFootwear ? FOOTWEAR_SIZE_CHART : CLOTHING_SIZE_CHART).map(([c1, c2, c3, c4]) => (
                    <tr key={c1}>
                      <td><strong>{c1}</strong></td>
                      <td>{c2}</td>
                      <td>{c3}</td>
                      <td>{c4}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}