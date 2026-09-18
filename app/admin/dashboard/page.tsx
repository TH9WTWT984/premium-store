import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";

export default async function Dashboard() {
  const admin = await requireAdminPermission("products.read");
  const [productCount, activeProductCount, orderCount, customerCount, lowStockCount, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.productVariant.count({ where: { stock: { lte: 5 }, isActive: true } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
  ]);

  const cards = [
    { label: "Products", value: productCount, detail: `${activeProductCount} active`, href: "/admin/products" },
    { label: "Orders", value: orderCount, detail: "All orders", href: "/admin/dashboard" },
    { label: "Customers", value: customerCount, detail: "Registered accounts", href: "/admin/dashboard" },
    { label: "Low stock", value: lowStockCount, detail: "Variants at or below 5", href: "/admin/products" },
  ];

  return <AdminShell adminName={admin.name} adminRole={admin.role.name} permissions={admin.role.permissions.map((permission) => permission.key)}>
    <div className="admin-content">
      <div className="admin-topbar">
        <div><div className="eyebrow">Overview</div><h1 className="serif admin-title">Good to see you, {admin.name}.</h1><p className="admin-muted">The operational core of your storefront starts here.</p></div>
        <Link className="btn btn-dark" href="/admin/products/new">Add product</Link>
      </div>
      <section className="admin-stat-grid">
        {cards.map((card) => <Link key={card.label} href={card.href} className="admin-stat-card"><div className="eyebrow">{card.label}</div><div className="admin-stat-value">{card.value}</div><div className="admin-muted">{card.detail}</div></Link>)}
      </section>
      <section className="admin-grid-two">
        <div className="admin-panel">
          <div className="admin-panel-head"><div><div className="eyebrow">Revenue</div><h2 className="serif admin-panel-title">Store total</h2></div><span className="admin-pill">INR</span></div>
          <div className="admin-revenue">₹{Number(revenue._sum.total ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
          <p className="admin-muted">Gross order value excluding cancelled orders. Checkout and payment reconciliation arrive in later phases.</p>
        </div>
        <div className="admin-panel admin-panel-image">
          <img src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1200&q=85" alt="ATELIER product styling" />
          <div className="admin-image-overlay"><div className="eyebrow">Catalog</div><h2 className="serif admin-panel-title">Keep the assortment tight.</h2><Link href="/admin/products" className="admin-inline-link">Manage products →</Link></div>
        </div>
      </section>
    </div>
  </AdminShell>;
}
