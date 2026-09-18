ATELIER — CHECKOUT / EMPTY CART HOTFIX

TYPE: PATCH ONLY

WORKING PROJECT:
D:\cloth\premium-store

WHY THIS PATCH IS NEEDED:
The checkout creates the pending order and then clears the cart. A later refresh/re-render of /checkout was calling validateCheckoutCart() again, which correctly threw EMPTY_CART. That exception was not being handled, so Next.js displayed a server runtime error.

WHAT THIS PATCH DOES:
1. Replaces app\checkout\page.tsx
   - Handles EMPTY_CART gracefully instead of crashing.
   - Shows a simple empty-bag screen when /checkout is opened with no items.

2. Replaces app\components\checkout-form.tsx
   - Keeps the working address autocomplete + PIN lookup UI.
   - After creating the pending order, navigates to a dedicated payment URL.
   - Does NOT keep the payment state only in client memory.

3. Adds app\checkout\payment\[orderId]\page.tsx
   - Loads the pending order directly from PostgreSQL.
   - Survives refreshes because it no longer depends on the cart.
   - Shows the actual order total.
   - Opens the existing Razorpay checkout component.
   - Redirects to the order page after payment is already confirmed.

IMPORTANT:
- This patch does NOT change prisma/schema.prisma.
- This patch does NOT change Razorpay API routes.
- This patch does NOT change the payment verification logic.
- No npm install is required.
- No migration is required.

INSTALL:
1. Stop the dev server with Ctrl+C.
2. Extract this ZIP directly into:
   D:\cloth\premium-store
3. Replace existing files when Windows asks.
4. Start the project:
   cd /d D:\cloth\premium-store
   npm run dev

TEST:
1. Add a product to the cart.
2. Open checkout.
3. Fill the address and click Continue to payment.
4. Confirm the browser moves to /checkout/payment/<orderId>.
5. Refresh that payment page. It should still work.
6. Click Pay and confirm Razorpay opens normally.
7. If /checkout is opened with an empty cart, it should show a friendly empty-bag page, NOT EMPTY_CART.
