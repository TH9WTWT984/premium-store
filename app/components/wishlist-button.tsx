"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WishlistButton({ productId, initialWishlisted, compact = false }: { productId: string; initialWishlisted: boolean; compact?: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(initialWishlisted);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function toggle() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/wishlist${active ? `?productId=${encodeURIComponent(productId)}` : ""}`, {
        method: active ? "DELETE" : "POST",
        headers: active ? undefined : { "Content-Type": "application/json" },
        body: active ? undefined : JSON.stringify({ productId }),
      });
      const payload = await response.json();

      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (!response.ok) throw new Error(payload.error || "Unable to update wishlist.");

      setActive(Boolean(payload.wishlisted));
      setMessage(payload.wishlisted ? "Saved" : "Removed");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update wishlist.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wishlist-action">
      <button type="button" aria-label={active ? "Remove from wishlist" : "Save to wishlist"} className={`wishlist-button ${compact ? "wishlist-compact" : ""} ${active ? "is-active" : ""}`} onClick={toggle} disabled={busy}>
        {active ? "♥" : "♡"}{!compact && (active ? " Saved" : " Save to wishlist")}
      </button>
      {message && <span className="cart-action-message">{message}</span>}
    </div>
  );
}
