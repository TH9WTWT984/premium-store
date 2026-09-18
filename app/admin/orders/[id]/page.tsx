import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";
import OrderStatusEditor from "./status-editor";
import CancelOrderButton from "../cancel-order-button";

function money(value: unknown) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPermission("orders.read");
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      address: true,
      items: { include: { product: { select: { name: true, slug: true } }, variant: { select: { name: true, sku: true } } } },
      payment: true,
    },
  });
  if (!order) notFound();

  return <AdminShell adminName={admin.name} adminRole={admin.role.name} permissions={admin.role.permissions.map((permission) => permission.key)}>
    <div className="admin-content">
      <div className="admin-topbar">
        <div><div className="eyebrow">Order detail</div><h1 className="serif admin-title">{order.orderNumber}</h1><p className="admin-muted">Created {order.createdAt.toLocaleString("en-IN")}</p></div>
        <div className="admin-topbar-actions">
          {order.status === "PENDING" && order.payment?.status === "PENDING" && (
            <CancelOrderButton orderId={order.id} orderNumber={order.orderNumber} />
          )}
          <Link className="btn btn-light" href="/admin/orders">Back to orders</Link>
        </div>
      </div>

      <div className="admin-grid-two">
        <section className="admin-panel">
          <div className="admin-panel-head"><div><div className="eyebrow">Fulfillment</div><h2 className="serif admin-panel-title">Order status</h2></div></div>
          <div className="admin-order-detail-pad">
            <OrderStatusEditor orderId={order.id} currentStatus={order.status} canWrite={admin.role.permissions.some((permission) => permission.key === "orders.write")} />
            <div className="order-progress">
              {["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map((status) => <div key={status} className={`order-progress-step ${status === order.status ? "active" : ""} ${["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].indexOf(status) < ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].indexOf(order.status) ? "done" : ""}`}><span>{status === "CONFIRMED" ? "Confirmed" : status.charAt(0) + status.slice(1).toLowerCase()}</span></div>)}
            </div>
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-head"><div><div className="eyebrow">Payment</div><h2 className="serif admin-panel-title">Razorpay</h2></div></div>
          <div className="admin-order-detail-pad">
            <div className="order-kv"><span>Status</span><strong>{order.payment?.status || "PENDING"}</strong></div>
            <div className="order-kv"><span>Amount</span><strong>{money(order.payment?.amount ?? order.total)}</strong></div>
            <div className="order-kv"><span>Provider payment</span><span>{order.payment?.providerPaymentId || "Not paid yet"}</span></div>
            <div className="order-kv"><span>Paid at</span><span>{order.payment?.paidAt ? order.payment.paidAt.toLocaleString("en-IN") : "—"}</span></div>
          </div>
        </section>
      </div>

      <div className="admin-grid-two">
        <section className="admin-panel">
          <div className="admin-panel-head"><div><div className="eyebrow">Customer</div><h2 className="serif admin-panel-title">Customer details</h2></div></div>
          <div className="admin-order-detail-pad">
            <div className="order-kv"><span>Name</span><strong>{order.user ? `${order.user.firstName} ${order.user.lastName || ""}`.trim() : "Guest checkout"}</strong></div>
            <div className="order-kv"><span>Email</span><span>{order.user?.email || "—"}</span></div>
            <div className="order-kv"><span>Phone</span><span>{order.user?.phone || order.address?.phone || "—"}</span></div>
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-head"><div><div className="eyebrow">Shipping</div><h2 className="serif admin-panel-title">Delivery address</h2></div></div>
          <div className="admin-order-detail-pad">
            {order.address ? <p className="order-address">{order.address.firstName} {order.address.lastName || ""}<br />{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />{order.address.city}, {order.address.state} {order.address.postalCode}<br />{order.address.country}</p> : <p className="admin-muted">No address attached.</p>}
          </div>
        </section>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-head"><div><div className="eyebrow">Line items</div><h2 className="serif admin-panel-title">What was ordered</h2></div></div>
        <div className="admin-order-items">
          {order.items.map((item) => <div className="admin-order-item" key={item.id}><div><strong>{item.name}</strong><span>{item.variant?.name || "Standard"}{item.sku ? ` · ${item.sku}` : ""}</span></div><div><span>{item.quantity} × {money(item.unitPrice)}</span><strong>{money(item.total)}</strong></div></div>)}
          <div className="order-totals"><div><span>Subtotal</span><span>{money(order.subtotal)}</span></div><div><span>Discount</span><span>− {money(order.discount)}</span></div><div><span>Shipping</span><span>{money(order.shipping)}</span></div><div><span>Tax</span><span>{money(order.tax)}</span></div><div className="total"><strong>Total</strong><strong>{money(order.total)}</strong></div></div>
        </div>
      </section>
    </div>
  </AdminShell>;
}
