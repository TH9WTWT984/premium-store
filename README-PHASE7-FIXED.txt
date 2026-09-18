ATELIER — PHASE 7 FIXED: CHECKOUT + ORDERS

TYPE: PATCH

EXTRACT THE CONTENTS DIRECTLY INTO:
D:\cloth\premium-store

DO NOT extract into D:\cloth, a phase folder, or another premium-store folder.

This patch was rebuilt against the project's ACTUAL Prisma schema.

NO DATABASE MIGRATION IS REQUIRED.

REPLACES/ADDS:
- lib/checkout.ts
- app/api/checkout/route.ts
- app/checkout/page.tsx
- app/components/checkout-form.tsx
- app/components/cart-client.tsx
- app/components/phase7-styles.tsx
- app/orders/[id]/page.tsx

DO NOT TOUCH:
- .env
- node_modules
- prisma/schema.prisma
- prisma migrations
- package-lock.json

DATABASE DETAILS HANDLED CORRECTLY:
- Order uses subtotal, discount, shipping, tax, total
- OrderItem uses total
- OrderItem requires product relation
- Order references Address through addressId
- Payment is not created yet
- No paymentStatus/order fulfillment fields are assumed

AFTER EXTRACTION:
1. Stop npm run dev with Ctrl+C, then Y.
2. cd /d D:\cloth\premium-store
3. npm run db:generate
4. npm run typecheck
5. npm run dev

TEST:
1. Log in as demo@atelier.local / Demo@12345
2. Add a no-variant product to the bag.
3. Open /cart and choose Continue to checkout.
4. Complete the address.
5. Place the order.
6. Confirm the cart is cleared.
7. Confirm an order number appears.
8. Open the order page.
9. Verify the order appears in the database.

SHIPPING/TAX:
Both are currently ₹0 until actual client rules are supplied.

PAYMENT:
Not implemented in Phase 7. Razorpay integration is Phase 8.
