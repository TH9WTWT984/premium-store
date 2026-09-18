ATELIER — SHOP DRAWER PREMIUM UPDATE

TYPE: PATCH — replaces 2 files only.

EXTRACT LOCATION:
D:\cloth\premium-store\app\components\

REPLACES:
- shop-drawer.tsx
- shop-drawer.module.css

WHAT THIS UPDATE DOES:
- Adds a smooth CLOSE animation to match the open animation.
- Keeps the drawer mounted during close so the exit animation can play.
- Keeps the page at / while using the Shop drawer.
- Adds real fashion photography to the Shop All cards using direct Unsplash image URLs.
- Makes the eight requested categories expandable inside the drawer:
  T-Shirts, Shirts, Dresses & Jumpsuits, Tops, Jeans, Trousers, Sweaters, Jackets.
- Clicking a category opens a compact premium sub-panel directly underneath that category.
- The sub-panel includes an image, description, and related subcategories.
- Category and Shop All interactions do not navigate away from the homepage.
- Uses a portal to document.body and a very high z-index so the homepage stays behind the drawer.
- Keeps the existing store-header.tsx untouched.

DOES NOT TOUCH:
- database / Prisma
- products / inventory
- checkout / Razorpay
- CMS / Homepage Studio
- store-header.tsx
- store-header.module.css

AFTER EXTRACTION:
Restart Next.js:

npm run dev

NOTE:
The Shop All and category images use external images.unsplash.com URLs. Replace those URLs later with the client's own catalog/media assets when those assets are available.
