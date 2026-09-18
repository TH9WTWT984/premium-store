"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./style-product-detail.module.css";

type ImageItem = { src: string; alt: string };
type Variant = { id: string; name: string; price: number | null; stock: number };
type Product = {
  id: string;
  name: string;
  description: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  images: ImageItem[];
  variants: Variant[];
};

const SIZE_GUIDE = [
  ["S", "36–38 in", "27–28 in"],
  ["M", "38–40 in", "28–29 in"],
  ["L", "40–42 in", "29–30 in"],
  ["XL", "42–44 in", "30–31 in"],
  ["XXL", "44–46 in", "31–32 in"],
];

function Chevron({ open }: { open: boolean }) {
  return <span className={styles.chevron}>{open ? "−" : "+"}</span>;
}

export default function StyleProductDetail({
  categoryName,
  categorySlug,
  style,
  product,
  previewImages = [],
}: {
  categoryName: string;
  categorySlug: string;
  style: string;
  product: Product | null;
  previewImages?: ImageItem[];
}) {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(product?.variants[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);

  const gallery = product?.images?.length ? product.images.slice(0, 5) : previewImages.slice(0, 5);
  const selectedVariant = useMemo(
    () => product?.variants.find((variant) => variant.id === selectedVariantId) || product?.variants[0] || null,
    [product, selectedVariantId],
  );

  const currentPrice = selectedVariant?.price ?? product?.price ?? 0;
  const stock = selectedVariant?.stock ?? 0;
  const inStock = Boolean(product && stock > 0);
  const maxQuantity = Math.max(1, stock);

  function changeQuantity(delta: number) {
    setQuantity((current) => Math.min(maxQuantity, Math.max(1, current + delta)));
  }

  async function addToCart(goToCheckout: boolean) {
    if (!product) {
      setMessage("This style is being prepared. The client product must be published before checkout can be enabled.");
      return;
    }
    if (!inStock) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariantId || undefined,
          quantity,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }

      if (!response.ok) throw new Error(payload.error || "Unable to add this item to your bag.");
      if (goToCheckout) router.push("/checkout");
      else setMessage("Added to bag.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.productHero}>
        <div className={styles.gallery}>
          <div className={styles.galleryTop}>
            <Link href={`/collections/${encodeURIComponent(categorySlug)}`} className={styles.back}>
              ← Collections
            </Link>
            <span className={styles.galleryCount}>{String(active + 1).padStart(2, "0")} / {String(Math.max(gallery.length, 1)).padStart(2, "0")}</span>
          </div>

          <div className={styles.galleryBody}>
            <div className={styles.thumbs} aria-label="Product images">
              {gallery.map((image, index) => (
                <button
                  type="button"
                  key={`${image.src}-${index}`}
                  className={`${styles.thumb} ${index === active ? styles.thumbActive : ""}`}
                  onClick={() => setActive(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image.src} alt={image.alt} />
                </button>
              ))}
            </div>

            <div className={styles.mainImageWrap}>
              {gallery[active] ? (
                <img className={styles.mainImage} src={gallery[active].src} alt={gallery[active].alt} />
              ) : (
                <div className={styles.imageEmpty}>Product imagery coming soon</div>
              )}
              {!product && <span className={styles.previewBadge}>STYLE PREVIEW</span>}
              <button className={`${styles.imageArrow} ${styles.imagePrev}`} type="button" aria-label="Previous image" onClick={() => setActive((active - 1 + gallery.length) % gallery.length)}>←</button>
              <button className={`${styles.imageArrow} ${styles.imageNext}`} type="button" aria-label="Next image" onClick={() => setActive((active + 1) % gallery.length)}>→</button>
            </div>
          </div>
        </div>

        <aside className={styles.info}>
          <div className={styles.kicker}>T-SHIRTS · {style}</div>
          <h1 className={styles.title}>{product?.name || `${style} T-shirt`}</h1>
          <p className={styles.lede}>
            {product?.shortDescription ||
              `A considered ${style.toLowerCase()} silhouette designed for everyday wear, clean layering and an easy ATELIER fit.`}
          </p>

          <div className={styles.priceRow}>
            <strong>{product ? `₹${currentPrice.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "Price set by client"}</strong>
            {product?.compareAtPrice && product.compareAtPrice > currentPrice && (
              <del>₹{product.compareAtPrice.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</del>
            )}
          </div>

          <div className={styles.rule} />

          <section className={styles.optionBlock}>
            <div className={styles.optionHead}>
              <span>Size</span>
              <button type="button" onClick={() => setSizeGuideOpen((open) => !open)}>
                Size guide
              </button>
            </div>
            {product?.variants.length ? (
              <div className={styles.sizeGrid}>
                {product.variants.map((variant) => (
                  <button
                    type="button"
                    key={variant.id}
                    className={`${styles.sizeButton} ${selectedVariant?.id === variant.id ? styles.sizeSelected : ""}`}
                    disabled={variant.stock <= 0}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setQuantity(1);
                    }}
                  >
                    <span>{variant.name}</span>
                    {variant.stock <= 0 && <small>Sold out</small>}
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.setupNotice}>Sizes will appear here once the client publishes this style as a product and adds variants.</div>
            )}

            {sizeGuideOpen && (
              <div className={styles.sizeGuide}>
                <div className={styles.guideTitle}>ATELIER reference sizing</div>
                <div className={styles.guideNote}>Reference fit guide. Replace these numbers with the client&apos;s final garment measurements before launch.</div>
                <div className={styles.guideTable}>
                  <div>SIZE</div><div>CHEST</div><div>BODY LENGTH</div>
                  {SIZE_GUIDE.map(([size, chest, length]) => (
                    <div key={size} className={styles.guideRow}>
                      <span>{size}</span><span>{chest}</span><span>{length}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <div className={`${styles.stock} ${!inStock ? styles.stockOut : ""}`}>
            <span className={styles.stockDot} />
            <span>{product ? (inStock ? `In stock · ${stock} available` : "Out of stock") : "Not available for purchase yet"}</span>
          </div>

          <div className={styles.quantityRow}>
            <span>Quantity</span>
            <div className={styles.quantityBox}>
              <button type="button" onClick={() => changeQuantity(-1)} disabled={!product || !inStock} aria-label="Decrease quantity">−</button>
              <strong>{quantity}</strong>
              <button type="button" onClick={() => changeQuantity(1)} disabled={!product || !inStock} aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.addButton} type="button" disabled={busy || !inStock} onClick={() => addToCart(false)}>
              {busy ? "Adding…" : "Add to bag"}
            </button>
            <button className={styles.buyButton} type="button" disabled={busy || !inStock} onClick={() => addToCart(true)}>
              Buy it now
            </button>
          </div>

          {message && <p className={styles.message} role="status">{message}</p>}

          <section className={styles.paymentBox}>
            <div>
              <span className={styles.eyebrow}>PAYMENT OPTIONS</span>
              <strong>Secure checkout with Razorpay</strong>
            </div>
            <div className={styles.paymentPills}>
              <span>UPI</span>
              <span>CARDS</span>
              <span>NETBANKING</span>
              <span>WALLETS</span>
            </div>
            <p>Payment methods available at checkout may vary by order and eligibility.</p>
          </section>

          <div className={styles.accordions}>
            <button type="button" onClick={() => setDetailsOpen((open) => !open)}><span>Product description</span><Chevron open={detailsOpen} /></button>
            {detailsOpen && <div className={styles.accordionBody}>{product?.description || `The ${style.toLowerCase()} style will carry the final product description supplied by the client in Admin → Products.`}</div>}

            <button type="button" onClick={() => setShippingOpen((open) => !open)}><span>Shipping & delivery</span><Chevron open={shippingOpen} /></button>
            {shippingOpen && <div className={styles.accordionBody}>Delivery estimates and shipping charges are calculated during checkout after the delivery address is entered.</div>}

            <button type="button" onClick={() => setReturnsOpen((open) => !open)}><span>Returns & exchanges</span><Chevron open={returnsOpen} /></button>
            {returnsOpen && <div className={styles.accordionBody}>Returns and exchanges follow the store&apos;s published policy. Review the Returns page before purchase; the final client policy should replace this placeholder before launch.</div>}
          </div>
        </aside>
      </section>

      <section className={styles.promiseBand}>
        <div><span>01</span><strong>Easy fit</strong><p>Use the size guide before selecting your size.</p></div>
        <div><span>02</span><strong>Secure payment</strong><p>Payment is verified server-side before the order is confirmed.</p></div>
        <div><span>03</span><strong>Clear returns</strong><p>The published store return policy remains the source of truth.</p></div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>ATELIER</div>
            <p>Modern essentials, thoughtfully selected. Designed around quality, restraint and everyday beauty.</p>
          </div>
          <div><h4>SHOP</h4><Link href="/shop">All products</Link><Link href={`/collections/${categorySlug}`}>Collections</Link><Link href="/search">Search</Link></div>
          <div><h4>HELP</h4><Link href="/contact">Contact</Link><Link href="/faq">FAQ</Link><Link href="/shipping">Shipping</Link><Link href="/returns">Returns</Link></div>
          <div><h4>COMPANY</h4><Link href="/about">Our story</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
        </div>
        <div className={styles.copyright}><span>© 2026 ATELIER</span><span>Made for everyday living.</span></div>
      </footer>
    </main>
  );
}
