import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";
import CancelOrderButton from "./cancel-order-button";

function money(value: unknown) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function AdminOrdersPage() {
  const admin = await requireAdminPermission("orders.read");
  const expiryCutoff = new Date(Date.now() - Number(process.env.PENDING_ORDER_TIMEOUT_MINUTES ?? 30) * 60_000);
  await prisma.order.updateMany({ where: { status: "PENDING", createdAt: { lt: expiryCutoff } }, data: { status: "CANCELLED" } });

  const orders = await prisma.order.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      payment: { select: { status: true, provider: true, paidAt: true } },
      _count: { select: { items: true } },
    },
  });

  const pending = orders.filter((order) => order.status === "PENDING").length;
  const confirmed = orders.filter((order) => order.status === "CONFIRMED").length;
  const processing = orders.filter((order) => order.status === "PROCESSING").length;
  const revenue = orders
    .filter((order) => ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <AdminShell
      adminName={admin.name}
      adminRole={admin.role.name}
      permissions={admin.role.permissions.map((permission) => permission.key)}
    >
      <div className="admin-content">
        <div className="admin-topbar">
          <div>
            <div className="eyebrow">Commerce</div>
            <h1 className="serif admin-title">Orders</h1>
            <p className="admin-muted">Review payments, fulfillment status and customer orders from one place.</p>
          </div>
        </div>

        <section className="admin-stat-grid">
          <div className="admin-stat-card"><div className="eyebrow">Pending</div><div className="admin-stat-value">{pending}</div><div className="admin-muted">Awaiting payment or review</div></div>
          <div className="admin-stat-card"><div className="eyebrow">Confirmed</div><div className="admin-stat-value">{confirmed}</div><div className="admin-muted">Payment confirmed</div></div>
          <div className="admin-stat-card"><div className="eyebrow">Processing</div><div className="admin-stat-value">{processing}</div><div className="admin-muted">Being prepared</div></div>
          <div className="admin-stat-card"><div className="eyebrow">Captured value</div><div className="admin-stat-value">{money(revenue)}</div><div className="admin-muted">Confirmed and fulfilled orders</div></div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <div className="eyebrow">Latest activity</div>
              <h2 className="serif admin-panel-title">Recent orders</h2>
            </div>
            <span className="admin-pill">{orders.length} shown</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {orders.map((order) => {
                  const customer = order.user ? `${order.user.firstName}${order.user.lastName ? ` ${order.user.lastName}` : ""}` : "Guest";
                  return <tr key={order.id}>
                    <td><strong>{order.orderNumber}</strong></td>
                    <td><span>{customer}</span><small>{order.user?.email || "—"}</small></td>
                    <td>{order.createdAt.toLocaleDateString("en-IN")}</td>
                    <td>{order._count.items}</td>
                    <td><strong>{money(order.total)}</strong></td>
                    <td><span className="order-status order-status-payment">{order.payment?.status || "PENDING"}</span></td>
                    <td><span className="order-status">{statusLabel(order.status)}</span></td>
                    <td>
                      <div className="admin-order-actions">
                        <Link className="admin-inline-link admin-inline-link-dark" href={`/admin/orders/${order.id}`}>Open →</Link>
                        {order.status === "PENDING" && order.payment?.status === "PENDING" && (
                          <CancelOrderButton orderId={order.id} orderNumber={order.orderNumber} />
                        )}
                      </div>
                    </td>
                  </tr>;
                })}
                {orders.length === 0 && <tr><td colSpan={8}><div className="admin-empty">No orders yet.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
