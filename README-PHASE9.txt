ATELIER — PHASE 9: ORDERS + CUSTOMER ORDER HISTORY

TYPE: PATCH

EXTRACT THE ZIP CONTENTS DIRECTLY INTO:
D:\cloth\premium-store

DO NOT extract into D:\cloth, a phase folder, or another premium-store folder.

WHAT THIS PHASE ADDS:
- Real admin Orders section at /admin/orders
- Admin order detail at /admin/orders/[id]
- Secure server-side order status updates
- Customer order history at /account/orders
- Customer order detail at /account/orders/[id]
- Account dashboard now shows order count + latest order
- Orders added to the admin navigation
- Payment status displayed separately from fulfillment status
- ActivityLog entry when an admin changes an order status

STATUS FLOW ENFORCED SERVER-SIDE:
PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
PENDING -> CANCELLED
CONFIRMED -> CANCELLED
PROCESSING -> CANCELLED

No arbitrary backward status changes are allowed.

DATABASE:
- No migration required.
- Uses the existing Order, OrderItem, Payment, User, Address and ActivityLog models.

FILES ADDED:
- app/admin/orders/page.tsx
- app/admin/orders/[id]/page.tsx
- app/admin/orders/[id]/status-editor.tsx
- app/api/admin/orders/[id]/route.ts
- app/account/orders/page.tsx
- app/account/orders/[id]/page.tsx

FILES REPLACED:
- app/account/page.tsx
- app/admin/components/admin-shell.tsx

CSS:
A file named PHASE9-STYLE-APPEND.css is included. Run PHASE9-INSTALL.cmd ONCE from the project root after extraction to safely append the new Phase 9 styles to app/globals.css. The command makes a backup first.

DO NOT TOUCH:
- .env
- node_modules
- prisma/schema.prisma
- prisma/migrations
- package-lock.json
- Razorpay credentials or payment routes
- checkout/address autocomplete code

INSTALL:
1. Stop npm run dev with Ctrl+C, then Y.
2. Extract this ZIP directly into D:\cloth\premium-store.
3. Open Command Prompt and run:
   cd /d D:\cloth\premium-store
4. Run:
   PHASE9-INSTALL.cmd
5. Run:
   npm run typecheck
6. Run:
   npm run dev

TEST:
A. Admin
- Open http://localhost:3000/admin/orders
- Open an order
- Change PENDING to CONFIRMED (or another allowed next status)
- Confirm the page refreshes and the status changes.
- Verify the activity is written to ActivityLog.

B. Customer
- Log in.
- Open http://localhost:3000/account
- Confirm the order count/latest order appears.
- Open View order / order history.
- Confirm only that customer's orders are visible.

C. Payment
- Do not change payment routes in this phase.
- Razorpay remains the payment authority; this phase only adds order/fulfillment visibility.

KNOWN SCOPE LIMIT:
Refund processing, shipping labels/tracking, email notifications and invoice generation are intentionally not added yet. Those belong to later phases.
