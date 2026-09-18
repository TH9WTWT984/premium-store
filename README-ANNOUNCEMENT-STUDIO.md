# Announcement Studio Patch

PATCH for D:\\cloth\\premium-store. Extract directly into the project root.

Changes:
- Replaces app/page.tsx
- Replaces app/admin/homepage/homepage-manager.tsx
- Replaces app/api/admin/homepage/route.ts
- Adds app/components/announcement-slider.tsx
- Adds app/components/announcement-slider.module.css
- Extends app/admin/homepage/homepage-manager.module.css

No migration is required. Announcement settings are stored as JSON inside the existing CmsHomepage.announcement TEXT column. The API accepts up to 8000 characters.

The client can manage multiple announcement messages, enable/disable each, transition (slide/fade/slide up/slide down/instant), interval, animation speed, pause-on-hover, and progress indicator from Admin > Homepage.
