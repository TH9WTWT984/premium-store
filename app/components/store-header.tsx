"use client";

import { useState } from "react";
import Link from "next/link";
import ShopDrawer from "./shop-drawer";
import styles from "./store-header.module.css";

function Icon({
  name,
}: {
  name: "shop" | "collection" | "search" | "account" | "heart" | "bag";
}) {
  const common = {
    width: 18,
    height: 18,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "shop":
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M0 15h16v1H0v-1z" />
          <path d="M0 0v6c.005.732.401 1.37.991 1.715L1 14h9V9h3v5h2V7.72c.599-.35.995-.988 1-1.719V0H0zm4 2h2v4c0 .552-.448 1-1 1S4 6.552 4 6V2zm-2 5c-.552 0-1-.448-1-1V2h2v4c0 .552-.448 1-1 1zm6 5H3V9h5v3zm1-6c0 .552-.448 1-1 1S8 6.552 8 6V2h2v4zm3 0c0 .552-.448 1-1 1s-1-.448-1-1V2h2v4zm3 0c0 .552-.448 1-1 1s-1-.448-1-1V2h2v4z" />
        </svg>
      );

    case "collection":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      );

    case "search":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      );

    case "account":
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M16 7.992C16 3.58 12.416 0 8 0S0 3.58 0 7.992c0 2.43 1.104 4.62 2.832 6.09.016.016.032.016.032.032.144.112.288.224.448.336.08.048.144.111.224.175A7.98 7.98 0 0 0 8.016 16a7.98 7.98 0 0 0 4.48-1.375c.08-.048.144-.111.224-.16.144-.111.304-.223.448-.335.016-.016.032-.016.032-.032 1.696-1.487 2.8-3.676 2.8-6.106zm-8 7.001c-1.504 0-2.88-.48-4.016-1.279.016-.128.048-.255.08-.383a4.17 4.17 0 0 1 .416-.991c.176-.304.384-.576.64-.816.24-.24.528-.463.816-.639.304-.176.624-.304.976-.4A4.15 4.15 0 0 1 8 10.342a4.185 4.185 0 0 1 2.928 1.166c.368.368.656.8.864 1.295.112.288.192.592.24.911A7.03 7.03 0 0 1 8 14.993zm-2.448-7.4a2.49 2.49 0 0 1-.208-1.024c0-.351.064-.703.208-1.023.144-.32.336-.607.576-.847.24-.24.528-.431.848-.575.32-.144.672-.208 1.024-.208.368 0 .704.064 1.024.208.32.144.608.336.848.575.24.24.432.528.576.847.144.32.208.672.208 1.023 0 .368-.064.704-.208 1.023a2.84 2.84 0 0 1-.576.848 2.84 2.84 0 0 1-.848.575 2.715 2.715 0 0 1-2.064 0 2.84 2.84 0 0 1-.848-.575 2.526 2.526 0 0 1-.56-.848zm7.424 5.306c0-.032-.016-.048-.016-.08a5.22 5.22 0 0 0-.688-1.406 4.883 4.883 0 0 0-1.088-1.135 5.207 5.207 0 0 0-1.04-.608 2.82 2.82 0 0 0 .464-.383 4.2 4.2 0 0 0 .624-.784 3.624 3.624 0 0 0 .528-1.934 3.71 3.71 0 0 0-.288-1.47 3.799 3.799 0 0 0-.816-1.199 3.845 3.845 0 0 0-1.2-.8 3.72 3.72 0 0 0-1.472-.287 3.72 3.72 0 0 0-1.472.288 3.631 3.631 0 0 0-1.2.815 3.84 3.84 0 0 0-.8 1.199 3.71 3.71 0 0 0-.288 1.47c0 .352.048.688.144 1.007.096.336.224.64.4.927.16.288.384.544.624.784.144.144.304.271.48.383a5.12 5.12 0 0 0-1.04.624c-.416.32-.784.703-1.088 1.119a4.999 4.999 0 0 0-.688 1.406c-.016.032-.016.064-.016.08C1.776 11.636.992 9.91.992 7.992.992 4.14 4.144.991 8 .991s7.008 3.149 7.008 7.001a6.96 6.96 0 0 1-2.032 4.907z" />
        </svg>
      );

    case "heart":
      return (
        <svg width="18" height="18" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path d="M9.06,25C7.68,17.3,12.78,10.63,20.73,10c7-.55,10.47,7.93,11.17,9.55a.13.13,0,0,0,.25,0c3.25-8.91,9.17-9.29,11.25-9.5C49,9.45,56.51,13.78,55,23.87c-2.16,14-23.12,29.81-23.12,29.81S11.79,40.05,9.06,25Z" />
        </svg>
      );

    case "bag":
      return (
        <svg width="18" height="18" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <polygon fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" points="44,18 54,18 54,63 10,63 10,18 20,18" />
          <path fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" d="M22,24V11c0-5.523,4.477-10,10-10s10,4.477,10,10v13" />
        </svg>
      );
  }
}

export default function StoreHeader() {
  const [shopOpen, setShopOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <nav className={styles.primaryNav} aria-label="Primary navigation">
          <button
            type="button"
            className={styles.navLink}
            onClick={() => setShopOpen(true)}
            aria-label="Open shop menu"
            style={{
              border: "0",
              background: "transparent",
              padding: 0,
              margin: 0,
              appearance: "none",
              font: "inherit",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <Icon name="shop" />
            <span>Shop</span>
          </button>

          <Link className={styles.navLink} href="/#collections">
            <Icon name="collection" />
            <span>Collections</span>
          </Link>
        </nav>

        <Link href="/" className={styles.logo} aria-label="ATELIER home">
          ATELIER
        </Link>

        <div className={styles.actions}>
          <form className={styles.search} action="/search" method="get" role="search">
            <Icon name="search" />
            <input name="q" type="search" placeholder="Search the collection" aria-label="Search the collection" />
            <button type="submit" className={styles.searchSubmit} aria-label="Submit search">
              <Icon name="search" />
            </button>
          </form>

          <Link className={styles.iconAction} href="/account" aria-label="Account" title="Account">
            <Icon name="account" />
          </Link>

          <Link className={styles.iconAction} href="/wishlist" aria-label="Wishlist" title="Wishlist">
            <Icon name="heart" />
          </Link>

          <Link className={styles.iconAction} href="/cart" aria-label="Bag" title="Bag">
            <Icon name="bag" />
          </Link>
        </div>
      </div>

      <ShopDrawer open={shopOpen} onClose={() => setShopOpen(false)} />
    </header>
  );
}
