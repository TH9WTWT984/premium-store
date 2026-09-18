"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({
  productId,
  variantId,
  maxStock,
}: {
  productId: string;
  variantId?: string | null;
  maxStock: number | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function add() {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId: variantId || null, quantity: 1 }),
      });

      const payload = await response.json();

      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (!response.ok) throw new Error(payload.error || "Unable to add to bag.");

      setMessage("Added to bag");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add to bag.");
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || maxStock === 0;

  return (
    <div className="cart-action-stack">
      <button type="button" className="btn btn-dark product-buy-button" onClick={add} disabled={disabled}>
        {busy ? "Adding…" : maxStock === 0 ? "Out of stock" : "Add to bag"}
      </button>
      {message && <div className="cart-action-message" role="status">{message}</div>}
    </div>
  );
}
