# ATELIER — Phase 2

This phase adds the PostgreSQL + Prisma data layer without replacing the Phase 1 storefront.

## Requirements

- Node.js 20.9+
- PostgreSQL 14+

## Windows setup

1. Copy `.env.example` to `.env`.
2. Make sure PostgreSQL is running.
3. Create a database named `premium_store` (or change `DATABASE_URL`).
4. From the project folder run:

```powershell
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

5. Open `http://localhost:3000/api/health`.
   - `{"ok":true,"database":"connected"}` means the app can reach PostgreSQL.
6. Open `http://localhost:3000/api/products` to verify seeded products.

## Important

The seed data is development data. It does not create a usable production admin password or real payment credentials. Authentication, authorization, payments, inventory workflows, and production secrets are implemented in later phases.

Never commit `.env` or real API keys.
