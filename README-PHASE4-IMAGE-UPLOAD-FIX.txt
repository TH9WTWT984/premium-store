ATELIER PHASE 4 — IMAGE UPLOAD FIX

TYPE: PATCH

EXTRACT THE CONTENTS DIRECTLY INTO:
D:\cloth\premium-store

DO NOT extract into D:\cloth or into another premium-store folder.

REPLACES:
- app/admin/products/product-form.tsx

ADDS:
- app/api/admin/uploads/route.ts

DO NOT TOUCH:
- .env
- node_modules
- prisma
- package.json
- package-lock.json

After extraction:
1. Stop npm run dev with Ctrl+C, then Y.
2. cd /d D:\cloth\premium-store
3. npm run typecheck
4. npm run dev

The Product Images section will show:
- Upload from computer
- JPG, PNG or WebP
- 8 MB max
The upload is stored under public/uploads/products during local development.
