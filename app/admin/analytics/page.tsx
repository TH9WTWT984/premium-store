import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";
import styles from "./analytics.module.css";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatINR(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatCompact(value: number) {
  return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : String(Math.round(value));
}

export default async function AnalyticsPage() {
  const admin = await requireAdminPermission("products.read");
  const now = new Date();
  const since = new Date(now);
  since.setDate(since.getDate() - 29);
  const sinceDay = startOfDay(since);

  const [orders, customers, productCount, variants, inquiries, topProductGroups, topCategoryProducts] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: sinceDay }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.count({ where: { createdAt: { gte: sinceDay } } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.productVariant.findMany({ where: { isActive: true }, select: { stock: true, product: { select: { name: true } } } }),
    prisma.inquiry.findMany({ where: { createdAt: { gte: sinceDay } }, select: { status: true } }),
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true, total: true }, orderBy: { _sum: { total: "desc" } }, take: 5 }),
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { total: true } }),
  ]);

  const productIds = topProductGroups.map((row) => row.productId);
  const allCategoryProductIds = topCategoryProducts.map((row) => row.productId);
  const [topProducts, categoryRows] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, category: { select: { name: true } } } }),
    prisma.product.findMany({ where: { id: { in: allCategoryProductIds } }, select: { id: true, category: { select: { name: true } } } }),
  ]);

  const topProductMap = new Map(topProducts.map((p) => [p.id, p]));
  const categoryMap = new Map<string, number>();
  for (const row of topCategoryProducts) {
    const product = categoryRows.find((p) => p.id === row.productId);
    const key = product?.category.name || "Uncategorized";
    categoryMap.set(key, (categoryMap.get(key) || 0) + Number(row._sum.total || 0));
  }

  const revenue = orders.reduce((sum, row) => sum + Number(row.total), 0);
  const orderCount = orders.length;
  const avgOrder = orderCount ? revenue / orderCount : 0;
  const lowStock = variants.filter((v) => v.stock <= 5).length;
  const inquiryCount = inquiries.length;
  const pendingInquiries = inquiries.filter((i) => i.status === "NEW").length;

  const dayMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(sinceDay);
    d.setDate(sinceDay.getDate() + i);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of orders) {
    const key = startOfDay(row.createdAt).toISOString().slice(0, 10);
    dayMap.set(key, (dayMap.get(key) || 0) + Number(row.total));
  }
  const trend = [...dayMap.entries()].map(([date, value]) => ({ date, value }));
  const maxTrend = Math.max(...trend.map((x) => x.value), 1);

  const statusCounts = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "REFUNDED"].map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));

  const categoryData = [...categoryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topProductData = topProductGroups.map((row) => ({
    name: topProductMap.get(row.productId)?.name || "Unknown product",
    category: topProductMap.get(row.productId)?.category.name || "Category",
    revenue: Number(row._sum.total || 0),
    units: Number(row._sum.quantity || 0),
  }));

  return (
    <AdminShell adminName={admin.name} adminRole={admin.role.name} permissions={admin.role.permissions.map((p) => p.key)}>
      <div className={styles.page}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.kicker}>Performance Studio</div>
            <h1 className={styles.title}>Store analytics</h1>
            <p className={styles.subtitle}>A living view of revenue, demand, products and customer activity.</p>
          </div>
          <div className={styles.range}>Last 30 days <span>⌄</span></div>
        </header>

        <section className={styles.heroGrid}>
          <article className={`${styles.metricCard} ${styles.metricPrimary}`}>
            <div className={styles.metricTop}><span>Total revenue</span><span className={styles.metricIcon}>₹</span></div>
            <strong>{formatINR(revenue)}</strong>
            <small>Across {orderCount} non-cancelled orders</small>
            <div className={styles.miniBar}><i style={{ width: `${Math.min(100, (revenue / Math.max(revenue, 1)) * 100)}%` }} /></div>
          </article>
          <article className={styles.metricCard}><div className={styles.metricTop}><span>Orders</span><span className={styles.metricIcon}>↗</span></div><strong>{orderCount}</strong><small>Orders in the selected period</small></article>
          <article className={styles.metricCard}><div className={styles.metricTop}><span>Average order</span><span className={styles.metricIcon}>◉</span></div><strong>{formatINR(avgOrder)}</strong><small>Average basket value</small></article>
          <article className={styles.metricCard}><div className={styles.metricTop}><span>New customers</span><span className={styles.metricIcon}>✦</span></div><strong>{customers}</strong><small>Registered in 30 days</small></article>
        </section>

        <section className={styles.mainGrid}>
          <article className={`${styles.panel} ${styles.chartPanel}`}>
            <div className={styles.panelHead}><div><span className={styles.panelKicker}>Sales analytics</span><h2>Revenue pulse</h2></div><span className={styles.badge}>30D</span></div>
            <div className={styles.chartArea}>
              <div className={styles.yLabels}><span>{formatCompact(maxTrend)}</span><span>{formatCompact(maxTrend * .66)}</span><span>{formatCompact(maxTrend * .33)}</span><span>0</span></div>
              <div className={styles.graph}>
                <div className={styles.gridLine} /><div className={styles.gridLine} /><div className={styles.gridLine} /><div className={styles.gridLine} />
                <div className={styles.areaFill} style={{ clipPath: `polygon(${trend.map((p, i) => `${(i/(trend.length-1))*100}% ${100 - (p.value/maxTrend)*82}%`).join(', ')}, 100% 100%, 0% 100%)` }} />
                <div className={styles.line}>
                  {trend.map((p, i) => <span key={p.date} style={{ left: `${(i/(trend.length-1))*100}%`, bottom: `${(p.value/maxTrend)*82}%` }} />)}
                </div>
              </div>
            </div>
            <div className={styles.xLabels}><span>1</span><span>7</span><span>14</span><span>21</span><span>30</span></div>
          </article>

          <article className={`${styles.panel} ${styles.sidePanel}`}>
            <div className={styles.panelHead}><div><span className={styles.panelKicker}>Store health</span><h2>At a glance</h2></div></div>
            <div className={styles.healthList}>
              <div><span>Active products</span><b>{productCount}</b></div>
              <div><span>Low-stock variants</span><b>{lowStock}</b></div>
              <div><span>New inquiries</span><b>{pendingInquiries}</b></div>
              <div><span>Total inquiries</span><b>{inquiryCount}</b></div>
            </div>
            <div className={styles.healthCallout}><span>Inventory watch</span><strong>{lowStock === 0 ? "All clear" : `${lowStock} need attention`}</strong></div>
          </article>
        </section>

        <section className={styles.bottomGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHead}><div><span className={styles.panelKicker}>Merchandising</span><h2>Top products</h2></div></div>
            <div className={styles.productTable}>
              <div className={styles.tableHead}><span>Product</span><span>Units</span><span>Revenue</span></div>
              {topProductData.length ? topProductData.map((p, i) => (
                <div className={styles.tableRow} key={`${p.name}-${i}`}><div><b>{p.name}</b><small>{p.category}</small></div><span>{p.units}</span><strong>{formatINR(p.revenue)}</strong></div>
              )) : <div className={styles.empty}>No order data yet.</div>}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}><div><span className={styles.panelKicker}>Mix</span><h2>Category revenue</h2></div></div>
            <div className={styles.categoryList}>
              {categoryData.length ? categoryData.map(([name, value], index) => {
                const width = (value / Math.max(categoryData[0][1], 1)) * 100;
                return <div className={styles.categoryItem} key={name}><div className={styles.categoryMeta}><span>{name}</span><strong>{formatINR(value)}</strong></div><div className={styles.categoryTrack}><i style={{ width: `${width}%`, animationDelay: `${index * 70}ms` }} /></div></div>;
              }) : <div className={styles.empty}>No category sales yet.</div>}
            </div>
            <div className={styles.statusStrip}>{statusCounts.map((item) => <span key={item.status}><b>{item.count}</b>{item.status.toLowerCase()}</span>)}</div>
          </article>
        </section>
      </div>
    </AdminShell>
  );
}
