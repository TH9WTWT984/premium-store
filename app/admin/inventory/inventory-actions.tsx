 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InventoryVariant = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  isActive: boolean;
  product: {
    id: string;
    name: string;
    sku: string | null;
    status: string;
  };
};

type Props = {
  variants: InventoryVariant[];
};

export default function InventoryActions({ variants }: Props) {
  const router = useRouter();
  const [variantId, setVariantId] = useState("");
  const [type, setType] = useState("RESTOCK");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, type, quantity, reason }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update inventory.");
      }

      setMessage(`Stock updated: ${payload.stockBefore} → ${payload.stockAfter}`);
      setQuantity("1");
      setReason("");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update inventory."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-inventory-actions">
      <form
        className="admin-panel"
        onSubmit={submit}
        style={{ padding: 20, marginBottom: 24 }}
      >
        <div className="eyebrow">Stock adjustment</div>
        <h2 className="serif" style={{ margin: "6px 0 18px" }}>
          Update inventory
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 2fr) minmax(150px, 1fr) minmax(120px, .7fr)",
            gap: 12,
          }}
        >
          <select
            className="field"
            value={variantId}
            onChange={(event) => setVariantId(event.target.value)}
            required
          >
            <option value="">Select variant</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.product.name} — {variant.name} — {variant.stock} in stock
              </option>
            ))}
          </select>

          <select
            className="field"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="RESTOCK">Restock</option>
            <option value="RETURN">Return</option>
            <option value="ADJUSTMENT">Adjustment +</option>
          </select>

          <input
            className="field"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Quantity"
            required
          />
        </div>

        <textarea
          className="field"
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason for stock change (optional)"
          style={{ width: "100%", marginTop: 12, resize: "vertical" }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          <button className="btn btn-dark" type="submit" disabled={saving}>
            {saving ? "Updating..." : "Update stock"}
          </button>

          {message && <span className="admin-muted">{message}</span>}

          {error && (
            <span style={{ color: "#9a3f31", fontSize: 13 }}>{error}</span>
          )}
        </div>
      </form>
    </div>
  );
}
