ATELIER — PHASE 7 CHECKOUT / ORDER CREATION

TYPE: PATCH

EXTRACT CONTENTS DIRECTLY INTO:
D:\cloth\premium-store

DO NOT extract into D:\cloth, a phase folder, or another premium-store folder.

NO DATABASE MIGRATION IS REQUIRED.

THIS PHASE ADDS:
- /checkout page
- Shipping address form
- Server-side cart revalidation
- Real Order + OrderItem creation
- Server-side price snapshot
- Variant stock validation
- Variant stock decrement in a transaction
- Cart clearing after order creation
- Order confirmation page
- Order summary UI

IMPORTANT:
- Payment is NOT collected in Phase 7. Razorpay/payment is Phase 8.
- Shipping is currently ₹0 placeholder because client shipping rules have not been supplied.
- Taxes/GST are currently ₹0 placeholder for the same reason.
- Checkout is for authenticated customers.
- For products with variants, the current quick-add flow uses the first active variant; full variant selection UI is the next refinement.

DO NOT TOUCH:
- .env
- node_modules
- prisma/schema.prisma
- prisma migrations
- database schema
- package-lock.json

AFTER EXTRACTION:
1. Stop npm run dev with Ctrl+C, then Y.
2. cd /d D:\cloth\premium-store
3. npm run typecheck
4. npm run dev

TEST:
1. Log in as demo@atelier.local / Demo@12345
2. Add a no-variant product to the bag.
3. Open /cart and click the checkout link/button.
4. Complete the shipping form.
5. Place the order.
6. Verify an order number is displayed.
7. Verify the cart is empty.
8. Open the order confirmation page.
9. Check Admin/Prisma database later to confirm the Order and OrderItem were persisted.

NOTE:
The cart summary page currently labels its checkout button as a future/disabled control from Phase 6. Update that button to link to /checkout when you are ready to test Phase 7 manually.
