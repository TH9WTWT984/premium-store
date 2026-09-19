import Link from "next/link";
import styles from "./store-footer.module.css";

export default function StoreFooter() {
  return (
    <footer className={styles.footerWrap} aria-label="Store footer">
      {/* 1. Full-width brand accent banner */}
      <div className={styles.brandAccentBanner}>
        <div className={styles.brandAccentText}>
          HOMEGROWN LUXURY BRAND — CRAFTED WITH THOUGHTFUL RESTRAINT
        </div>
      </div>

      {/* 2. Customer Trust Section */}
      <div className={styles.customerTrustSection}>
        <h2 className={styles.customerTrustHeading}>
          Over <strong>100,000</strong> Discerning Wardrobes
        </h2>
        <p className={styles.customerTrustSubtext}>
          Quiet silhouettes. Pure materials. Honest design for everyday living across India.
        </p>
      </div>

      {/* 3. Main Multi-Column Footer */}
      <div className={styles.mainFooter}>
        <div className={styles.footerContainer}>
          <div className={styles.footerGrid}>
            {/* Column 1: Need Help */}
            <div className={styles.footerCol}>
              <h3 className={styles.colTitle}>NEED HELP</h3>
              <ul className={styles.colList}>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/account">Track Order</Link></li>
                <li><Link href="/returns">Returns &amp; Refunds</Link></li>
                <li><Link href="/faq">FAQs</Link></li>
                <li><Link href="/account">My Account</Link></li>
              </ul>
              <div className={styles.badgeList}>
                <div className={styles.featureBadge}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12M15 9.5H9.5a2.5 2.5 0 0 1 0-5H14M9.5 14.5H15" />
                  </svg>
                  <span>COD Available</span>
                </div>
                <div className={styles.featureBadge}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  <span>30 Days Easy Returns &amp; Exchanges</span>
                </div>
              </div>
            </div>

            {/* Column 2: Company */}
            <div className={styles.footerCol}>
              <h3 className={styles.colTitle}>COMPANY</h3>
              <ul className={styles.colList}>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/about">Our Story</Link></li>
                <li><Link href="/about#careers">Careers</Link></li>
                <li><Link href="/about#community">Community Initiatives</Link></li>
              </ul>
            </div>

            {/* Column 3: More Info */}
            <div className={styles.footerCol}>
              <h3 className={styles.colTitle}>MORE INFO</h3>
              <ul className={styles.colList}>
                <li><Link href="/terms">Terms &amp; Conditions</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/shipping">Shipping Policy</Link></li>
                <li><Link href="/sitemap.xml">Sitemap</Link></li>
              </ul>
            </div>

            {/* Column 4: Store / Categories */}
            <div className={styles.footerCol}>
              <h3 className={styles.colTitle}>STORE / CATEGORIES</h3>
              <ul className={styles.colList}>
                <li><Link href="/category/sneakers">Sneakers &amp; Slides</Link></li>
                <li><Link href="/category/t-shirts">T-Shirts</Link></li>
                <li><Link href="/category/shirts">Shirts</Link></li>
                <li><Link href="/category/polos">Polos</Link></li>
                <li><Link href="/category/apparel">Apparel</Link></li>
                <li><Link href="/category/home">Home &amp; Objects</Link></li>
                <li><Link href="/shop" className={styles.viewAllLink}>View All Products →</Link></li>
              </ul>
            </div>
          </div>

          {/* Social & Follow Strip */}
          <div className={styles.socialStrip}>
            <span className={styles.followLabel}>Follow Us:</span>
            <div className={styles.socialIcons}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={styles.socialIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)" className={styles.socialIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Payment & Trust Strip */}
          <div className={styles.paymentStrip}>
            <div className={styles.paymentCol}>
              <span className={styles.stripLabel}>100% SECURE PAYMENTS:</span>
              <div className={styles.paymentBadges}>
                <span className={styles.payBadge}>UPI</span>
                <span className={styles.payBadge}>GPay</span>
                <span className={styles.payBadge}>PhonePe</span>
                <span className={styles.payBadge}>Paytm</span>
                <span className={styles.payBadge}>RuPay</span>
                <span className={styles.payBadge}>VISA</span>
                <span className={styles.payBadge}>MasterCard</span>
                <span className={styles.payBadge}>NetBanking</span>
              </div>
            </div>
            <div className={styles.paymentCol}>
              <span className={styles.stripLabel}>SHIPPING PARTNERS:</span>
              <div className={styles.shippingBadges}>
                <span>BlueDart</span>
                <span>Delhivery</span>
                <span>Ecom Express</span>
                <span>India Post</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className={styles.bottomBar}>
            <span>© 2026 ATELIER. All rights reserved.</span>
            <span>Considered pieces made for everyday living.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
