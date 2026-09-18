ATELIER — PHASE 6 HOTFIX

TYPE: PATCH / BUG FIX

EXTRACT THE CONTENTS DIRECTLY INTO:
D:\cloth\premium-store

DO NOT extract into D:\cloth, phase folders, or another premium-store folder.

WHY THIS PATCH EXISTS:
The existing database schema does not make Cart.userId a unique key, so the earlier Phase 6 code incorrectly used upsert/findUnique by userId. CartItem also requires unitPrice and does not have createdAt. This patch aligns the cart implementation with the actual generated Prisma Client.

REPLACES:
- lib/cart.ts
- app/api/cart/items/route.ts
- app/cart/page.tsx

DO NOT TOUCH:
- .env
- node_modules
- prisma/schema.prisma
- migrations
- package-lock.json

NO DATABASE MIGRATION IS REQUIRED.

AFTER EXTRACTION:
1. Stop npm run dev with Ctrl+C, then Y.
2. cd /d D:\cloth\premium-store
3. npm run db:generate
4. npm run typecheck
5. npm run dev

TEST:
1. Log in as demo@atelier.local / Demo@12345
2. Open a product without variants and click Add to bag.
3. Open /cart.
4. Increase/decrease quantity and remove the item.
5. Test a product with variants; selecting a variant is still the next UI improvement.
