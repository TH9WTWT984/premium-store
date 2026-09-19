import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCartSummary } from "@/lib/cart";
import StoreHeader from "../components/store-header";
import CartClient from "../components/cart-client";
import Phase6Styles from "../components/phase6-styles";
import StoreFooter from "../components/store-footer";

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=%2Fcart");
  }

  const { cart, subtotal, itemCount } = await getCartSummary(user.id);

  return (
    <>
      <Phase6Styles />
      <StoreHeader />
      <main className="container section">
        <div className="eyebrow">Shopping bag</div>

        <div className="shop-heading">
          <div>
            <h1 className="serif shop-title">Your bag</h1>
            <p className="admin-muted">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </p>
          </div>
          <Link className="link" href="/shop">
            Continue shopping
          </Link>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="catalog-empty large">
            <div className="eyebrow">Nothing here yet</div>
            <h2 className="serif">Your bag is waiting.</h2>
            <Link className="btn btn-dark" href="/shop">
              Browse the collection
            </Link>
          </div>
        ) : (
          <CartClient
            items={cart.items.map((item) => ({
              id: item.id,
              quantity: item.quantity,
              product: {
                name: item.product.name,
                // Convert Prisma Decimal to a plain number before
                // passing props from this Server Component to the Client Component.
                price: Number(item.unitPrice),
                images: item.product.images,
              },
              variant: item.variant
                ? {
                    name: item.variant.name,
                    price: Number(item.unitPrice),
                  }
                : null,
            }))}
            subtotal={subtotal}
          />
        )}
      </main>
      <StoreFooter />
    </>
  );
}
