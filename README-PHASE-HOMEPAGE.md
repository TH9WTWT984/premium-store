PATCH — Homepage CMS

Type: PATCH
Extraction: directly into D:\cloth\premium-store

Adds:
- app/admin/homepage/page.tsx
- app/admin/homepage/homepage-manager.tsx
- app/admin/homepage/homepage-manager.module.css
- app/api/admin/homepage/route.ts
- scripts/add-homepage-cms.cjs
- prisma/migrations/20260912170000_add_cms_homepage/migration.sql

Replaces:
- app/page.tsx
- app/admin/components/admin-shell.tsx

Commands after extraction:
cd /d D:\cloth\premium-store
node scripts/add-homepage-cms.cjs
npx prisma migrate dev
npx prisma generate
npm run typecheck
npm run dev

Then open:
http://localhost:3000/admin/homepage

Homepage content saved in Admin is read dynamically on the storefront. Products and categories remain sourced from the existing live catalog.
