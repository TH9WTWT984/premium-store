import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";
import CurationCarousel from "./curation-carousel";
import styles from "./account.module.css";

export const dynamic = "force-dynamic";

function money(value: unknown) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function dateLabel(value: Date) {
  return value.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function statusLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [orderCount, latestOrder, addressCount, defaultAddress, wishlist, curationProducts] =
    await Promise.all([
      prisma.order.count({
        where: { userId: user.id },
      }),

      prisma.order.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          items: {
            take: 3,
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      prisma.address.count({
        where: { userId: user.id },
      }),

      prisma.address.findFirst({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      }),

      prisma.wishlist.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
              productId: true,
            },
          },
        },
      }),

      prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 7,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { url: true, alt: true },
          },
        },
      }),
    ]);

  const wishlistIds = wishlist?.items.map((item) => item.productId) ?? [];

  const wishlistProducts = wishlistIds.length
    ? await prisma.product.findMany({
        where: {
          id: { in: wishlistIds },
        },
        select: {
          id: true,
          name: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { url: true, alt: true },
          },
        },
      })
    : [];

  const memberSince = dateLabel(user.createdAt);
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const latestStatus = latestOrder ? statusLabel(latestOrder.status) : "No orders yet";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>ATELIER</Link>

        <nav className={styles.nav} aria-label="Account navigation">
          <Link href="/shop">SHOP</Link>
          <Link href="/#collections">COLLECTIONS</Link>
          <Link href="/cart">BAG</Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.heroEyebrow}>YOUR ACCOUNT</div>
            <div className={styles.heroTopline}>PRIVATE SPACE · {user.firstName.toUpperCase()}</div>

            <h1 className={styles.heroTitle}>
              Welcome,
              <br />
              {user.firstName}.
            </h1>

            <p>
              Your orders, saved details and everyday ATELIER pieces —
              gathered in one considered place.
            </p>
          </div>

          <div className={styles.memberPanel}>
            <div className={styles.memberMonogram}>{initials || "A"}</div>
            <span>MEMBER SINCE</span>
            <strong>{memberSince}</strong>
            <Link href="#account-details">Account details ↗</Link>
          </div>
        </section>

        <section className={styles.dashboard}>
          <div className={`${styles.card} ${styles.ordersCard}`}>
            <div className={styles.cardLabel}>ORDERS <span className={styles.liveDot} /></div>
            <div className={styles.cardArrow}>↗</div>

            <div className={styles.bigNumber}>{orderCount}</div>

            <div>
              <h2>Orders placed</h2>
              <p>{latestOrder ? `Latest · ${latestOrder.orderNumber}` : "Your order history starts here."}</p>
            </div>

            <Link href="/account/orders" className={styles.cardLink}>View purchase history ↗</Link>
          </div>

          <div className={`${styles.card} ${styles.accountCard}`} id="account-details">
            <div className={styles.cardLabel}>SIGNED IN</div>
            <div className={styles.statusOrb} />

            <div className={styles.profileIcon}>{initials || "A"}</div>
            <h2>{user.email}</h2>
            <p>
              {user.phone ||
                "Add your phone number at checkout when delivery contact is needed."}
            </p>

            <Link href="/checkout" className={styles.cardLink}>Manage delivery details ↗</Link>
          </div>
        </section>

        <section className={styles.quickGrid}>
          <Link href="/wishlist" className={styles.quickCard}>
            <div className={styles.quickIndex}>01</div>
            <div className={styles.quickTitle}>WISHLIST ↗</div>
            <div className={styles.quickNumber}>{wishlist?.items.length ?? 0}</div>
            <div className={styles.quickCaption}>Saved pieces</div>

            <div className={styles.thumbRow}>
              {wishlistProducts.slice(0, 4).map((product) => (
                <div className={styles.thumb} key={product.id}>
                  {product.images[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                    />
                  ) : (
                    <span>ATELIER</span>
                  )}
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - wishlistProducts.length) }).map((_, index) => (
                <div className={styles.thumbEmpty} key={`empty-${index}`} />
              ))}
            </div>

            <span className={styles.quickAction}>Live status ↗</span>
          </Link>

          <Link href="/shop" className={styles.quickCard}>
            <div className={styles.quickIndex}>02</div>
            <div className={styles.quickTitle}>SHOPPING ↗</div>
            <div className={styles.continueTitle}>Continue</div>
            <div className={styles.quickCaption}>Explore the collection</div>
            <div className={styles.quickMetric}>{Math.max(orderCount, 0)}</div>
            <span className={styles.quickAction}>Saved pieces</span>
          </Link>

          <div className={styles.quickCard}>
            <div className={styles.quickIndex}>03</div>
            <div className={styles.quickTitle}>ADDRESSES</div>
            <div className={styles.mapBadge}>⌖</div>
            <div className={styles.quickNumber}>{addressCount}</div>
            <div className={styles.quickCaption}>
              {defaultAddress ? "Saved delivery address" : "No saved addresses"}
            </div>
            {defaultAddress ? (
              <p className={styles.addressPreview}>
                {defaultAddress.line1}, {defaultAddress.city}
              </p>
            ) : (
              <Link href="/checkout" className={styles.quickAction}>Add at checkout ↗</Link>
            )}
          </div>
        </section>

        <section className={styles.latest}>
          <div>
            <div className={styles.sectionEyebrow}>LATEST ORDER</div>
            <h2>One place to follow every purchase.</h2>
            <p>
              {latestOrder
                ? `${latestStatus} · ${money(latestOrder.total)} · ${latestOrder.items.length} item${latestOrder.items.length === 1 ? "" : "s"}`
                : "When you place your first order, its details will appear here."}
            </p>
          </div>

          {latestOrder ? (
            <Link href={`/account/orders/${latestOrder.id}`} className={styles.outlineButton}>
              View order ↗
            </Link>
          ) : (
            <Link href="/shop" className={styles.outlineButton}>
              Explore collection ↗
            </Link>
          )}
        </section>

        <CurationCarousel products={curationProducts.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          image: product.images[0]?.url || "",
          alt: product.images[0]?.alt || product.name,
        }))} />

        <section className={styles.rewards}>
          <div>
            <div className={styles.sectionEyebrow}>ATELIER STATUS</div>
            <h2>Member standing</h2>
            <p>Your account is ready for your next considered purchase.</p>
          </div>
          <div className={styles.rewardBadge}>A</div>
          <div className={styles.rewardTrack}>
            <div className={styles.rewardBar} />
          </div>
          <div className={styles.rewardMeta}>
            <span>BRONZE MEMBER</span>
            <span>0 points</span>
          </div>
        </section>

        <section className={styles.quickLinks}>
          <span className={styles.quickLinksLabel}>QUICK LINKS</span>
          <Link href="/account/orders">Orders ↗</Link>
          <Link href="/wishlist">Wishlist ↗</Link>
          <Link href="/shop">Shop all pieces ↗</Link>
          <LogoutButton />
        </section>
      </main>

      <footer className={styles.footer}>
        <div>
          <div className={styles.footerBrand}>ATELIER</div>
          <p>Modern essentials, thoughtfully selected.</p>
        </div>
        <nav>
          <Link href="/contact">CONTACT</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/shipping">SHIPPING</Link>
          <Link href="/returns">RETURNS</Link>
          <Link href="/privacy">PRIVACY</Link>
        </nav>
        <span className={styles.footerBottom}>© 2026 ATELIER · Made for everyday living.</span>
      </footer>
    </div>
  );
}
