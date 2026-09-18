import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StoreHeader from "../../../components/store-header";
import Phase6Styles from "../../../components/phase6-styles";
import Phase7Styles from "../../../components/phase7-styles";
import RazorpayCheckout from "../../../components/razorpay-checkout";
import { isPendingOrderExpired } from "@/lib/order-expiry";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=%2Fcheckout");
  }

  const { orderId } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id,
    },
    include: {
      items: true,
      payment: true,
      address: true,
    },
  });

  if (!order) {
    notFound();
  }

  if (order.status === "CONFIRMED" || order.payment?.status === "PAID") {
    redirect(`/account/orders/${order.id}`);
  }

  if (order.status !== "PENDING") {
    redirect(`/account/orders/${order.id}`);
  }

  if (isPendingOrderExpired(order.createdAt)) {
    await prisma.order.updateMany({
      where: {
        id: order.id,
        status: "PENDING",
      },
      data: {
        status: "CANCELLED",
      },
    });

    redirect(`/account/orders/${order.id}`);
  }

  const amount = Number(order.total);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid order amount.");
  }

  const formattedAmount = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <>
      <Phase7Styles />
      <Phase6Styles />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .payment-page{max-width:760px;margin:0 auto}
            .payment-page-head{text-align:center;max-width:620px;margin:0 auto 30px}
            .payment-page-head h1{margin:9px 0 10px;font-size:clamp(42px,6vw,68px);line-height:.98;letter-spacing:-.04em}
            .payment-page-head p{margin:0;color:var(--muted);font-size:14px;line-height:1.7}
            .payment-card{border:1px solid var(--line);background:#f8f7f3}
            .payment-card-top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:24px;border-bottom:1px solid var(--line)}
            .payment-order-number{font-size:13px;font-weight:500;letter-spacing:.05em}
            .payment-status{display:inline-flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid var(--line);font-size:10px;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
            .payment-status-dot{width:7px;height:7px;border-radius:999px;background:#9a6b4f}
            .payment-lines{padding:6px 24px 0}
            .payment-line{display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-bottom:1px solid var(--line);font-size:13px}
            .payment-line:last-child{border-bottom:0}
            .payment-line span:first-child{color:var(--muted)}
            .payment-total{display:flex;align-items:end;justify-content:space-between;gap:20px;padding:24px}
            .payment-total-label{color:var(--muted);font-size:12px;letter-spacing:.04em}
            .payment-total-value{font-family:"Playfair Display",serif;font-size:40px;line-height:1}
            .payment-cta{padding:0 24px 24px}
            .payment-cta .payment-action{margin-top:0}
            .payment-cta .checkout-submit{width:100%;min-height:58px}
            .payment-trust{text-align:center;margin:14px 0 0;color:var(--muted);font-size:10px;line-height:1.6}
            .payment-back{text-align:center;margin-top:18px}
            .payment-back a{font-size:11px;color:var(--muted);text-decoration:underline;text-underline-offset:4px}
            .payment-secure{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;margin-top:24px;color:var(--muted);font-size:10px;letter-spacing:.03em}
            .payment-secure span{display:inline-flex;align-items:center;gap:6px}
            .checkout-empty-state{max-width:620px;margin:80px auto;text-align:center;border:1px solid var(--line);padding:56px 28px;background:#f8f7f3}
            .checkout-empty-state h1{margin:10px 0;font-size:52px;line-height:1}
            .checkout-empty-state p{margin:0 auto 24px;max-width:420px}
            @media (max-width:640px){
              .payment-card-top{padding:18px}
              .payment-lines{padding:2px 18px 0}
              .payment-total,.payment-cta{padding-left:18px;padding-right:18px}
              .payment-total-value{font-size:34px}
              .payment-page-head h1{font-size:44px}
              .payment-status{font-size:9px}
            }
          `,
        }}
      />

      <StoreHeader />

      <main className="container section">
        <div className="payment-page">
          <div className="payment-page-head">
            <div className="eyebrow">Secure checkout</div>

            <h1 className="serif">Almost there.</h1>

            <p>
              Your order has been created. Complete the secure payment below
              to confirm it.
            </p>
          </div>

          <section className="payment-card" aria-label="Payment summary">
            <div className="payment-card-top">
              <div>
                <div className="eyebrow">Order</div>
                <div className="payment-order-number">
                  #{order.orderNumber}
                </div>
              </div>

              <div className="payment-status">
                <span
                  className="payment-status-dot"
                  aria-hidden="true"
                />
                Payment pending
              </div>
            </div>

            <div className="payment-lines">
              <div className="payment-line">
                <span>Items</span>
                <span>
                  {order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}
                </span>
              </div>

              <div className="payment-line">
                <span>Subtotal</span>
                <span>
                  ₹
                  {Number(order.subtotal).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="payment-line">
                <span>Shipping</span>
                <span>
                  ₹
                  {Number(order.shipping).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="payment-line">
                <span>Taxes</span>
                <span>
                  ₹
                  {Number(order.tax).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {Number(order.discount) > 0 && (
                <div className="payment-line">
                  <span>Discount</span>
                  <span>
                    − ₹
                    {Number(order.discount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="payment-total">
              <div className="payment-total-label">Amount due</div>
              <div className="payment-total-value">
                ₹{formattedAmount}
              </div>
            </div>

            <div className="payment-cta">
              <RazorpayCheckout
                orderId={order.id}
                orderNumber={order.orderNumber}
                amount={amount}
                email={user.email}
                contact={order.address?.phone || user.phone}
              />

              <p className="payment-trust">
                Payment is verified securely on the server before your order
                is confirmed.
              </p>

              <div
                className="payment-secure"
                aria-label="Security information"
              >
                <span>⌁ Secure payment</span>
                <span>◉ Razorpay</span>
                <span>✓ Server verified</span>
              </div>
            </div>
          </section>

          <div className="payment-back">
            <Link href="/shop">← Continue shopping</Link>
          </div>
        </div>
      </main>
    </>
  );
}