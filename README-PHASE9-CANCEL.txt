ATELIER — Phase 9 Cancellation Patch

TYPE: PATCH ONLY

EXTRACTION LOCATION:
D:\cloth\premium-store

WHAT THIS PATCH CHANGES:
- Adds a Cancel button for accidental/unpaid orders in Admin > Orders.
- Adds the same Cancel button to the individual order detail page.
- The button appears only when:
  - Order status = PENDING
  - Payment status = PENDING
- Confirmation is shown before cancellation.
- Cancellation uses the existing server-side order status endpoint.
- The order is NOT permanently deleted. It is marked CANCELLED and remains in the database/history.
- Adds lightweight styling for the cancel action.

WHAT THIS PATCH DOES NOT TOUCH:
- No database schema changes.
- No migrations.
- No payment logic changes.
- No inventory logic changes.
- No customer storefront code changes.

INSTALL:
1. Stop the Next.js dev server if it is running.
2. Extract/merge this PATCH into:
   D:\cloth\premium-store
3. Ensure the files land in these exact locations:
   app\admin\orders\page.tsx
   app\admin\orders\[id]\page.tsx
   app\admin\orders\cancel-order-button.tsx
   PHASE9-CANCEL-STYLE.css
4. Append the contents of PHASE9-CANCEL-STYLE.css to:
   app\globals.css
5. Start again:
   cd /d D:\cloth\premium-store
   npm run typecheck
   npm run dev

TEST:
- Open http://localhost:3000/admin/orders
- Use a PENDING + unpaid order.
- Click Cancel.
- Confirm the browser prompt.
- The order should become Cancelled.
- It should remain visible in Orders and the customer order history.

IMPORTANT:
Do not use this as a way to erase paid orders. Paid/confirmed/processing/shipped orders should be handled through the normal cancellation/refund workflow later.
