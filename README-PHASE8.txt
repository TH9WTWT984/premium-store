ATELIER — PHASE 8 RAZORPAY PAYMENTS

TYPE: PATCH

EXTRACT CONTENTS DIRECTLY INTO:
D:\cloth\premium-store

DO NOT extract into D:\cloth or any phase folder.

ADDS:
app/api/payments/razorpay/create-order/route.ts
app/api/payments/razorpay/verify/route.ts
app/api/webhooks/razorpay/route.ts
app/components/razorpay-checkout.tsx

REPLACES:
app/api/checkout/route.ts
app/checkout/page.tsx
app/components/checkout-form.tsx

NO DATABASE MIGRATION REQUIRED.
NO NEW NPM PACKAGE REQUIRED.

PAYMENT FLOW:
checkout -> local PENDING order -> Razorpay order -> Razorpay Checkout -> server signature verification -> Payment PAID -> Order CONFIRMED -> variant stock decremented.

This patch intentionally does not decrement variant inventory when a pending order is created. Inventory is finalized only after verified payment.

ENV REQUIRED:
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

Install:
1. Stop npm run dev with Ctrl+C, then Y.
2. Extract ZIP contents directly into D:\cloth\premium-store.
3. cd /d D:\cloth\premium-store
4. npm run typecheck
5. npm run dev

Test mode only. Do not use live credentials for local development.

The Razorpay Standard Checkout script is loaded in the browser only after the local order is created. The secret key stays server-side.

Webhook endpoint:
/api/webhooks/razorpay
Configure it in Razorpay Dashboard using your public HTTPS domain. Localhost cannot receive Razorpay webhooks without a public tunnel.

Official docs:
https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
https://razorpay.com/docs/webhooks/
