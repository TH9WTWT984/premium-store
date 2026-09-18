ATELIER — PHASE 6 CART + WISHLIST PATCH

TYPE: PATCH
EXTRACT CONTENTS DIRECTLY INTO:
D:\cloth\premium-store

NO DATABASE MIGRATION REQUIRED.

DO NOT TOUCH:
.env
node_modules
prisma
package-lock.json

Phase 6 adds:
- Real persistent cart for logged-in customers
- Server-side product/variant/stock validation
- Quantity updates and remove
- Real wishlist persistence
- Wishlist page
- Product-page Add to bag and Save to wishlist
- Cart summary
- Phase 6 styling for cart/product UI

INSTALL:
1. Stop npm run dev (Ctrl+C, then Y).
2. Extract this ZIP directly into D:\cloth\premium-store.
3. Choose Replace for files in the patch.
4. cd /d D:\cloth\premium-store
5. npm run typecheck
6. npm run dev

IMPORTANT:
- Cart and wishlist require customer login.
- Guest users are redirected to login.
- If a product has variants, the quick-add button uses the first active variant.
- Full variant selection UI will be improved in a later cart/checkout iteration.
- Checkout/payment are NOT implemented in Phase 6.
