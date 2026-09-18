# CMS Pages → Storefront

PATCH: extract directly into the project root.

This connects these public routes to published CmsPage records:
- /about
- /faq
- /contact
- /shipping
- /returns
- /privacy
- /terms
- /refund

Only published records are shown. If a page is not published or does not exist, the public route returns Next.js 404.

Added/replaced:
- app/components/cms-public-page.tsx
- app/components/cms-public-page.module.css
- lib/cms.ts
- app/about/page.tsx
- app/faq/page.tsx
- app/contact/page.tsx
- app/shipping/page.tsx
- app/returns/page.tsx
- app/privacy/page.tsx
- app/terms/page.tsx
- app/refund/page.tsx

Does not touch products, orders, cart, payments, inventory, coupons, inquiries, admin CMS editor, or database schema.
