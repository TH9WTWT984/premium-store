"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type InquiryStatus = "NEW" | "CONTACTED" | "QUOTED" | "CONVERTED" | "CLOSED";

type InquiryItem = {
  id: string;
  quantity: number;
  notes: string | null;
  product: { id: string; name: string; slug: string };
  variant: { id: string; name: string } | null;
};

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: InquiryStatus;
  adminNotes: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string | null } | null;
  items: InquiryItem[];
};

const statuses: Array<{ key: "all" | InquiryStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "QUOTED", label: "Quoted" },
  { key: "CONVERTED", label: "Converted" },
  { key: "CLOSED", label: "Closed" },
];

export default function InquiryManager() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<"all" | InquiryStatus>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState<InquiryStatus>("NEW");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (tab !== "all") params.set("status", tab);
      if (query.trim()) params.set("q", query.trim());

      const response = await fetch(`/api/admin/inquiries?${params.toString()}`, {
        cache: "no-store",
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Unable to load inquiries.");

      setItems(payload.items || []);
      setCounts(payload.counts || {});
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load inquiries.");
    } finally {
      setLoading(false);
    }
  }, [query, tab]);

  useEffect(() => {
    const timer = window.setTimeout(load, 180);
    return () => window.clearTimeout(timer);
  }, [load]);

  const totalCount = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts],
  );

  function openInquiry(inquiry: Inquiry) {
    setSelected(inquiry);
    setStatus(inquiry.status);
    setAdminNotes(inquiry.adminNotes || "");
  }

  async function save() {
    if (!selected) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/inquiries/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes.trim() || null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Unable to update inquiry.");

      setSelected((current) =>
        current ? { ...current, status: payload.inquiry.status, adminNotes: payload.inquiry.adminNotes } : current,
      );
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update inquiry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="inquiry-stat-row">
        <div className="inquiry-stat">
          <span className="eyebrow">Total</span>
          <strong>{totalCount}</strong>
        </div>
        <div className="inquiry-stat inquiry-stat-accent">
          <span className="eyebrow">New</span>
          <strong>{counts.NEW || 0}</strong>
        </div>
        <div className="inquiry-stat">
          <span className="eyebrow">Quoted</span>
          <strong>{counts.QUOTED || 0}</strong>
        </div>
      </section>

      <section className="admin-panel inquiry-panel">
        <div className="inquiry-toolbar">
          <div className="inquiry-tabs">
            {statuses.map((item) => (
              <button
                key={item.key}
                className={`inquiry-tab ${tab === item.key ? "active" : ""}`}
                type="button"
                onClick={() => setTab(item.key)}
              >
                {item.label}
                {item.key !== "all" && counts[item.key] ? <span>{counts[item.key]}</span> : null}
              </button>
            ))}
          </div>

          <input
            className="field inquiry-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or company"
          />
        </div>

        {error && <p className="inquiry-error">{error}</p>}

        {loading ? (
          <div className="inquiry-empty">Loading inquiries…</div>
        ) : items.length === 0 ? (
          <div className="inquiry-empty">
            <strong>No inquiries here.</strong>
            <span>Quote requests from the storefront will appear in this queue.</span>
          </div>
        ) : (
          <div className="inquiry-table-wrap">
            <table className="inquiry-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Request</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {items.map((inquiry) => (
                  <tr key={inquiry.id} onClick={() => openInquiry(inquiry)}>
                    <td>
                      <strong>{inquiry.name}</strong>
                      <span>{inquiry.email}</span>
                      {inquiry.company ? <span>{inquiry.company}</span> : null}
                    </td>
                    <td>
                      {inquiry.items[0] ? (
                        <>
                          <strong>{inquiry.items[0].product.name}</strong>
                          <span>{inquiry.items[0].variant?.name || "Standard product"}</span>
                        </>
                      ) : "Product request"}
                    </td>
                    <td>{inquiry.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString("en-IN")}</td>
                    <td><span className={`inquiry-status status-${inquiry.status.toLowerCase()}`}>{inquiry.status}</span></td>
                    <td>{new Date(inquiry.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div className="inquiry-drawer-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setSelected(null);
        }}>
          <aside className="inquiry-drawer" role="dialog" aria-modal="true" aria-label="Inquiry details">
            <button className="inquiry-drawer-close" type="button" onClick={() => setSelected(null)} aria-label="Close">×</button>

            <div className="eyebrow">Inquiry</div>
            <h2 className="serif inquiry-drawer-title">{selected.name}</h2>
            {selected.company && <p className="admin-muted">{selected.company}</p>}

            <div className="inquiry-contact">
              <a href={`mailto:${selected.email}`}>{selected.email}</a>
              {selected.phone && <a href={`tel:${selected.phone}`}>{selected.phone}</a>}
              {selected.user && <span>Linked customer account</span>}
            </div>

            <div className="inquiry-detail-section">
              <div className="eyebrow">Requested items</div>
              {selected.items.map((item) => (
                <div className="inquiry-item-card" key={item.id}>
                  <div>
                    <strong>{item.product.name}</strong>
                    <span>{item.variant?.name || "Standard product"}</span>
                  </div>
                  <strong>×{item.quantity}</strong>
                  {item.notes ? <p>{item.notes}</p> : null}
                </div>
              ))}
            </div>

            {selected.message && (
              <div className="inquiry-detail-section">
                <div className="eyebrow">Customer message</div>
                <p className="inquiry-message">{selected.message}</p>
              </div>
            )}

            <div className="inquiry-detail-section">
              <div className="eyebrow">Admin workflow</div>

              <label className="admin-field">
                <span>Status</span>
                <select className="field" value={status} onChange={(event) => setStatus(event.target.value as InquiryStatus)}>
                  {statuses.filter((item) => item.key !== "all").map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label className="admin-field" style={{ marginTop: 14 }}>
                <span>Internal notes</span>
                <textarea className="field" rows={7} value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} maxLength={5000} placeholder="Record follow-up, quoted price, customer response, etc." />
              </label>

              <button className="btn btn-dark" type="button" disabled={saving} onClick={save} style={{ marginTop: 14 }}>
                {saving ? "Saving…" : "Save inquiry"}
              </button>
            </div>

            <div className="inquiry-detail-section">
              <div className="eyebrow">Product</div>
              {selected.items[0] && (
                <Link className="admin-inline-link" href={`/product/${selected.items[0].product.slug}`} target="_blank">
                  View product ↗
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      <style>{`
        .inquiry-stat-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .inquiry-stat {
          display: grid;
          gap: 8px;
          padding: 18px 20px;
          border: 1px solid rgba(20,20,20,.1);
          border-radius: 14px;
          background: rgba(255,255,255,.56);
        }

        .inquiry-stat strong {
          font-size: 1.8rem;
          font-weight: 600;
        }

        .inquiry-stat-accent {
          box-shadow: inset 0 2px 0 rgba(20,20,20,.74);
        }

        .inquiry-panel {
          overflow: hidden;
        }

        .inquiry-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .inquiry-tabs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .inquiry-tab {
          border: 1px solid transparent;
          border-radius: 999px;
          padding: 8px 11px;
          background: transparent;
          color: rgba(20,20,20,.58);
          cursor: pointer;
          font: inherit;
          font-size: .82rem;
        }

        .inquiry-tab.active {
          border-color: rgba(20,20,20,.11);
          background: #fff;
          color: #1a1a1a;
          box-shadow: 0 5px 18px rgba(20,20,20,.04);
        }

        .inquiry-tab span {
          margin-left: 5px;
          color: rgba(20,20,20,.43);
        }

        .inquiry-search {
          width: min(290px, 100%);
          min-height: 42px;
        }

        .inquiry-table-wrap {
          overflow-x: auto;
        }

        .inquiry-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }

        .inquiry-table th {
          padding: 11px 12px;
          text-align: left;
          border-bottom: 1px solid rgba(20,20,20,.1);
          color: rgba(20,20,20,.46);
          font-size: .7rem;
          letter-spacing: .09em;
          text-transform: uppercase;
        }

        .inquiry-table td {
          padding: 15px 12px;
          border-bottom: 1px solid rgba(20,20,20,.07);
          vertical-align: top;
          color: rgba(20,20,20,.68);
          font-size: .9rem;
        }

        .inquiry-table tbody tr {
          cursor: pointer;
          transition: background .15s ease;
        }

        .inquiry-table tbody tr:hover {
          background: rgba(20,20,20,.025);
        }

        .inquiry-table td > strong,
        .inquiry-table td > span {
          display: block;
        }

        .inquiry-table td > span {
          margin-top: 4px;
          color: rgba(20,20,20,.46);
          font-size: .78rem;
        }

        .inquiry-status {
          display: inline-flex !important;
          width: fit-content;
          margin-top: 0 !important;
          padding: 6px 9px;
          border: 1px solid rgba(20,20,20,.1);
          border-radius: 999px;
          font-size: .68rem !important;
          font-weight: 700;
          letter-spacing: .07em;
          text-transform: uppercase;
          color: rgba(20,20,20,.58) !important;
          background: rgba(20,20,20,.035);
        }

        .status-new {
          background: rgba(20,20,20,.08);
          color: #181818 !important;
        }

        .inquiry-empty {
          min-height: 220px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 5px;
          color: rgba(20,20,20,.45);
          text-align: center;
        }

        .inquiry-empty strong {
          color: rgba(20,20,20,.74);
        }

        .inquiry-error {
          margin: 0 0 14px;
          padding: 11px 13px;
          border-radius: 10px;
          background: rgba(128,40,40,.05);
          color: #762f2f;
          font-size: .86rem;
        }

        .inquiry-drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          background: rgba(15,15,15,.35);
          backdrop-filter: blur(5px);
        }

        .inquiry-drawer {
          position: relative;
          width: min(560px, 100%);
          height: 100%;
          overflow: auto;
          padding: 30px;
          background: #f8f7f3;
          box-shadow: -25px 0 70px rgba(0,0,0,.12);
        }

        .inquiry-drawer-close {
          position: absolute;
          right: 18px;
          top: 18px;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(20,20,20,.12);
          border-radius: 50%;
          background: #fff;
          font-size: 1.4rem;
          cursor: pointer;
        }

        .inquiry-drawer-title {
          margin: 8px 52px 5px 0;
          font-size: 2.25rem;
        }

        .inquiry-contact {
          display: grid;
          gap: 6px;
          margin: 18px 0 26px;
        }

        .inquiry-contact a {
          color: #1a1a1a;
          text-decoration: none;
        }

        .inquiry-contact span {
          font-size: .78rem;
          color: rgba(20,20,20,.44);
        }

        .inquiry-detail-section {
          padding-top: 22px;
          margin-top: 22px;
          border-top: 1px solid rgba(20,20,20,.09);
        }

        .inquiry-item-card {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 4px 15px;
          margin-top: 11px;
          padding: 14px;
          border: 1px solid rgba(20,20,20,.09);
          border-radius: 12px;
          background: rgba(255,255,255,.58);
        }

        .inquiry-item-card span {
          display: block;
          margin-top: 4px;
          color: rgba(20,20,20,.5);
          font-size: .8rem;
        }

        .inquiry-item-card p {
          grid-column: 1 / -1;
          margin: 8px 0 0;
          color: rgba(20,20,20,.61);
          font-size: .84rem;
          line-height: 1.5;
        }

        .inquiry-message {
          margin: 11px 0 0;
          line-height: 1.7;
          white-space: pre-wrap;
          color: rgba(20,20,20,.68);
        }

        @media (max-width: 650px) {
          .inquiry-stat-row {
            grid-template-columns: 1fr;
          }

          .inquiry-drawer {
            padding: 22px;
          }
        }
      `}</style>
    </>
  );
}
