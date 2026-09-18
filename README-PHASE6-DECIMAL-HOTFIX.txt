ATELIER — PHASE 6 DECIMAL SERIALIZATION HOTFIX

TYPE: PATCH

EXTRACT CONTENTS DIRECTLY INTO:
D:\cloth\premium-store

DO NOT extract into D:\cloth or a phase folder.

REPLACES:
- app/cart/page.tsx

WHY:
Prisma Decimal values cannot be passed directly from a Next.js Server Component to a Client Component. This patch converts the cart item's unit price to a plain number before passing it to CartClient.

DO NOT TOUCH:
- .env
- node_modules
- prisma
- migrations
- package-lock.json
- database

NO MIGRATION OR SEED REQUIRED.

AFTER EXTRACTION:
1. Stop npm run dev with Ctrl+C, then Y.
2. cd /d D:\cloth\premium-store
3. npm run typecheck
4. npm run dev

Then open /cart again.
