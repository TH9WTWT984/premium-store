import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./admin-shell.module.css";

const navItems = [
  { label: "Overview", href: "/admin/dashboard", icon: "⌂" },
  { label: "Products", href: "/admin/products", icon: "▦" },
  { label: "Categories", href: "/admin/categories", icon: "◈" },
  { label: "Inventory", href: "/admin/inventory", icon: "◫" },
  { label: "Orders", href: "/admin/orders", icon: "□" },
  { label: "Inquiries", href: "/admin/inquiries", icon: "↗" },
  { label: "Pages", href: "/admin/pages", icon: "▤" },
  { label: "Homepage", href: "/admin/homepage", icon: "⌘" },
  { label: "Media", href: "/admin/media", icon: "▧" },
    { label: "Coupons", href: "/admin/coupons", icon: "◇" },
{ label: "Analytics", href: "/admin/analytics", icon: "◒", accent: true },
];

export default function AdminShell({
  children,
  adminName,
  adminRole,
  permissions = [],
}: {
  children: ReactNode;
  adminName: string;
  adminRole: string;
  permissions?: string[];
}) {
  const canRead = permissions.length === 0 || permissions.includes("products.read");

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brandBlock}>
          <div className={styles.brand}>ATELIER</div>
          <div className={styles.subbrand}>STORE ADMINISTRATION</div>
        </div>

        <div className={styles.navLabel}>Workspace</div>

        <nav className={styles.nav} aria-label="Admin navigation">
          {navItems.map((item) => {
            if (item.label === "Analytics" && !canRead) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${item.accent ? styles.analyticsItem : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
                {item.accent && <span className={styles.liveDot} />}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sideBottom}>
          <div className={styles.accountCard}>
            <div className={styles.avatar}>
              {(adminName || "A").slice(0, 1).toUpperCase()}
            </div>

            <div className={styles.accountCopy}>
              <strong>{adminName}</strong>
              <span>{adminRole}</span>
            </div>
          </div>

          <form action="/api/admin/auth/logout" method="post">
            <button className={styles.signOut} type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
