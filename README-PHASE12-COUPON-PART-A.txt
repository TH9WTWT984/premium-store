ATELIER PHASE 12 — COUPON PART A

TYPE:
PATCH, not a full project.

WORKING PROJECT:
D:\cloth\premium-store

EXTRACT DIRECTLY INTO:
D:\cloth\premium-store

REPLACED:
- lib\checkout.ts
- app\api\checkout\route.ts
- app\components\checkout-form.tsx

ADDED:
- app\api\coupons\validate\route.ts

DOES NOT TOUCH:
- prisma\schema.prisma
- Razorpay files
- inventory files
- .env

AFTER EXTRACTION:
cd /d D:\cloth\premium-store
npm run typecheck
npm run dev

NOTE:
This patch expects the existing Coupon and CouponUsage Prisma models/migration.
