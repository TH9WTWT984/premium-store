import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StoreHeader from "@/app/components/store-header";
import styles from "./order-detail.module.css";

export const dynamic = "force-dynamic";

function money(value: unknown) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: Date) {
  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function AccountOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      items: true,
      address: true,
      payment: true,
    },
  });

  if (!order) notFound();

  return (
    <div className={styles.page}>
      <StoreHeader />

      <main className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link href="/account">Account</Link>
          <span>→</span>
          <Link href="/account/orders">Orders</Link>
          <span>→</span>
          <strong>{order.orderNumber}</strong>
        </div>

        <section className={styles.header}>
          <div>
            <div className={styles.eyebrow}>ORDER DETAIL</div>
            <h1 className="serif">{order.orderNumber}</h1>
            <p>Placed on {formatDate(order.createdAt)}</p>
          </div>

          <div className={styles.status}>
            <span className={styles.statusDot} />
            <strong>
              {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
            </strong>
            <small>
              {order.payment?.status
                ? `Payment · ${order.payment.status.toLowerCase()}`
                : "Payment status unavailable"}
            </small>
          </div>
        </section>

        <section className={styles.layout}>
          <div className={styles.mainColumn}>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <div className={styles.eyebrow}>PURCHASE</div>
                  <h2 className="serif">Your pieces</h2>
                </div>
                <span>
                  {order.items.length} item
                  {order.items.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className={styles.items}>
                {order.items.map((item, index) => (
                  <div className={styles.item} key={item.id}>
                    <div className={styles.itemNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className={styles.itemInfo}>
                      <strong>{item.name}</strong>
                      <span>Qty {item.quantity}</span>
                      {item.sku && <span>SKU · {item.sku}</span>}
                    </div>
                    <strong>{money(item.total)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.totalPanel}>
              <div>
                <span>Order total</span>
                <strong>{money(order.total)}</strong>
              </div>
              <span>Final amount recorded for this purchase.</span>
            </div>
          </div>

          <aside className={styles.sideColumn}>
            <div className={styles.panel}>
              <div className={styles.eyebrow}>DELIVERY</div>
              <h2 className="serif">Shipping address</h2>

              {order.address ? (
                <address>
                  <strong>
                    {order.address.firstName} {order.address.lastName || ""}
                  </strong>
                  <span>{order.address.line1}</span>
                  {order.address.line2 && <span>{order.address.line2}</span>}
                  <span>
                    {order.address.city}, {order.address.state}{" "}
                    {order.address.postalCode}
                  </span>
                  <span>{order.address.country}</span>
                  <span>{order.address.phone}</span>
                </address>
              ) : (
                <p className={styles.muted}>
                  No shipping address is attached to this order.
                </p>
              )}
            </div>

            <div className={styles.actions}>
              <Link href="/account/orders" className={styles.outlineButton}>
                Back to orders
              </Link>
              <Link href="/shop" className={styles.darkButton}>
                Continue shopping
              </Link>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
