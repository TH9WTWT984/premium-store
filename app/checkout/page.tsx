import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { validateCheckoutCart } from "@/lib/checkout";
import CheckoutForm from "../components/checkout-form";
import StoreHeader from "../components/store-header";
import Phase6Styles from "../components/phase6-styles";
import Phase7Styles from "../components/phase7-styles";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fcheckout");

  try {
    const checkout = await validateCheckoutCart(user.id);
    const items = checkout.items.map((item) => ({
      id: item.cartItemId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.unitPrice) * item.quantity,
    }));

    return (
      <>
        <Phase7Styles />
        <Phase6Styles />
        <StoreHeader />
        <main className="container section">
          <div className="eyebrow">Checkout</div>
          <div className="shop-heading">
            <div>
              <h1 className="serif shop-title">Complete your order</h1>
              <p className="admin-muted">
                Review your delivery details and continue to secure payment.
              </p>
            </div>
            <Link className="link" href="/cart">Back to bag</Link>
          </div>
          <CheckoutForm
            items={items}
            subtotal={checkout.totals.subtotal}
            customerEmail={user.email}
            customerPhone={user.phone}
          />
        </main>
      </>
    );
  } catch (error) {
    // A successful order clears the cart before payment. If the user later
    // revisits /checkout (or refreshes during development), do not crash the
    // server-rendered page with EMPTY_CART.
    if (error instanceof Error && error.message === "EMPTY_CART") {
      return (
        <>
          <Phase7Styles />
          <Phase6Styles />
          <StoreHeader />
          <main className="container section">
            <div className="checkout-empty-state">
              <div className="eyebrow">Your bag</div>
              <h1 className="serif">Your bag is empty</h1>
              <p className="admin-muted">
                Add an item to your bag before starting checkout.
              </p>
              <Link className="btn btn-dark" href="/shop">Continue shopping</Link>
            </div>
          </main>
        </>
      );
    }
    throw error;
  }
}
