# Announcement Bar Cleanup Patch

PATCH. Extract directly into D:\\cloth\\premium-store.

Replaces:
- app/components/announcement-slider.module.css

Adds:
- scripts/remove-legacy-homepage-topbar.cjs

The CSS removes the progress line and corner dots while preserving the horizontal slide animation.

The script removes any leftover legacy `<div className="topbar">...</div>` from the homepage/header so the old hardcoded Complimentary Shipping bar does not appear underneath the CMS announcement slider.

After extraction, run:

node scripts/remove-legacy-homepage-topbar.cjs

Then restart Next.js:

Ctrl+C
rmdir /s /q .next
npm run dev

No database migration is required.
