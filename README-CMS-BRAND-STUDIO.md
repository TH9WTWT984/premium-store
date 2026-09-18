PATCH — CMS Brand Studio

Extract directly into D:\\cloth\\premium-store.

Adds an editable Brand Studio to Admin → Homepage:
- Palette generator from a seed color
- Editable individual palette colors
- Add/remove palette colors
- Heading/body font presets
- Heading, body, muted, accent, background, surface and border colors
- Live theme variables applied to the homepage
- Existing announcement studio remains intact

Replaces:
- app/admin/homepage/homepage-manager.tsx
- app/admin/homepage/homepage-manager.module.css
- app/api/admin/homepage/route.ts
- app/page.tsx

Adds:
- app/components/homepage-theme.tsx
- app/components/homepage-theme.module.css
- scripts/add-homepage-theme.cjs
- prisma/migrations/20260912203000_add_cms_homepage_theme/migration.sql

SETUP
1. Extract into D:\\cloth\\premium-store.
2. Run:
   cd /d D:\\cloth\\premium-store
   node scripts/add-homepage-theme.cjs
   npx prisma migrate dev
   npx prisma generate
   npm run typecheck
3. Start the site:
   npm run dev
4. Open:
   http://localhost:3000/admin/homepage

The theme is stored in CmsHomepage.themeConfig as validated JSON. No product/order/payment/inventory/inquiry tables are changed.
