import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StoreHeader from "../../components/store-header";
import Phase6Styles from "../../components/phase6-styles";
import Phase7Styles from "../../components/phase7-styles";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect(`/login?next=/orders/${encodeURIComponent(id)}`);
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: id,
      userId: user.id,
    },
    include: {
      items: true,
      address: true,
    },
  });

  if (!order) notFound();

  return (
    <>
      <Phase7Styles />
      <Phase6Styles />
      <StoreHeader />
      <main className="container section">
        <div className="eyebrow">Order confirmation</div>
        <h1 className="serif shop-title">#{order.orderNumber}</h1>
        <p className="admin-muted">
          Order status: {order.status} · Placed{" "}
          {order.createdAt.toLocaleDateString("en-IN")}
        </p>

        <div className="order-detail-grid">
          <section className="admin-panel">
            <div className="eyebrow">Items</div>
            <h2 className="serif admin-panel-title">Your order</h2>

            <div className="checkout-items">
              {order.items.map((item) => (
                <div className="checkout-line" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {item.quantity} × ₹
                      {Number(item.unitPrice).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <span>
                    ₹
                    {Number(item.total).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>₹{Number(order.subtotal).toLocaleString("en-IN")}</strong>
            </div>
            <div className="cart-summary-row muted">
              <span>Shipping</span>
              <span>₹{Number(order.shipping).toLocaleString("en-IN")}</span>
            </div>
            <div className="cart-summary-row muted">
              <span>Tax</span>
              <span>₹{Number(order.tax).toLocaleString("en-IN")}</span>
            </div>
            <div className="cart-summary-row checkout-total">
              <span>Total</span>
              <strong>₹{Number(order.total).toLocaleString("en-IN")}</strong>
            </div>
          </section>

          <aside className="admin-panel">
            <div className="eyebrow">Delivery</div>
            <h2 className="serif admin-panel-title">Shipping address</h2>

            {order.address ? (
              <p className="order-address">
                {order.address.firstName} {order.address.lastName || ""}
                <br />
                {order.address.line1}
                <br />
                {order.address.line2 && <>{order.address.line2}<br /></>}
                {order.address.city}, {order.address.state} {order.address.postalCode}
                <br />
                {order.address.country}
                <br />
                {order.address.phone}
              </p>
            ) : (
              <p className="admin-muted">No shipping address attached.</p>
            )}

            <Link className="link" href="/shop">Continue shopping</Link>
          </aside>
        </div>
      </main>
    </>
  );
}
