"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const OPTIONS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function OrderStatusEditor({ orderId, currentStatus, canWrite }: { orderId: string; currentStatus: string; canWrite: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!canWrite || status === currentStatus) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update order status.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update order status.");
      setStatus(currentStatus);
    } finally {
      setSaving(false);
    }
  }

  return <div className="order-status-editor">
    <select className="field" value={status} onChange={(event) => setStatus(event.target.value)} disabled={!canWrite || saving}>
      {OPTIONS.map((option) => <option key={option} value={option}>{option.charAt(0) + option.slice(1).toLowerCase()}</option>)}
    </select>
    <button className="btn btn-dark" type="button" disabled={!canWrite || saving || status === currentStatus} onClick={save}>{saving ? "Saving…" : "Update status"}</button>
    {!canWrite && <p className="admin-muted">Your role has read-only order access.</p>}
    {error && <p className="form-error">{error}</p>}
  </div>;
}
