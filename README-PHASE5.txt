ATELIER — PHASE 5: LIVE STOREFRONT CATALOG

TYPE: PATCH

EXTRACT CONTENTS DIRECTLY INTO:
D:\cloth\premium-store

DO NOT extract into D:\cloth or into a phase folder.

This phase connects the public storefront to the existing PostgreSQL/Prisma catalog.

REPLACES / ADDS:
- app/page.tsx
- app/shop/page.tsx
- app/category/[slug]/page.tsx
- app/product/[slug]/page.tsx
- app/search/page.tsx
- app/components/product-image.tsx
- app/components/public-product-card.tsx
- app/components/store-header.tsx
- app/api/products/route.ts
- app/globals.css
- lib/catalog.ts

DO NOT TOUCH:
- .env
- node_modules
- prisma/schema.prisma
- prisma migrations
- package-lock.json

DATABASE:
No migration is required. Phase 5 only reads the existing schema.

IMPORTANT:
The existing local image-upload flow stores files in public/uploads/products. The storefront can render those /uploads/... URLs directly.

AFTER EXTRACTION:
1. Stop npm run dev with Ctrl+C, then Y.
2. cd /d D:\cloth\premium-store
3. npm run typecheck
4. npm run dev

TEST:
- http://localhost:3000
- http://localhost:3000/shop
- http://localhost:3000/search?q=Leather
- http://localhost:3000/category/objects
- http://localhost:3000/product/leather-carryall

Expected:
- Public product lists come from PostgreSQL.
- Admin product edits are reflected on the storefront.
- Category pages use real categories/products.
- Product pages use real images, variants, price, stock and approved reviews.
- Broken images show a graceful fallback instead of a broken-image icon.

CHECKOUT/CART:
Not implemented in this phase. Phase 6/7 will make cart and checkout real.
