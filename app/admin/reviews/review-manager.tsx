"use client";

import { useEffect, useMemo, useState } from "react";

type Review = {
  id: string;
  title: string | null;
  body: string;
  isApproved: boolean;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string | null; email: string };
  product: { id: string; name: string; slug: string };
};

type Payload = {
  reviews: Review[];
  counts: { pending: number; approved: number; total: number };
};

export default function ReviewManager() {
  const [status, setStatus] = useState<"all" | "pending" | "approved">("pending");
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/reviews?status=${status}`, {
        cache: "no-store",
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to load reviews.");
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [status]);

  async function moderate(id: string, action: "approve" | "reject") {
    setBusy(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to update review.");
      await load();
    } catch (e: any) {
      setError(e?.message || "Unable to update review.");
    } finally {
      setBusy("");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this review permanently?")) return;

    setBusy(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to delete review.");
      await load();
    } catch (e: any) {
      setError(e?.message || "Unable to delete review.");
    } finally {
      setBusy("");
    }
  }

  const countLabel = useMemo(() => {
    if (!data) return "Loading";
    return `${data.reviews.length} shown · ${data.counts.pending} pending`;
  }, [data]);

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <div>
          <div className="eyebrow">Moderation</div>
          <h1 className="serif admin-title">Reviews</h1>
          <p className="admin-muted">
            Approve genuine customer feedback before it appears publicly.
          </p>
        </div>
      </div>

      <section className="admin-stat-grid">
        <button className="admin-stat-card" onClick={() => setStatus("pending")}>
          <div className="eyebrow">Pending</div>
          <div className="admin-stat-value">{data?.counts.pending ?? "—"}</div>
          <div className="admin-muted">Needs moderation</div>
        </button>
        <button className="admin-stat-card" onClick={() => setStatus("approved")}>
          <div className="eyebrow">Approved</div>
          <div className="admin-stat-value">{data?.counts.approved ?? "—"}</div>
          <div className="admin-muted">Visible on storefront</div>
        </button>
        <button className="admin-stat-card" onClick={() => setStatus("all")}>
          <div className="eyebrow">Total</div>
          <div className="admin-stat-value">{data?.counts.total ?? "—"}</div>
          <div className="admin-muted">All submitted reviews</div>
        </button>
      </section>

      <div className="admin-panel" style={{ marginTop: 24 }}>
        <div className="admin-panel-head">
          <div>
            <div className="eyebrow">Queue</div>
            <h2 className="serif admin-panel-title">
              {status === "pending"
                ? "Pending reviews"
                : status === "approved"
                  ? "Approved reviews"
                  : "All reviews"}
            </h2>
          </div>
          <span className="admin-pill">{countLabel}</span>
        </div>

        {error && <p className="form-error">{error}</p>}

        {loading ? (
          <p className="admin-muted">Loading reviews…</p>
        ) : data?.reviews.length ? (
          <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
            {data.reviews.map((review) => {
              const customer =
                `${review.user.firstName} ${review.user.lastName || ""}`.trim() ||
                review.user.email;

              return (
                <article
                  key={review.id}
                  className="admin-panel"
                  style={{ border: "1px solid var(--line)" }}
                >
                  <div className="admin-panel-head">
                    <div>
                      <div className="eyebrow">{review.product.name}</div>
                      <h3 className="serif" style={{ margin: 0 }}>
                        {review.title || "Customer review"}
                      </h3>
                    </div>
                    <span className="admin-pill">
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>

                  <p style={{ margin: "14px 0 8px", lineHeight: 1.65 }}>
                    {review.body}
                  </p>

                  <p className="admin-muted" style={{ margin: 0 }}>
                    {customer} · {review.user.email} ·{" "}
                    {new Date(review.createdAt).toLocaleString("en-IN")}
                  </p>

                  <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                    {!review.isApproved && (
                      <button
                        className="btn btn-dark"
                        disabled={busy === review.id}
                        onClick={() => moderate(review.id, "approve")}
                      >
                        {busy === review.id ? "Saving…" : "Approve"}
                      </button>
                    )}

                    {review.isApproved && (
                      <button
                        className="btn"
                        disabled={busy === review.id}
                        onClick={() => moderate(review.id, "reject")}
                      >
                        {busy === review.id ? "Saving…" : "Reject"}
                      </button>
                    )}

                    <button
                      className="btn"
                      disabled={busy === review.id}
                      onClick={() => remove(review.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="admin-muted" style={{ marginTop: 18 }}>
            No reviews in this view.
          </p>
        )}
      </div>
    </div>
  );
}
