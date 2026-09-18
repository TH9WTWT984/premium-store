ATELIER Header & Journal Cleanup — PATCH

Extract directly into:
D:\cloth\premium-store

Replaces:
- app/components/store-header.tsx
- app/blog/page.tsx

Adds:
- app/components/store-header.module.css

What changed:
- Removed Journal from the primary navigation.
- Removed the legacy hardcoded complimentary-shipping bar from StoreHeader so it cannot duplicate the CMS announcement bar.
- Added a functional search field that submits to /search?q=...
- Added compact SVG icons for Shop, Collections, Search, Account, Wishlist, and Bag.
- Made the header responsive so the search field collapses to an icon on smaller screens.
- /blog now redirects to / because the Journal section is no longer used.

Does NOT touch:
- Products
- Categories
- Cart
- Checkout
- Orders
- Payments
- Inventory
- Coupons
- Inquiries
- CMS data
