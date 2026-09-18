# ATELIER Phase 4 — Product Editor Fix

## Type
PATCH — not a full project.

## Extract location
Extract the contents of this ZIP directly into:

D:\cloth\premium-store

Do NOT extract into a new premium-store folder.

## Files changed
- app\admin\products\product-form.tsx

## Does it replace existing files?
YES — it replaces only product-form.tsx.

## Does it touch these?
- .env: NO
- node_modules: NO
- Prisma database: NO
- migrations: NO
- package.json: NO

## What this fixes
- Keeps the live product preview at a controlled 4:5 size instead of letting the image expand to its natural size.
- Adds a proper image editor layout with contained thumbnails.
- Handles broken image URLs with a visible fallback instead of a browser broken-image icon.
- Keeps the real database save/archive behavior intact.

## After extraction
From D:\cloth\premium-store:

npm run typecheck
npm run dev

Then open:
http://localhost:3000/admin/products

Open a product and test the editor.
