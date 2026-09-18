"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductImage from "./product-image";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    name: string;
    price: unknown;
    images: { url: string; alt: string | null }[];
  };
  variant: { name: string; price: unknown } | null;
};

export default function CartClient({ items, subtotal }: { items: CartItem[]; subtotal: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function update(itemId: string, quantity: number) {
    setBusy(itemId);
    setError("");
    try {
      const response = await fetch("/api/cart/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update cart.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update cart.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(itemId: string) {
    setBusy(itemId);
    setError("");
    try {
      const response = await fetch(`/api/cart/items?itemId=${encodeURIComponent(itemId)}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to remove item.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to remove item.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="cart-layout">
      <section>
        {error && <p className="form-error">{error}</p>}
        <div className="cart-items">
          {items.map((item) => {
            const unitPrice = Number(item.variant?.price ?? item.product.price);
            return (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  <ProductImage src={item.product.images[0]?.url} alt={item.product.images[0]?.alt || item.product.name} />
                </div>
                <div className="cart-item-copy">
                  <div className="cart-item-top">
                    <div>
                      <h2 className="serif">{item.product.name}</h2>
                      {item.variant && <div className="cart-item-variant">{item.variant.name}</div>}
                    </div>
                    <strong>₹{(unitPrice * item.quantity).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="cart-item-bottom">
                    <div className="quantity-control">
                      <button type="button" onClick={() => update(item.id, item.quantity - 1)} disabled={busy === item.id || item.quantity <= 1}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => update(item.id, item.quantity + 1)} disabled={busy === item.id}>+</button>
                    </div>
                    <div className="cart-item-unit">₹{unitPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })} each</div>
                    <button type="button" className="admin-danger-link" onClick={() => remove(item.id)} disabled={busy === item.id}>Remove</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="cart-summary">
        <div className="eyebrow">Your bag</div>
        <h2 className="serif">Order summary</h2>
        <div className="cart-summary-row"><span>Subtotal</span><strong>₹{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong></div>
        <div className="cart-summary-row muted"><span>Shipping</span><span>Calculated at checkout</span></div>
        <div className="cart-summary-row muted"><span>Taxes</span><span>Calculated at checkout</span></div>
        <a className="btn btn-dark cart-checkout-button" href="/checkout">Continue to checkout</a>
        <p className="cart-note">Your price and inventory are revalidated on the server when the order is placed.</p>
      </aside>
    </div>
  );
}
