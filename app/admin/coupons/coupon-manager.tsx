"use client";

import { useEffect, useMemo, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: string | number;
  minOrderAmount: string | number | null;
  maxDiscount: string | number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  _count?: { usages: number };
};

type FormState = {
  id?: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  code: "",
  type: "PERCENTAGE",
  value: "10",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
});

function money(value: string | number | null | undefined) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function dateInput(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/coupons", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load coupons.");
      setCoupons(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load coupons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function edit(coupon: Coupon) {
    setMessage("");
    setError("");
    setForm({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount == null ? "" : String(coupon.minOrderAmount),
      maxDiscount: coupon.maxDiscount == null ? "" : String(coupon.maxDiscount),
      usageLimit: coupon.usageLimit == null ? "" : String(coupon.usageLimit),
      startsAt: dateInput(coupon.startsAt),
      expiresAt: dateInput(coupon.expiresAt),
      isActive: coupon.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setForm(emptyForm());
    setError("");
    setMessage("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const endpoint = form.id ? `/api/admin/coupons/${form.id}` : "/api/admin/coupons";
      const response = await fetch(endpoint, {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save coupon.");

      setMessage(form.id ? "Coupon updated." : "Coupon created.");
      reset();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save coupon.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(coupon: Coupon) {
    const used = coupon.usedCount > 0 || Boolean(coupon._count?.usages);
    const prompt = used
      ? `This coupon has ${coupon.usedCount} recorded use(s). It will be deactivated instead of deleted. Continue?`
      : `Delete coupon ${coupon.code}?`;
    if (!window.confirm(prompt)) return;

    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to remove coupon.");
      setMessage(payload.deactivated ? `${coupon.code} was deactivated because it has usage history.` : `${coupon.code} deleted.`);
      if (form.id === coupon.id) reset();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to remove coupon.");
    }
  }

  const activeCount = useMemo(() => coupons.filter((coupon) => coupon.isActive).length, [coupons]);
  const totalUses = useMemo(() => coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0), [coupons]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <div className="eyebrow">Commerce</div>
          <h1 className="serif admin-page-title">Coupons</h1>
          <p className="admin-muted">Create and manage discount codes used by checkout.</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card"><div className="eyebrow">Total coupons</div><div className="admin-stat-value">{coupons.length}</div></div>
        <div className="admin-stat-card"><div className="eyebrow">Active</div><div className="admin-stat-value">{activeCount}</div></div>
        <div className="admin-stat-card"><div className="eyebrow">Recorded uses</div><div className="admin-stat-value">{totalUses}</div></div>
      </div>

      <div className="admin-grid-two">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <div className="eyebrow">{form.id ? "Edit coupon" : "New coupon"}</div>
              <h2 className="serif admin-panel-title">{form.id ? form.code : "Create a discount code"}</h2>
            </div>
            {form.id && <button type="button" className="btn btn-light" onClick={reset}>Cancel</button>}
          </div>

          <form className="admin-form" onSubmit={submit}>
            <div className="admin-field-grid">
              <label className="admin-field full"><span>Coupon code</span><input className="field" required maxLength={40} value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} placeholder="SAVE10" /></label>

              <label className="admin-field"><span>Discount type</span><select className="field" value={form.type} onChange={(e) => update("type", e.target.value as FormState["type"])}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed amount</option></select></label>
              <label className="admin-field"><span>{form.type === "PERCENTAGE" ? "Discount %" : "Discount amount (INR)"}</span><input className="field" required type="number" min="0.01" step="0.01" value={form.value} onChange={(e) => update("value", e.target.value)} /></label>

              <label className="admin-field"><span>Minimum order (INR)</span><input className="field" type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={(e) => update("minOrderAmount", e.target.value)} placeholder="500" /></label>
              <label className="admin-field"><span>Maximum discount (INR)</span><input className="field" type="number" min="0.01" step="0.01" value={form.maxDiscount} onChange={(e) => update("maxDiscount", e.target.value)} placeholder="Leave empty for none" /></label>

              <label className="admin-field"><span>Total usage limit</span><input className="field" type="number" min="1" step="1" value={form.usageLimit} onChange={(e) => update("usageLimit", e.target.value)} placeholder="Leave empty for unlimited" /></label>
              <label className="admin-field"><span>Starts at</span><input className="field" type="datetime-local" value={form.startsAt} onChange={(e) => update("startsAt", e.target.value)} /></label>
              <label className="admin-field"><span>Expires at</span><input className="field" type="datetime-local" value={form.expiresAt} onChange={(e) => update("expiresAt", e.target.value)} /></label>

              <label className="admin-check full"><input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} /><span>Coupon is active</span></label>
            </div>

            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-success">{message}</p>}
            <button className="btn btn-dark" disabled={saving}>{saving ? "Saving…" : form.id ? "Update coupon" : "Create coupon"}</button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <div className="eyebrow">Existing codes</div>
              <h2 className="serif admin-panel-title">Coupon library</h2>
            </div>
            <button type="button" className="btn btn-light" onClick={() => void load()} disabled={loading}>Refresh</button>
          </div>

          <div className="admin-table-wrap">
            {loading ? <div className="admin-empty">Loading coupons…</div> : coupons.length === 0 ? <div className="admin-empty">No coupons yet.</div> : (
              <table className="admin-table">
                <thead><tr><th>Code</th><th>Discount</th><th>Usage</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td><strong>{coupon.code}</strong><div className="admin-muted">{coupon.minOrderAmount ? `Min ₹${money(coupon.minOrderAmount)}` : "No minimum"}</div></td>
                      <td>{coupon.type === "PERCENTAGE" ? `${money(coupon.value)}%` : `₹${money(coupon.value)}`}{coupon.maxDiscount ? <div className="admin-muted">Cap ₹{money(coupon.maxDiscount)}</div> : null}</td>
                      <td>{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : " / ∞"}</td>
                      <td><span className="admin-pill">{coupon.isActive ? "ACTIVE" : "INACTIVE"}</span></td>
                      <td><div className="admin-actions"><button type="button" className="admin-link" onClick={() => edit(coupon)}>Edit</button><button type="button" className="admin-danger-link" onClick={() => void remove(coupon)}>{coupon.usedCount || coupon._count?.usages ? "Deactivate" : "Delete"}</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
