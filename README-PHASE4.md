# ATELIER — Phase 4 Product Management

## THIS IS A PATCH

Extract the contents of this ZIP directly into:

`D:\cloth\premium-store`

Do NOT extract it as a new `premium-store` folder and do NOT extract it into the old `phase 3` folder.

When Windows asks whether to replace files, choose **Replace** for the files contained in this patch. Those replacements are intentional.

## DO NOT DELETE OR REPLACE

- `.env`
- `node_modules`
- `prisma/migrations`
- `package-lock.json`
- your database

Phase 4 does **not** change the Prisma schema. No migration is required.

## Intentionally replaced

- `app/globals.css`
- `app/admin/dashboard/page.tsx`

## Added

- `lib/admin.ts`
- `app/admin/components/admin-shell.tsx`
- product admin pages and APIs
- category admin page and APIs

## After extraction

Run from `D:\cloth\premium-store`:

`npm run db:generate`

`npm run typecheck`

`npm run dev`

Open:

`http://localhost:3000/admin/dashboard`

`http://localhost:3000/admin/products`

`http://localhost:3000/admin/products/new`

`http://localhost:3000/admin/categories`

## Images

Existing seeded products use the existing public Unsplash image URLs and should display in the admin table. New products can use public image URLs in this phase. Cloud/local file uploads are intentionally not included yet.
