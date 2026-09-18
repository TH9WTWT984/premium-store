"use client";

import { FormEvent, useEffect, useState } from "react";

type Variant = {
  id: string;
  name: string;
};

type RequestQuoteButtonProps = {
  productId: string;
  productName: string;
  variants: Variant[];
  isLoggedIn: boolean;
};

export default function RequestQuoteButton({
  productId,
  productName,
  variants,
  isLoggedIn,
}: RequestQuoteButtonProps) {
  const [open, setOpen] = useState(false);
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState("10");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [itemNotes, setItemNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function resetFeedback() {
    setSuccess("");
    setError("");
  }

  function handleOpen() {
    resetFeedback();
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();

    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount < 1) {
      setError("Enter a valid quantity.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          variantId: variantId || undefined,
          quantity: amount,
          name,
          email,
          phone,
          company,
          message,
          itemNotes,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to send your quote request.");
      }

      setSuccess(`Quote request received. Reference: ${payload.inquiryId}`);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setMessage("");
      setItemNotes("");
      setQuantity("10");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send your quote request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="request-quote-button" onClick={handleOpen}>
        <span>
          <small>Wholesale / custom</small>
          Request a quote
        </span>
        <span aria-hidden="true">↗</span>
      </button>

      {open && (
        <div className="quote-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setOpen(false);
        }}>
          <div className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title">
            <button className="quote-modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>

            <div className="quote-modal-intro">
              <div className="eyebrow">Wholesale / custom orders</div>
              <h2 id="quote-title" className="serif">Request a quote</h2>
              <p>Tell us what you need for <strong>{productName}</strong> and our team will get back to you with pricing and availability.</p>
            </div>

            {success ? (
              <div className="quote-success">
                <div className="quote-success-mark">✓</div>
                <h3 className="serif">Request received</h3>
                <p>{success}</p>
                <button className="btn btn-dark" type="button" onClick={() => setOpen(false)}>Done</button>
              </div>
            ) : (
              <form className="quote-form" onSubmit={submit}>
                {variants.length > 0 && (
                  <label className="quote-field">
                    <span>Option</span>
                    <select value={variantId} onChange={(event) => setVariantId(event.target.value)} required>
                      <option value="" disabled>Select an option</option>
                      {variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>{variant.name}</option>
                      ))}
                    </select>
                  </label>
                )}

                <div className="quote-two-col">
                  <label className="quote-field">
                    <span>Quantity</span>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      required
                    />
                  </label>

                  <label className="quote-field">
                    <span>Company <em>optional</em></span>
                    <input value={company} onChange={(event) => setCompany(event.target.value)} maxLength={160} placeholder="Business name" />
                  </label>
                </div>

                <div className="quote-two-col">
                  <label className="quote-field">
                    <span>Name</span>
                    <input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required placeholder="Your name" />
                  </label>

                  <label className="quote-field">
                    <span>Email</span>
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={180} required placeholder="you@company.com" />
                  </label>
                </div>

                <label className="quote-field">
                  <span>Phone <em>optional</em></span>
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} placeholder="+91" />
                </label>

                <label className="quote-field">
                  <span>Requirements <em>optional</em></span>
                  <input value={itemNotes} onChange={(event) => setItemNotes(event.target.value)} maxLength={1000} placeholder="Sizes, colors, delivery needs, branding, etc." />
                </label>

                <label className="quote-field">
                  <span>Message <em>optional</em></span>
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={3000} rows={5} placeholder="Anything else our team should know?" />
                </label>

                {error && <p className="quote-error" role="alert">{error}</p>}

                <button className="btn btn-dark quote-submit" type="submit" disabled={busy}>
                  {busy ? "Sending request…" : "Send quote request"}
                </button>

                <p className="quote-note">
                  No payment is taken. This request goes to the store team for review and follow-up.
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        .request-quote-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 12px;
          padding: 17px 18px;
          border: 1px solid rgba(20,20,20,.14);
          border-radius: 14px;
          background: rgba(255,255,255,.62);
          color: #1a1a1a;
          text-align: left;
          cursor: pointer;
          transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease, background .18s ease;
        }

        .request-quote-button:hover {
          transform: translateY(-1px);
          border-color: rgba(20,20,20,.28);
          background: #fff;
          box-shadow: 0 12px 30px rgba(20,20,20,.07);
        }

        .request-quote-button span:first-child {
          display: grid;
          gap: 3px;
          font-weight: 650;
          letter-spacing: .01em;
        }

        .request-quote-button small {
          font-size: .68rem;
          letter-spacing: .11em;
          text-transform: uppercase;
          font-weight: 600;
          color: rgba(20,20,20,.48);
        }

        .quote-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(15,15,15,.48);
          backdrop-filter: blur(8px);
        }

        .quote-modal {
          position: relative;
          width: min(680px, 100%);
          max-height: min(92vh, 900px);
          overflow: auto;
          padding: clamp(24px, 5vw, 38px);
          border: 1px solid rgba(255,255,255,.5);
          border-radius: 22px;
          background: #f8f7f3;
          box-shadow: 0 35px 90px rgba(0,0,0,.2);
        }

        .quote-modal-close {
          position: absolute;
          top: 17px;
          right: 17px;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(20,20,20,.12);
          border-radius: 50%;
          background: rgba(255,255,255,.72);
          font-size: 1.45rem;
          line-height: 1;
          cursor: pointer;
        }

        .quote-modal-intro {
          max-width: 555px;
          margin-right: 48px;
          margin-bottom: 26px;
        }

        .quote-modal-intro h2 {
          margin: 8px 0 9px;
          font-size: clamp(2rem, 5vw, 2.9rem);
        }

        .quote-modal-intro p {
          margin: 0;
          line-height: 1.65;
          color: rgba(20,20,20,.65);
        }

        .quote-form {
          display: grid;
          gap: 16px;
        }

        .quote-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .quote-field {
          display: grid;
          gap: 8px;
        }

        .quote-field > span {
          font-size: .75rem;
          font-weight: 650;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(20,20,20,.62);
        }

        .quote-field em {
          margin-left: 4px;
          text-transform: none;
          letter-spacing: 0;
          font-style: normal;
          font-weight: 500;
          color: rgba(20,20,20,.4);
        }

        .quote-field input,
        .quote-field select,
        .quote-field textarea {
          width: 100%;
          box-sizing: border-box;
          min-height: 50px;
          padding: 0 14px;
          border: 1px solid rgba(20,20,20,.13);
          border-radius: 12px;
          background: rgba(255,255,255,.88);
          color: #1b1b1b;
          font: inherit;
          outline: none;
          transition: border-color .18s ease, box-shadow .18s ease;
        }

        .quote-field textarea {
          padding-top: 13px;
          resize: vertical;
          line-height: 1.6;
        }

        .quote-field input:focus,
        .quote-field select:focus,
        .quote-field textarea:focus {
          border-color: rgba(20,20,20,.42);
          box-shadow: 0 0 0 4px rgba(20,20,20,.05);
        }

        .quote-submit {
          margin-top: 4px;
          min-height: 50px;
          justify-content: center;
        }

        .quote-submit:disabled {
          opacity: .6;
          cursor: wait;
        }

        .quote-note {
          margin: -3px 0 0;
          color: rgba(20,20,20,.47);
          font-size: .78rem;
          line-height: 1.5;
        }

        .quote-error {
          margin: 0;
          padding: 11px 13px;
          border: 1px solid rgba(128,40,40,.16);
          border-radius: 10px;
          background: rgba(128,40,40,.05);
          color: #762f2f;
          font-size: .86rem;
          line-height: 1.45;
        }

        .quote-success {
          display: grid;
          gap: 10px;
          justify-items: start;
          padding: 12px 0 2px;
        }

        .quote-success-mark {
          display: grid;
          place-items: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #1a1a1a;
          color: #fff;
          font-weight: 700;
        }

        .quote-success h3 {
          margin: 4px 0 0;
          font-size: 1.65rem;
        }

        .quote-success p {
          margin: 0 0 7px;
          color: rgba(20,20,20,.66);
          line-height: 1.6;
        }

        @media (max-width: 620px) {
          .quote-two-col {
            grid-template-columns: 1fr;
          }

          .quote-modal {
            border-radius: 18px;
          }

          .quote-modal-intro {
            margin-right: 32px;
          }
        }
      `}</style>
    </>
  );
}
