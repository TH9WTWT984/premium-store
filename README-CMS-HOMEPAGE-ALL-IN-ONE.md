# ATELIER Homepage Studio — All-in-one UI restore

TYPE: PATCH

Extract directly into:
D:\cloth\premium-store

Replaces/adds only:
- app/admin/homepage/homepage-manager.tsx
- app/admin/homepage/homepage-manager.module.css
- app/components/announcement-slider.tsx
- app/components/announcement-slider.module.css

What this restores:
- Announcement Studio
- Brand Studio
- Palette generator + editable palette swatches
- Heading/body font presets
- Heading/body text color controls
- Background/surface/muted/accent/border colors
- Existing homepage content editor
- Clean announcement bar with no dots/progress line

Does NOT touch:
- Database/schema/migrations
- Products, categories, cart, checkout, payments
- Orders, inventory, coupons, inquiries
- CMS Pages data

IMPORTANT:
This patch is intended to be applied AFTER the previous Announcement Studio patch. It restores the Brand Studio that was overwritten when the announcement-only homepage manager was installed.

After extraction:
  cd /d D:\cloth\premium-store
  npm run typecheck

Then restart the dev server if it is running.
