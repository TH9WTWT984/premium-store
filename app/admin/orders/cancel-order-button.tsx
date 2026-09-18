"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CancelOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function cancelOrder() {
    const confirmed = window.confirm(
      `Cancel order ${orderNumber}?\n\nThis will NOT permanently delete the order. It will be marked as Cancelled and kept in the records.`
    );
    if (!confirmed) return;

    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Unable to cancel order.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to cancel order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="order-cancel-action">
      <button className="order-cancel-button" type="button" onClick={cancelOrder} disabled={saving}>
        {saving ? "Cancelling…" : "Cancel"}
      </button>
      {error && <span className="order-cancel-error">{error}</span>}
    </div>
  );
}
