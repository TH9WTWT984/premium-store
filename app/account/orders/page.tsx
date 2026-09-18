import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function money(value: unknown) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Faccount%2Forders");

  const orders = await prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50, include: { payment: { select: { status: true } }, _count: { select: { items: true } } } });

  return <>
    <header className="header"><div className="container nav"><Link href="/shop">Shop</Link><Link href="/" className="logo">ATELIER</Link><Link href="/account">Account</Link></div></header>
    <main className="container section account-orders-page">
      <Link href="/account" className="account-back">← Account</Link>
      <div className="eyebrow">Your orders</div>
      <h1 className="serif account-orders-title">Order history</h1>
      <p className="account-orders-intro">Every purchase, payment status and delivery update in one place.</p>
      <section className="account-order-list">
        {orders.map((order) => <Link href={`/account/orders/${order.id}`} className="account-order-card" key={order.id}><div><span className="eyebrow">{order.orderNumber}</span><h2 className="serif">{order.createdAt.toLocaleDateString("en-IN")}</h2><p>{order._count.items} {order._count.items === 1 ? "item" : "items"} · {order.payment?.status || "PENDING"}</p></div><div className="account-order-card-right"><strong>{money(order.total)}</strong><span className="account-order-status">{order.status.charAt(0) + order.status.slice(1).toLowerCase()}</span></div></Link>)}
        {orders.length === 0 && <div className="account-empty"><div className="eyebrow">Nothing here yet</div><h2 className="serif">Your first order is waiting.</h2><Link className="btn btn-dark" href="/shop">Explore the shop</Link></div>}
      </section>
    </main>
  </>;
}
