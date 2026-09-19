"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./mobile-nav.module.css";

export default function MobileNav() {
  const pathname = usePathname();

  // Do not show bottom nav on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className={styles.mobileBar} aria-label="Mobile bottom navigation">
      <Link href="/shop" className={`${styles.navItem} ${pathname === "/shop" ? styles.active : ""}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Shop</span>
      </Link>

      <Link href="/category/t-shirts" className={`${styles.navItem} ${pathname?.includes("t-shirts") ? styles.active : ""}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        </svg>
        <span>Tees</span>
      </Link>

      <Link href="/category/sneakers" className={`${styles.navItem} ${pathname?.includes("sneakers") ? styles.active : ""}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3.5 17h17c0-2-2-4-5-4H9.5c-3 0-6 2-6 4z" />
          <path d="M14 7l-3 4-2-1-4 3" />
        </svg>
        <span>Footwear</span>
      </Link>

      <Link href="/wishlist" className={`${styles.navItem} ${pathname === "/wishlist" ? styles.active : ""}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        <span>Wishlist</span>
      </Link>

      <Link href="/cart" className={`${styles.navItem} ${pathname === "/cart" ? styles.active : ""}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <span>Cart</span>
      </Link>
    </nav>
  );
}
