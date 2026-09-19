# ATELIER — Master Agent & System Context (`agent.md`)

> **Repository Root**: `d:\cloth`  
> **Application Root**: `d:\cloth\premium-store`  
> **Last Updated**: Phase 23.5 (Production-Ready Architecture)  
> **Target Audience**: AI Coding Agents, Pair Programmers, Senior Full-Stack Engineers  

---

## 1. Executive Summary & Project Purpose

**ATELIER** is an ultra-premium, minimalist e-commerce storefront and integrated administrative platform tailored for luxury apparel, handcrafted ceramics, homeware objects, and bespoke design pieces.

The system is designed with a strict **architectural luxury aesthetic** inspired by high-end design houses (The Row, Studio Nicholson, Lemaire, Aesop). The UI embraces quiet restraint, tactile typography, deliberate whitespace, and fluid micro-interactions.

### Key Capabilities
- **Storefront**: High-performance catalog browsing, filterable shop drawer, multi-variant product details, guest & authenticated carts, wishlist, address autocomplete, multi-step checkout, bespoke quote request modals, and customer self-service order portal.
- **Payment & Order Pipeline**: Razorpay integration with server-side signature verification, transactional inventory deductions, automated order expiration, and pending order notification banners.
- **Admin ERP Suite (`/admin`)**: Real-time sales analytics, product & variant inventory ledger, category management, order fulfillment lifecycle, B2B/bespoke inquiry processing, customer account directory, review moderation, and digital media library.
- **Live CMS & Design Studio**: Dynamic homepage visual customizer, live typography switching (Playfair Display, Cormorant Garamond, Inter, Cinzel, etc.), announcement bar banner management, and custom content pages.
- **Enterprise Security & RBAC**: Granular Role-Based Access Control (Super Admin, Admin, Order Manager, Content Manager, Support, Editor), dual-cookie session management, and audited API authorization.

---

## 2. Technology Stack & Specifications

| Layer | Technology | Version | Notes |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `15.5.24` | React Server Components (RSC) + Server Actions / Route Handlers |
| **UI Runtime** | React & React DOM | `19.1.1` | React 19 hooks and server action patterns |
| **Language** | TypeScript | `^5.x` | Strict type checking enabled (`tsconfig.json`) |
| **Database** | PostgreSQL | `14+` | Hosted locally on `localhost:5432/atelier` |
| **ORM** | Prisma ORM | `6.19.0` | `@prisma/client` + `prisma` CLI |
| **Styling** | Vanilla CSS / CSS Modules | Custom | **Strict Rule**: No Tailwind CSS. Curated CSS variables in `globals.css` + `.module.css` |
| **Schema Validation** | Zod | `^4.6.2` | Strong payload validation on all public and internal API endpoints |
| **Payments** | Razorpay SDK | Test API | Client modal checkout + server-side HMAC SHA256 signature verification |
| **Authentication** | Node Crypto (`scrypt` + `sha256`) | Native | Custom dual HTTP-only cookies (`atelier_session`, `atelier_admin_session`) |
| **Linter** | ESLint 9 (Flat Config) | `^9.x` | Flat config in `eslint.config.mjs` |

---

## 3. Workspace Layout & Directory Map

```text
d:\cloth\
├── agent.md                                # Master context documentation
├── README-PHASE4.md                        # Phase 4 migration notes
├── atelier-phase2-backend.zip              # Historic phase backup
├── atelier-phase4-product-management-patch.zip # Historic patch
├── backups/                                # Snapshot archive backups
├── premium-store-source.zip                # Source archive
├── premium-store.zip                       # Full bundle archive
└── premium-store/                          # PRIMARY WORKING CODEBASE
    ├── .env                                # Local environment secrets (PostgreSQL, Razorpay)
    ├── .env.example                        # Template environment configuration
    ├── agent.md                            # Application-level context documentation
    ├── eslint.config.mjs                   # ESLint 9 flat configuration
    ├── next.config.ts                      # Next.js configuration (Unsplash remote image domains)
    ├── package.json                        # Dependencies, engines, and run scripts
    ├── tsconfig.json                       # TypeScript compiler configuration
    │
    ├── app/                                # Next.js 15 App Router
    │   ├── layout.tsx                      # Root layout (storefront wrapper, font imports, metadata)
    │   ├── page.tsx                        # Public storefront homepage (CMS-driven)
    │   ├── globals.css                     # Master design tokens, typography, CSS resets
    │   ├── store-provider.tsx              # Storefront React context (cart drawer, notifications)
    │   ├── robots.ts & sitemap.ts          # Automated SEO crawlers & index routes
    │   │
    │   ├── about/, contact/, faq/, ...     # Static & CMS informational pages
    │   ├── account/                        # Customer profile, orders history, address book
    │   ├── category/ & collections/        # Public category and thematic catalog browsers
    │   ├── shop/                           # Master product catalog with sorting & filtering
    │   ├── product/[slug]/                 # Product detail page (gallery, variants, quote modal)
    │   ├── cart/                           # Full-page cart review & quantity adjustments
    │   ├── checkout/                       # Multi-step checkout with address autocomplete
    │   ├── orders/[id]/                    # Order confirmation & customer receipt
    │   ├── wishlist/                       # Saved items management
    │   ├── login/ & register/              # Public customer authentication
    │   │
    │   ├── admin/                          # BACK-OFFICE SUITE
    │   │   ├── dashboard/                  # KPI overview, revenue metrics, inventory alerts
    │   │   ├── analytics/                  # Financial reports, conversion rates, order metrics
    │   │   ├── products/                   # Product catalog CRUD, variant editor, stock control
    │   │   ├── categories/                 # Category hierarchy, banner image manager
    │   │   ├── inventory/                  # Stock movements, manual adjustments, audit ledger
    │   │   ├── orders/                     # Order lifecycle management, tracking, fulfillment
    │   │   ├── inquiries/                  # Wholesale/bespoke customer quotation desk
    │   │   ├── coupons/                    # Discount codes, minimum order value, validity rules
    │   │   ├── reviews/                    # Customer review moderation queue
    │   │   ├── admins/                     # Admin user directory, role assignment, deactivation
    │   │   ├── roles/                      # RBAC matrix editor & custom permission sets
    │   │   ├── media/                      # Digital media library & CDN URL manager
    │   │   ├── pages/                      # CMS content pages CRUD
    │   │   ├── homepage/                   # Live homepage visual theme & section customizer
    │   │   ├── login/                      # Admin back-office login portal
    │   │   └── components/                 # Admin shell, navigation sidebar, modals, tables
    │   │
    │   ├── api/                            # REST API HANDLERS
    │   │   ├── address/                    # Customer address CRUD
    │   │   ├── admin/                      # Secure back-office endpoints (RBAC-protected)
    │   │   ├── auth/                       # Customer & admin login, register, session logout
    │   │   ├── cart/                       # Add, update, remove, merge items
    │   │   ├── checkout/                   # Order creation, coupon application, validation
    │   │   ├── coupons/                    # Code verification & discount calculation
    │   │   ├── inquiries/                  # Bespoke quote request submission
    │   │   ├── orders/                     # Order status queries, cancellation, expiry
    │   │   ├── payments/                   # Razorpay order generation & signature verify
    │   │   ├── products/                   # Catalog search, filter, and detail endpoints
    │   │   ├── webhooks/                   # Razorpay webhook listener
    │   │   └── wishlist/                   # Wishlist item toggling
    │   │
    │   └── components/                     # 35+ Modular Storefront Components
    │       ├── store-header.tsx            # Sticky navigation, logo, cart indicator, search
    │       ├── shop-drawer.tsx             # Slide-out full-catalog exploration menu
    │       ├── catalog-browser.tsx         # Filterable, sortable product grid
    │       ├── product-page-client.tsx     # Variant selector, image gallery, Add to Cart
    │       ├── razorpay-checkout.tsx       # Razorpay modal execution and fallback handling
    │       ├── request-quote-button.tsx    # Modal dialog for bespoke or wholesale inquiries
    │       ├── announcement-slider.tsx     # CMS-driven header announcement marquee
    │       ├── homepage-theme.tsx          # Dynamic CSS variable & font injector
    │       └── ...                         # Dedicated module CSS files for each component
    │
    ├── lib/                                # Core Services & Domain Utilities
    │   ├── prisma.ts                       # Prisma Client singleton
    │   ├── auth.ts                         # Session cookies, password verify, user/admin loaders
    │   ├── admin.ts                        # `requireAdmin()`, `requireAdminPermission()` guards
    │   ├── cart.ts                         # Cart calculation and cart item normalization
    │   ├── catalog.ts                      # Optimized product catalog queries
    │   ├── checkout.ts                     # Pricing calculations, tax, discount logic
    │   ├── cms.ts                          # CMS homepage and page fetchers
    │   ├── order-expiry.ts                 # Background cleanup for stale unfulfilled orders
    │   ├── password.ts                     # Secure password hashing (`scrypt`)
    │   ├── seo.ts                          # Structured JSON-LD schemas and metadata builders
    │   ├── storefront-cache.ts             # In-memory storefront cache and ISR helpers
    │   └── validation/                     # Zod request validators (`api.ts`, `payment.ts`)
    │
    ├── prisma/
    │   ├── schema.prisma                   # Complete relational PostgreSQL schema
    │   └── seed.ts                         # Database seed script (demo data, admin, permissions)
    │
    └── scripts/                            # Operational & Diagnostic Utilities
        ├── setup-rbac.cjs                  # RBAC roles and permissions initialization
        ├── seed-storefront-categories.js   # Production category generator
        ├── deep-security-audit.cjs         # Security verification test suite
        └── add-homepage-theme.cjs          # Initial theme configuration setup
```

---

## 4. Database Schema & Data Models (`prisma/schema.prisma`)

The PostgreSQL database uses Prisma ORM with strict relational constraints:

### 1. Identity & Permissions
- **`User`**: Customer accounts (`id`, `email`, `passwordHash`, `firstName`, `lastName`, `phone`, `role`, `isActive`).
- **`AdminUser`**: Back-office staff accounts linked to a `Role` (`id`, `email`, `name`, `passwordHash`, `roleId`, `isActive`, `lastLoginAt`).
- **`Role` & `Permission`**: Many-to-many relationship defining granular administrative privileges (`products.read`, `products.write`, `orders.read`, `orders.write`, `customers.read`, `content.write`, `settings.write`, `admins.manage`, `roles.manage`, `activity.read`).
- **`UserSession` & `AdminSession`**: Database-backed sessions with SHA-256 `tokenHash`, expiry timestamp, and auto-cleanup.

### 2. Catalog & Inventory
- **`Category`**: Hierarchical classification (`name`, `slug`, `description`, `imageUrl`, `sortOrder`, `isActive`).
- **`Product`**: Master product (`title`, `slug`, `price` [Decimal 12,2], `compareAtPrice`, `status` [DRAFT, ACTIVE, ARCHIVED], `featured`, `seoTitle`, `seoDescription`).
- **`ProductVariant`**: Specific SKUs (`name`, `sku`, `price`, `stock`, `isActive`).
- **`ProductImage`**: Multi-image gallery (`url`, `alt`, `sortOrder`, `isPrimary`).
- **`InventoryTransaction`**: Complete immutable ledger of stock changes (`variantId`, `orderId`, `adminUserId`, `type` [PURCHASE_DEDUCTION, RESTOCK, ADJUSTMENT, RETURN, REVERSAL], `quantity`, `stockBefore`, `stockAfter`, `reason`).

### 3. Cart, Wishlist & Inquiries
- **`Cart` & `CartItem`**: Stores guest (`sessionId`) and authenticated (`userId`) shopping carts with quantity and unit prices.
- **`Wishlist` & `WishlistItem`**: Saved products linked to authenticated users.
- **`Inquiry` & `InquiryItem`**: B2B and bespoke quotation requests (`name`, `email`, `phone`, `company`, `message`, `status` [NEW, CONTACTED, QUOTED, CONVERTED, CLOSED], `adminNotes`).

### 4. Orders, Payments & Promotions
- **`Order`**: Master transaction record (`orderNumber`, `status` [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED], `subtotal`, `discount`, `shipping`, `tax`, `total`, `currency`).
- **`OrderItem`**: Snapshot of purchased products, variant SKUs, quantities, and price at purchase time.
- **`Payment`**: Payment record linked 1:1 to Order (`provider` [RAZORPAY, COD, MANUAL], `providerPaymentId`, `status` [PENDING, AUTHORIZED, PAID, FAILED, REFUNDED], `rawResponse`).
- **`Coupon` & `CouponUsage`**: Promo codes (`type` [PERCENTAGE, FIXED], `value`, `minOrderAmount`, `maxDiscount`, `usageLimit`, `usedCount`, `startsAt`, `expiresAt`).

### 5. Content Management & Storefront Configuration
- **`CmsHomepage`**: Master configuration singleton (`heroTitle`, `heroExcerpt`, `heroCtaHref`, `heroImageUrl`, `collectionTitle`, `storyTitle`, `announcement`, `themeConfig` [JSON for fonts and colors]).
- **`CmsPage`**: Rich-text informational content (`about`, `privacy`, `terms`, `shipping`, `returns`).
- **`Media`**: Uploaded asset records (`url`, `fileName`, `mimeType`, `size`).
- **`Review`**: Customer reviews (`title`, `body`, `isApproved`).
- **`ActivityLog`**: Audit trail of admin actions.

---

## 5. Authentication, Security & RBAC Architecture

### Dual-Cookie System
To ensure strict boundary separation between public customers and administrative staff, the application uses two distinct HTTP-only cookies:
1. **Storefront Customer**: `atelier_session`
2. **Back-Office Admin**: `atelier_admin_session`

### Authentication Flow
1. **Password Hashing**: Uses Node's native `crypto.scrypt` with a random 16-byte salt (formatted as `salt:derivedKeyHex`).
2. **Session Storage**: A high-entropy 32-byte `base64url` token is generated. Its SHA-256 hash is persisted in `UserSession` or `AdminSession` (tokens in cookies are never stored raw in the database).
3. **Session Lifetime**: Set to 30 days with automated invalidation if the user is deactivated.

### Admin Permissions Matrix
Admins are guarded by helper functions in [`lib/admin.ts`](file:///d:/cloth/premium-store/lib/admin.ts):
- `requireAdmin()`: Validates that the request has an active admin session.
- `hasPermission(admin, key)`: Checks if the admin's assigned role possesses the specific permission key.
- `requireAdminPermission(key)`: Enforces permission check or redirects/rejects.

Default Template Roles (configured in [`scripts/setup-rbac.cjs`](file:///d:/cloth/premium-store/scripts/setup-rbac.cjs)):
- **SUPER ADMIN**: Full access to all modules, including admin accounts and role management.
- **ADMIN**: Complete store operations except managing admin roles.
- **ORDER MANAGER**: Orders, inventory, inquiries, and customer viewing.
- **CONTENT MANAGER**: Blog, CMS pages, and homepage theme configuration.
- **SUPPORT**: Customer service, inquiry responses, and customer details.
- **EDITOR**: Catalog products, categories, and content editing.

---

## 6. Storefront & E-Commerce Workflows

### 1. Catalog Browsing & Search
- Located in `/shop`, `/category/[slug]`, and `/collections/[slug]`.
- Filter products by category, availability, and sort order (price asc/desc, newest).
- Responsive slide-out navigation menu (`shop-drawer.tsx`) accessible from any page.

### 2. Shopping Cart & Guest Persistence
- Cart updates via `/api/cart`.
- Supports both anonymous guest sessions (via generated session cookies) and logged-in user carts.
- Automatic cart merging when a guest user logs into an existing account.

### 3. Checkout & Payment Pipeline
1. **Draft Order**: Customer proceeds to `/checkout`. Shipping address is captured (with address auto-complete component) and coupons are applied via `/api/coupons`.
2. **Order Placement**: System creates a `PENDING` order and locks variant inventory.
3. **Payment via Razorpay**:
   - `/api/payments/create-order` initializes a Razorpay order in INR.
   - Client launches Razorpay modal via `razorpay-checkout.tsx`.
   - On completion, `/api/payments/verify` validates the HMAC SHA-256 signature (`orderId + "|" + paymentId` hashed with `RAZORPAY_KEY_SECRET`).
4. **Order Confirmation**:
   - Status updates from `PENDING` to `CONFIRMED`.
   - Stock deduction is permanently recorded in `InventoryTransaction` with type `PURCHASE_DEDUCTION`.

### 4. Bespoke & Wholesale Quotations
- For premium bespoke items, clients click **"Request a Quote"** (`request-quote-button.tsx`).
- Submits structured inquiry to `/api/inquiries`, visible in Admin -> Inquiries.

### 5. Dynamic Theming & Typography
- The store header and layout read settings from `CmsHomepage`.
- `homepage-theme.tsx` applies custom Google Fonts and design palette variables on the fly without requiring a rebuild or redeployment.

---

## 7. Administrative Back-Office (`/admin`)

The back-office is located under `/admin` and accessed via `/admin/login`:

- **`/admin/dashboard`**: High-level store metrics, sales revenue, order status overview, low inventory alert counters.
- **`/admin/products` & `/admin/products/new`**: Complete product and variant catalog builder with SKU generation, pricing, images, and category assignment.
- **`/admin/categories`**: Category hierarchy and cover photo manager.
- **`/admin/inventory`**: Stock levels per SKU, restock actions, adjustment notes, and transaction history.
- **`/admin/orders`**: Status transition engine (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`), tracking numbers, notes.
- **`/admin/inquiries`**: Lead management for custom orders and wholesale clients.
- **`/admin/coupons`**: Discount code creation (percentage vs. fixed amount, date windows, usage caps).
- **`/admin/homepage`**: Visual CMS manager for hero banners, collection highlights, announcement ticker, and typography preview.
- **`/admin/reviews`**: Moderation panel to approve or reject customer product reviews.
- **`/admin/admins` & `/admin/roles`**: RBAC user and permissions control.
- **`/admin/media`**: Digital asset library.

---

## 8. Development Runbook & Operational Commands

All commands should be run from `d:\cloth\premium-store`:

### Installation & Server Execution
```bash
# Navigate to the project directory
cd d:\cloth\premium-store

# Start local development server (http://localhost:3000)
npm run dev

# Run TypeScript compiler verification (Zero Errors required)
npm run typecheck

# Run production build
npm run build

# Start production server
npm run start
```

### Database Operations (Prisma)
```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Run development migrations
npm run db:migrate

# Seed demo data, admin accounts, and default permissions
npm run db:seed

# Launch visual Prisma database inspector (http://localhost:5555)
npm run db:studio
```

### Administrative & Security Scripts
```bash
# Setup or reset the Role-Based Access Control matrix
node scripts/setup-rbac.cjs

# Initialize homepage theme configuration
node scripts/add-homepage-theme.cjs

# Execute comprehensive security verification audit
node scripts/security-verification.cjs

# Seed category hierarchy
node scripts/seed-storefront-categories.js
```

---

## 9. Environment Configuration & Test Credentials

### Local `.env` Configuration
File: [`d:\cloth\premium-store\.env`](file:///d:/cloth/premium-store/.env)
```env
DATABASE_URL="postgresql://postgres:tltq4511@localhost:5432/atelier?schema=public"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

RAZORPAY_KEY_ID="rzp_test_Tagh2cPCwEjR1T"
RAZORPAY_KEY_SECRET="PY1ryKjm2Tj7TZAS3cu4VCIr"
RAZORPAY_WEBHOOK_SECRET=""
```

### Default Seed Credentials
- **Admin Portal**:
  - URL: `http://localhost:3000/admin/login`
  - Email: `admin@atelier.local`
  - Password: `Admin@12345`
  - Assigned Role: `SUPER ADMIN`
- **Customer Account**:
  - URL: `http://localhost:3000/login`
  - Email: `demo@atelier.local`
  - Password: `Demo@12345`

---

## 10. Development History & Phase Progression

The project was engineered through a series of structured milestone phases:
- **Phases 1 – 3**: Core database schema, Next.js 15 App router foundation, customer auth, and responsive catalog browsing.
- **Phase 4**: Complete back-office product & category management suite (`/admin/products`, `/admin/categories`).
- **Phases 5 – 9**: Razorpay integration, multi-step checkout, stock deduction on payment, order cancellation windows, and pending payment notification banners.
- **Phases 11 – 12**: Inventory transaction audit ledger, restock tracking, and coupon promotion engine.
- **Phases 16 – 20**: Dynamic CMS Homepage studio, announcement marquee, live typography theme customizer, and bespoke quote request modals.
- **Phase 21**: Comprehensive security audit (RBAC enforcement across all `/api/admin` routes, parameter sanitization, rate limiting checks, and security verification scripts).
- **Phase 22**: SEO optimization, JSON-LD structured schema generator, dynamic XML sitemap (`sitemap.ts`), and OpenGraph metadata.
- **Phase 23 & 23.5**: ESLint 9 flat configuration patch (`eslint.config.mjs`), Autoprefixer CSS corrections, clean TypeScript validation, and production build stabilization.

---

## 11. Critical Coding Guidelines for AI Agents

When implementing new features or fixing bugs in this repository, you **MUST** follow these ironclad rules:

1. **Strictly No Tailwind CSS**:
   - Do NOT install or introduce Tailwind CSS classes.
   - All styling must be written in Vanilla CSS using CSS Modules (`*.module.css`) or declared in [`app/globals.css`](file:///d:/cloth/premium-store/app/globals.css) using design tokens (`var(--font-heading)`, `var(--bg)`, `var(--fg)`, `var(--border-light)`, etc.).
2. **Prisma Decimal Serialization**:
   - Prices in `schema.prisma` are defined as `Decimal @db.Decimal(12, 2)`.
   - When returning prices in JSON API responses, always convert them (`Number(product.price)` or `.toNumber()`) to prevent serialization errors.
3. **Next.js 15 / React 19 Asynchronous APIs**:
   - `cookies()` from `next/headers` is **asynchronous**. Always write `const store = await cookies();`.
   - Dynamic route segment params in page and route handlers are promises: `const { slug } = await params;`.
4. **Mandatory Inventory Transaction Logging**:
   - Never update `ProductVariant.stock` in isolation.
   - Any modification to stock must be accompanied by an `InventoryTransaction` record documenting the `type`, `stockBefore`, `stockAfter`, and associated `orderId` or `adminUserId`.
5. **Enforce RBAC on Administrative Routes**:
   - Every API handler in `app/api/admin/*` must verify administrative identity and permission via `requireAdminPermission("...")`.
6. **ESLint Flat Config Compatibility**:
   - Maintain compatibility with ESLint 9 in `eslint.config.mjs`. Do not spread non-iterable config imports.
7. **Typecheck Before Committing**:
   - Always verify TypeScript cleanly compiles using `npm run typecheck` before concluding changes.
