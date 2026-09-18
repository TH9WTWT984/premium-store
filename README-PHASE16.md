# ATELIER Phase 16 — RBAC / Admin Management

## PATCH
Extract this ZIP directly into `D:\cloth\premium-store`.

### Adds
- `/admin/admins`
- `/admin/roles`
- `/api/admin/admins`
- `/api/admin/admins/[id]`
- `/api/admin/roles`
- `/api/admin/roles/[id]`
- `scripts/setup-rbac.cjs`

### Replaces
- `app/admin/components/admin-shell.tsx`

### Does not touch
Products, cart, checkout, Razorpay, coupons, inventory data, inquiries, storefront product UI, or existing order data.

## After extraction
Run:

```cmd
cd /d D:\cloth\premium-store
node scripts/setup-rbac.cjs
npx prisma generate
npm run typecheck
```

No Prisma schema migration is required for this phase because the existing Role / Permission / AdminUser tables are reused.
