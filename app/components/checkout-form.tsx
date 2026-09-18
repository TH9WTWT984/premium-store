"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type Address = {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

type Suggestion = {
  title: string;
  subtitle: string;
  pincode: string;
  state: string;
  district: string;
  city: string;
};

const initial: Address = {
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
  phone: "",
};

const STATES = [
  "Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh",
  "Assam","Bihar","Chandigarh","Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand",
  "Karnataka","Kerala","Ladakh","Lakshadweep","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
];

export default function CheckoutForm({
  items,
  subtotal,
  customerEmail,
  customerPhone,
}: {
  items: Item[];
  subtotal: number;
  customerEmail: string;
  customerPhone?: string | null;
}) {
  const [address, setAddress] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [pinLoading, setPinLoading] = useState(false);
  const [pinMessage, setPinMessage] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<Suggestion[]>([]);
  const [stateSuggestions, setStateSuggestions] = useState<string[]>([]);
  const [active, setActive] = useState<"city" | "state" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  function update(field: keyof Address, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
    if (field === "postalCode") setPinMessage("");
  }

  useEffect(() => {
    if (active !== "state") {
      setStateSuggestions([]);
      return;
    }

    const q = address.state.trim().toLowerCase();

    setStateSuggestions(
      q.length < 2
        ? []
        : STATES.filter((state) =>
            state.toLowerCase().includes(q),
          ).slice(0, 8),
    );
  }, [address.state, active]);

  useEffect(() => {
    if (active !== "city") {
      setCitySuggestions([]);
      return;
    }

    const q = address.city.trim();

    if (q.length < 2) {
      setCitySuggestions([]);
      return;
    }

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/address/search?q=${encodeURIComponent(q)}`,
        );
        const payload = await response.json();

        setCitySuggestions(
          response.ok && Array.isArray(payload.results)
            ? payload.results
            : [],
        );
      } catch {
        setCitySuggestions([]);
      }
    }, 350);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [address.city, active]);

  async function lookupPin(pin: string) {
    if (pin.length !== 6) return;

    setPinLoading(true);
    setPinMessage("");

    try {
      const response = await fetch(
        `/api/address/pincode?pin=${pin}`,
      );
      const payload = await response.json();

      if (!response.ok) {
        setPinMessage(payload.error || "PIN code not found.");
        return;
      }

      setAddress((current) => ({
        ...current,
        postalCode: pin,
        city: payload.city || current.city,
        state: payload.state || current.state,
        country: "IN",
      }));

      setPinMessage(
        payload.postOffices?.[0]?.name
          ? `Location found: ${payload.postOffices[0].name}`
          : "City and state filled from the PIN code.",
      );
    } catch {
      setPinMessage(
        "We couldn't look up this PIN code right now.",
      );
    } finally {
      setPinLoading(false);
    }
  }

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponMessage("");

    try {
      const response = await fetch(
        "/api/coupons/validate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to apply coupon.",
        );
      }

      setDiscount(Number(payload.discount || 0));
      setAppliedCoupon(payload.code || code);
      setCouponMessage(
        `Coupon applied — save ₹${Number(
          payload.discount || 0,
        ).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })}`,
      );
    } catch (caught) {
      setDiscount(0);
      setAppliedCoupon("");
      setCouponError(
        caught instanceof Error
          ? caught.message
          : "Unable to apply coupon.",
      );
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setDiscount(0);
    setAppliedCoupon("");
    setCouponMessage("");
    setCouponError("");
    setCouponCode("");
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: address,
          couponCode: appliedCoupon || couponCode.trim(),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to create order.",
        );
      }

      router.push(
        `/checkout/payment/${encodeURIComponent(payload.id)}`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to create order.",
      );
    } finally {
      setSaving(false);
    }
  }

  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .autocomplete-field{position:relative}
            .address-suggestion-menu{position:absolute;left:0;right:0;top:100%;z-index:50;border:1px solid var(--line);background:#f8f7f3;box-shadow:0 12px 30px rgba(20,18,15,.08);max-height:280px;overflow:auto}
            .address-suggestion{display:grid;gap:4px;width:100%;padding:12px 14px;text-align:left;border:0;border-bottom:1px solid var(--line);background:transparent;cursor:pointer;font:inherit}
            .address-suggestion:hover{background:#efeee9}
            .address-suggestion strong{font-size:12px;font-weight:500}
            .address-suggestion span{font-size:10px;color:var(--muted);line-height:1.5}
            .pin-helper{margin-top:6px;font-size:10px;color:var(--muted);min-height:15px}
            .coupon-box{margin:22px 0 8px;padding:18px;border:1px solid var(--line);background:#f8f7f3}
            .coupon-row{display:flex;gap:10px;align-items:stretch}
            .coupon-row .field{flex:1;min-width:0}
            .coupon-message{margin:8px 0 0;font-size:11px;color:var(--muted)}
            .coupon-error{margin:8px 0 0;font-size:11px;color:#9a3f31}
            .coupon-applied{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px}
            .coupon-remove{border:0;background:transparent;text-decoration:underline;cursor:pointer;font:inherit;color:var(--muted)}
            @media(max-width:640px){.coupon-row{flex-direction:column}.coupon-row button{width:100%}}
          `,
        }}
      />

      <form className="checkout-grid" onSubmit={submit}>
        <section className="checkout-main">
          <div className="admin-panel checkout-panel">
            <div className="eyebrow">Shipping</div>
            <h2 className="serif admin-panel-title">Delivery address</h2>
            <p className="admin-muted">
              City and state suggestions are enabled. A 6-digit PIN can fill
              the postal area automatically.
            </p>

            <div className="admin-field-grid">
              <label className="admin-field">
                <span>First name</span>
                <input className="field" required value={address.firstName} onChange={(e) => update("firstName", e.target.value)} />
              </label>

              <label className="admin-field">
                <span>Last name</span>
                <input className="field" required value={address.lastName} onChange={(e) => update("lastName", e.target.value)} />
              </label>

              <label className="admin-field full">
                <span>Address</span>
                <input className="field" required value={address.line1} onChange={(e) => update("line1", e.target.value)} />
              </label>

              <label className="admin-field full">
                <span>Apartment / landmark</span>
                <input className="field" value={address.line2} onChange={(e) => update("line2", e.target.value)} />
              </label>

              <div className="admin-field autocomplete-field">
                <span>City / district</span>
                <input
                  className="field"
                  required
                  value={address.city}
                  onFocus={() => setActive("city")}
                  onChange={(e) => {
                    update("city", e.target.value);
                    setActive("city");
                  }}
                  onBlur={() => setTimeout(() => setActive(null), 180)}
                />
                {active === "city" && citySuggestions.length > 0 && (
                  <div className="address-suggestion-menu">
                    {citySuggestions.map((s, i) => (
                      <button
                        type="button"
                        className="address-suggestion"
                        key={`${s.title}-${s.pincode}-${i}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setAddress((current) => ({
                            ...current,
                            city: s.city || s.district || s.title || current.city,
                            state: s.state || current.state,
                            postalCode: s.pincode || current.postalCode,
                          }));
                          setCitySuggestions([]);
                          setActive(null);
                        }}
                      >
                        <strong>{s.title}</strong>
                        <span>{s.subtitle}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-field autocomplete-field">
                <span>State</span>
                <input
                  className="field"
                  required
                  value={address.state}
                  list="india-states"
                  onFocus={() => setActive("state")}
                  onChange={(e) => {
                    update("state", e.target.value);
                    setActive("state");
                  }}
                  onBlur={() => setTimeout(() => setActive(null), 180)}
                />
                <datalist id="india-states">
                  {STATES.map((state) => <option value={state} key={state} />)}
                </datalist>
                {active === "state" && stateSuggestions.length > 0 && (
                  <div className="address-suggestion-menu">
                    {stateSuggestions.map((state) => (
                      <button
                        type="button"
                        className="address-suggestion"
                        key={state}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          update("state", state);
                          setStateSuggestions([]);
                          setActive(null);
                        }}
                      >
                        <strong>{state}</strong>
                        <span>Indian state / union territory</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-field full">
                <span>PIN code</span>
                <input
                  className="field"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={address.postalCode}
                  onChange={(e) => {
                    const pin = e.target.value.replace(/\D/g, "").slice(0, 6);
                    update("postalCode", pin);
                    if (pin.length === 6) lookupPin(pin);
                  }}
                />
                <div className="pin-helper" role="status">
                  {pinLoading
                    ? "Finding your postal area…"
                    : pinMessage || "Enter 6 digits to auto-fill city and state."}
                </div>
              </div>

              <label className="admin-field full">
                <span>Country code</span>
                <input className="field" required maxLength={2} value={address.country} onChange={(e) => update("country", e.target.value.toUpperCase())} />
              </label>

              <label className="admin-field full">
                <span>Phone</span>
                <input className="field" required type="tel" value={address.phone} onChange={(e) => update("phone", e.target.value)} />
              </label>
            </div>

            <div className="coupon-box">
              <div className="eyebrow">Discount</div>

              {appliedCoupon ? (
                <div className="coupon-applied">
                  <span>
                    {appliedCoupon} · Save ₹
                    {discount.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <button
                    type="button"
                    className="coupon-remove"
                    onClick={removeCoupon}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="coupon-row">
                    <input
                      className="field"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter coupon code"
                      maxLength={50}
                    />
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={applyCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? "Checking…" : "Apply"}
                    </button>
                  </div>

                  {couponError && (
                    <p className="coupon-error">{couponError}</p>
                  )}
                  {couponMessage && (
                    <p className="coupon-message">{couponMessage}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-dark checkout-submit" disabled={saving}>
            {saving ? "Preparing secure payment…" : "Continue to payment"}
          </button>

          <p className="checkout-note">
            Your order total, coupon and inventory are revalidated server-side
            before payment is initialized.
          </p>
        </section>

        <aside className="cart-summary checkout-summary">
          <div className="eyebrow">Review</div>
          <h2 className="serif">Order summary</h2>

          <div className="checkout-items">
            {items.map((item) => (
              <div className="checkout-line" key={item.id}>
                <div>
                  <strong>{item.productName}</strong>
                  <span>
                    {item.quantity} × ₹
                    {item.unitPrice.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <span>
                  ₹
                  {item.total.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <strong>
              ₹
              {subtotal.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>

          {discount > 0 && (
            <div className="cart-summary-row muted">
              <span>Discount</span>
              <span>
                − ₹
                {discount.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <div className="cart-summary-row muted">
            <span>Shipping</span>
            <span>₹0</span>
          </div>

          <div className="cart-summary-row muted">
            <span>Taxes</span>
            <span>₹0</span>
          </div>

          <div className="cart-summary-row checkout-total">
            <span>Total</span>
            <strong>
              ₹
              {finalTotal.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>
        </aside>
      </form>
    </>
  );
}
