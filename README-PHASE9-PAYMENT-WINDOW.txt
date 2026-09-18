ATELIER PHASE 9 — PAYMENT WINDOW PATCH

TYPE: PATCH ONLY
DO NOT replace your whole project.

EXACT INSTALL LOCATION:
D:\cloth\premium-store

WHAT THIS PATCH ADDS:
- 30-minute payment window for unpaid PENDING orders.
- Customer sees a live countdown on the payment page.
- Customer can return to Account > Orders and use "Pay now" while the window is active.
- Server rejects payment initialization after the window expires.
- Expired pending orders are marked CANCELLED and no longer appear in the active Admin Orders list.
- Existing paid/confirmed orders are never auto-cancelled by this feature.
- Cancelled orders remain stored for audit/history.

CONFIGURATION:
Default timeout = 30 minutes.
Optional .env override:
PENDING_ORDER_TIMEOUT_MINUTES="30"

FILES ADDED:
lib\order-expiry.ts
app\components\pending-payment-window.tsx

FILES REPLACED:
app\checkout\payment\[orderId]\page.tsx
app\components\razorpay-checkout.tsx
app\api\payments\razorpay\create-order\route.ts
app\account\orders\[id]\page.tsx
app\admin\orders\page.tsx

FILES TOUCHED BY INSTALL SCRIPT:
app\globals.css (CSS is appended)

DOES NOT TOUCH:
Prisma schema or migrations
Cart logic
Product/category logic
Wishlist logic
Razorpay credentials
Payment verification logic
Admin authentication

INSTALL:
1. Extract this ZIP DIRECTLY into D:\cloth\premium-store
2. Open CMD:
   cd /d D:\cloth\premium-store
   PHASE9-PAYMENT-WINDOW-INSTALL.cmd
3. Run:
   npm run typecheck
   npm run dev

TEST CUSTOMER:
http://localhost:3000/account/orders
http://localhost:3000/checkout/payment/<ORDER_ID>

TEST ADMIN:
http://localhost:3000/admin/orders

QUICK TEST:
Temporarily set in .env:
PENDING_ORDER_TIMEOUT_MINUTES="1"
Restart the dev server.
Create an unpaid order, watch the countdown, and wait for it to expire.

IMPORTANT:
The browser timer is only the customer-facing UX. The server also checks the expiry timestamp before starting Razorpay, so changing or bypassing the browser timer cannot extend the payment window.
The current implementation uses Order.createdAt as the source of truth, so no database migration is required.
