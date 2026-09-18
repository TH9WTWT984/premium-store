# ATELIER — Phase 3

Phase 3 adds real customer and admin authentication on top of the Phase 2 PostgreSQL/Prisma foundation.

## What is included

- Password hashing using Node.js scrypt (no extra password package).
- Database-backed customer sessions with httpOnly cookies.
- Database-backed admin sessions with separate httpOnly cookies.
- Customer register/login/logout/me API routes.
- Admin login/logout/me API routes.
- Protected `/account` page.
- Protected `/admin/dashboard` area.
- Seeded local demo accounts for development.

## After extracting / copying these files

Run:

```powershell
npm install
npm run db:generate
npm run db:migrate -- --name auth_sessions
npm run db:seed
npm run typecheck
npm run dev
```

Customer demo account:
- Email: `demo@atelier.local`
- Password: `Demo@12345`

Admin demo account:
- Email: `admin@atelier.local`
- Password: `Admin@12345`

These are local-development credentials only. Replace/remove them before production.
