"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type RazorpayCheckoutProps = {
  orderId: string;
  orderNumber: string;
  amount: number;
  email: string;
  contact?: string | null;
};

export default function RazorpayCheckout({
  orderId,
  orderNumber,
  amount,
  email,
  contact,
}: RazorpayCheckoutProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const safeAmount = useMemo(() => {
    const numericAmount = Number(amount);
    return Number.isFinite(numericAmount) && numericAmount > 0
      ? numericAmount
      : null;
  }, [amount]);

  const formattedAmount =
    safeAmount === null
      ? ""
      : safeAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  function loadScript() {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);

      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

      if (existing) {
        existing.addEventListener(
          "load",
          () => resolve(Boolean(window.Razorpay)),
          { once: true },
        );
        existing.addEventListener("error", () => resolve(false), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function pay() {
    setBusy(true);
    setError("");

    if (safeAmount === null) {
      setError(
        "Unable to determine the order total. Please return to checkout and try again.",
      );
      setBusy(false);
      return;
    }

    try {
      if (!(await loadScript()) || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const response = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to initialize payment.");
      }

      if (!payload.keyId || !payload.razorpayOrderId) {
        throw new Error("Payment provider returned an incomplete order.");
      }

      const gatewayAmountPaise = Number(payload.amount);

      if (
        !Number.isSafeInteger(gatewayAmountPaise) ||
        gatewayAmountPaise <= 0
      ) {
        throw new Error("Razorpay returned an invalid payment amount.");
      }

      const razorpay = new window.Razorpay({
        key: payload.keyId,
        amount: gatewayAmountPaise,
        currency: payload.currency,
        name: "ATELIER",
        description: `Order #${orderNumber}`,
        order_id: payload.razorpayOrderId,
        prefill: { email, contact: contact || undefined },
        notes: { local_order_id: orderId, order_number: orderNumber },
        theme: { color: "#151515" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (result: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verify = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order_id: orderId, ...result }),
            });

            const verified = await verify.json();

            if (!verify.ok) {
              throw new Error(
                verified.error || "Payment verification failed.",
              );
            }

            router.push(
              `/orders/${encodeURIComponent(verified.orderNumber)}`,
            );
            router.refresh();
          } catch (verificationError) {
            setError(
              verificationError instanceof Error
                ? verificationError.message
                : "Payment verification failed.",
            );
            setBusy(false);
          }
        },
      });

      razorpay.open();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to start payment.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="payment-action">
      <button
        type="button"
        className="btn btn-dark checkout-submit"
        onClick={pay}
        disabled={busy || safeAmount === null}
      >
        {busy
          ? "Opening secure payment…"
          : safeAmount === null
            ? "Payment amount unavailable"
            : `Pay ₹${formattedAmount} securely`}
      </button>
      {error && <p className="form-error payment-error">{error}</p>}
    </div>
  );
}
