ATELIER PHASE 9 — PENDING ORDER POPUP NOTIFICATION

TYPE: PATCH ONLY
DO NOT replace your whole project.

EXACT INSTALL LOCATION:
D:\cloth\premium-store

WHAT THIS PATCH ADDS:
- Global customer-facing popup when the logged-in customer has an unpaid PENDING order.
- Shows order number, amount due and live time remaining.
- "Pay now" sends the customer directly to the active payment page.
- Close button dismisses the popup for the current browser session for that order.
- Popup is hidden on admin, auth and payment pages to avoid blocking those flows.
- Server endpoint checks the pending order and expires it if its payment window has already ended.

FILES ADDED:
app\components\pending-order-notification.tsx
app\api\orders\pending\route.ts

FILES REPLACED:
None.

FILES MODIFIED BY INSTALL SCRIPT:
app\layout.tsx (adds the global customer notification component)
app\globals.css (CSS is appended)

DOES NOT TOUCH:
Prisma schema or migrations
Razorpay credentials
Checkout/order creation logic
Payment verification logic
Admin authentication
Product/category/cart/wishlist logic

INSTALL:
1. Extract this ZIP DIRECTLY into D:\cloth\premium-store
2. Open CMD:
   cd /d D:\cloth\premium-store
   PHASE9-PENDING-ORDER-NOTIFICATION-INSTALL.cmd
3. Run:
   npm run typecheck
   npm run dev

TEST:
1. Log in as the customer.
2. Create an order and stop before payment is completed.
3. Return to a normal storefront page such as / or /shop.
4. A popup appears in the lower-right corner with the countdown.
5. Click "Pay now" to resume payment.
6. Close the popup and refresh; it stays dismissed for that order in the current browser session.
7. To reset the test notification, use a new browser/incognito session or remove the sessionStorage key named atelier_pending_order_notice.

IMPORTANT:
The popup timer is UX only. The existing server-side payment-window checks remain the authority for whether payment can still begin.
