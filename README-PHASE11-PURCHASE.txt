ATELIER PHASE 11 — PURCHASE INVENTORY PATCH

TYPE:
PATCH — replaces exactly 2 existing files.

WORKING PROJECT:
D:\cloth\premium-store

EXTRACT DIRECTLY INTO:
D:\cloth\premium-store

REPLACED FILES:
- app\api\payments\razorpay\verify\route.ts
- app\api\webhooks\razorpay\route.ts

WHAT THIS ADDS:
- Successful paid purchases create InventoryTransaction records.
- Records stockBefore, stockAfter, quantity, order and purchase reason.
- Keeps duplicate payment processing from deducting inventory twice.

DOES NOT TOUCH:
- .env
- prisma\schema.prisma
- storefront UI
- admin UI
- checkout UI

AFTER EXTRACTION:
cd /d D:\cloth\premium-store
npm run typecheck

Then run a Razorpay TEST payment and check:
Admin -> Inventory -> Recent movements
