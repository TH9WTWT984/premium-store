ATELIER PHASE 11 — INVENTORY PATCH

TYPE: PATCH, not a full project.

WORKING PROJECT:
D:\cloth\premium-store

EXTRACT THIS ZIP DIRECTLY INTO:
D:\cloth\premium-store

FILES ADDED:
- app\admin\inventory\page.tsx
- app\admin\inventory\inventory-actions.tsx
- app\api\admin\inventory\route.ts

FILE REPLACED:
- app\admin\components\admin-shell.tsx

DOES NOT TOUCH:
- prisma\schema.prisma
- products
- orders
- payments
- checkout
- .env

IMPORTANT:
The Prisma inventory schema migration must already be applied before using /admin/inventory.

AFTER EXTRACTION:
cd /d D:\cloth\premium-store
npm run typecheck
npm run dev

Then open:
http://localhost:3000/admin/inventory
