# Current state

> **This file is updated at the end of every work session.** When you finish a chunk of work, replace the relevant sections below and add an entry to the changelog at the bottom.

## Phase

**E — Admin Panel (Hebrew + Fulfillment Dashboard)** — **✅ COMPLETE** (verified 2026-04-10).
Phases A + B + C + D + design uplift all complete.
Phase H (final organization pass for AI handoff) added to the plan file at the client's request — runs at the very end, after all implementation phases.

## What's done

### Phase A
- [x] Next.js 16.2.3 project scaffolded (TypeScript, Tailwind v4, App Router, `src/` dir, import alias `@/*`)
- [x] Payload CMS 3.82.1 installed (+ `@payloadcms/next`, `@payloadcms/db-sqlite`, `@payloadcms/richtext-lexical`, `sharp`, `graphql`)
- [x] `src/payload.config.ts` with SQLite adapter + minimal `Users` collection
- [x] `(payload)` route group: layout, admin catch-all page + not-found, REST `/api/[...slug]`, GraphQL `/api/graphql`, playground `/api/graphql-playground`
- [x] `@payload-config` path alias in `tsconfig.json`
- [x] `next.config.ts` wrapped with `withPayload` + `withNextIntl`
- [x] `.env.local` and `.env.example` with `PAYLOAD_SECRET`, `DATABASE_URI`, `NEXT_PUBLIC_SITE_URL`
- [x] `src/brand.config.ts` — single source of truth for brand data
- [x] `src/app/globals.css` — Tailwind v4 `@import` + `@theme` with Shoresh palette (sage, parchment, tan, forest)
- [x] `next-intl 4.9.0` installed and configured (`src/lib/i18n/routing.ts`, `navigation.ts`, `request.ts`)
- [x] `src/middleware.ts` — next-intl locale routing, excluding `/admin` and `/api`
- [x] `src/messages/he.json` and `en.json` with initial `common`/`nav`/`home`/`footer` namespaces
- [x] `src/app/(storefront)/[locale]/layout.tsx` — root layout for storefront with RTL, Heebo + Frank Ruhl Libre fonts, NextIntlClientProvider
- [x] `src/app/(storefront)/[locale]/page.tsx` — Phase A placeholder home with logo + hero + "coming soon"
- [x] `src/components/layout/Header.tsx` and `Footer.tsx` — minimal shells with translated labels
- [x] Logo copied into `public/brand/logo-parchment.jpg`
- [x] `scripts/process-logo.py` — rembg script to produce `public/brand/logo.png` (transparent)
- [x] `CLAUDE.md` and `docs/*.md` scaffolded

## Phase A verification results (2026-04-09)

Dev server booted in **262 ms** (Next 16.2.3 with Turbopack):

```
GET /       200   1630ms   (cold compile)  ← Hebrew home, lang="he", dir="rtl"
GET /en     200   39ms     (warm)          ← English home, lang="en", dir="ltr"
GET /admin  200   5800ms   (cold compile)  ← Payload admin, SQLite schema pulled
```

HTML markers confirmed:
- `/`   has `lang="he"`, `dir="rtl"`, contains `שורש` and `שורשים`
- `/en` has `lang="en"`, `dir="ltr"`, contains `Shoresh` and `Rooted`
- `/admin` contains "Payload", "Shoresh Admin", and email/password form fields (Payload's create-first-user screen)

Expected warnings (not blocking):
- `middleware` → `proxy` deprecation — tracked in `docs/DECISIONS.md` ADR-005
- `No email adapter provided` — expected, wired in Phase D with Resend

## Phase B summary (2026-04-09)

Seeded DB via `POST /api/dev/seed`:
- **5 categories** — nutrition, skincare, aloe, beauty, gifts (all localized he/en)
- **8 Forever products** seeded from real photos in `../assets/`:
  - aloe-lips (₪42), aloe-propolis-creme (₪115), forever-bright-toothgel (₪45),
    aloe-first (₪120, 2 images), aloe-vera-gelly (₪95), forever-bee-propolis (₪165),
    forever-daily (₪140), aloe-body-perfect-match (₪195)
- **2 independent products** — organic-lavender-oil (₪65, stock=12), raw-honey-galilee (₪58, stock=20)
- **SiteSettings** populated with IL + EU + NA + ROW shipping rates, free-shipping threshold ₪300

Collections shipped (all with Hebrew + English labels, `labels`/`label` objects):
- `Users` — role discriminator (admin vs customer), customer-conditional fields (phone, preferredLocale, addresses with country selector incl. IL/US/GB/EU/CA/AU/OTHER)
- `Media` — uploads with 4 image size presets (thumbnail, card, detail, hero), localized alt text
- `Tags` — flat, localized title, auto-slug
- `Categories` — localized title + richText description, self-relation for tree, image upload
- `Products` — `type: 'forever' | 'independent'` discriminator driving conditional fields via `admin.condition`:
  - forever: `foreverProductCode`, `foreverDistributorPrice`
  - independent: `sku`, `stock`, `weightGrams`
  - Common: localized title/shortDescription/description, price (ILS), images array, category, tags, isFeatured, isNew, status
- `Orders` — `orderStatus` (money) + `fulfillmentStatus` (goods) state machines, line-item snapshots (title/price/image captured at order time), international shipping address group, auto-generated orderNumber via `beforeValidate` hook (SH-YYYYMM-NNNN)
- `SiteSettings` global — logo, heroImages, announcementBar, contact group, social, shipping group (freeShippingThreshold + regioned rates array), forever group

Other Phase B changes:
- `payload.config.ts` now registers all 6 collections + SiteSettings global
- Enabled Payload `localization` (he + en, he default, fallback true) for content
- Enabled Payload `i18n` with Hebrew + English admin UI strings (`@payloadcms/translations`)
- Created `src/lib/seed.ts` with `runSeed(payload)` function
- Created `src/app/(payload)/api/dev/seed/route.ts` — dev-only POST endpoint that runs the seed (returns 403 in production)
- Verified: dev server boots, seed runs successfully, all 10 products queryable via `GET /api/products`, `/admin` welcome screen shows all Users fields including custom ones

## Phase C summary (2026-04-09)

Shipped a fully working storefront with real data from Payload:

**Pages:**
- `/` — Home with Hero (logo + tagline + CTAs), TrustBar (4 value props), FeaturedProducts (3 featured seeded products), ForeverSpotlight (4 Forever products + brand story), CategoryGrid (5 categories)
- `/shop` — Product grid with brand filter chips (All / Forever / Natural) + category filter chips + empty-state message. Filters are URL-based (`?brand=forever&category=aloe`) for bookmarking.
- `/product/[slug]` — Image gallery (primary + thumbs), type badge, title, short description, price (Intl.NumberFormat ILS), Add to Cart button, full Lexical-rendered description, 404 on unknown slug
- `/cart` — Full-page cart with item list, quantity +/-, remove, subtotal summary, checkout button
- `/shop/`, `/about`, `/contact` placeholders from earlier iteration now either real or stubbed
- `/en/*` — full English mirror via next-intl localePrefix='as-needed'

**Components:**
- `ui/Container`, `ui/Button` (primary/secondary/ghost × md/lg, renders as `<button>` or `<Link>`), `ui/Badge` (primary/accent/muted tones)
- `product/ProductCard` — type-aware (Forever → accent badge, Independent → primary "In stock" badge), locale-aware price formatting, image-on-hover scale, mobile-to-desktop responsive grid
- `cart/AddToCartButton` (client) — calls Zustand store, shows "Added ✓" confirmation state
- `cart/CartIcon` (client) — header button with live count badge, mounted flag to avoid SSR hydration mismatch
- `cart/CartDrawer` (client) — slide-in side panel with backdrop, Escape-to-close, body-scroll lock, full item list with inline quantity controls
- `cart/drawerStore` — tiny Zustand store for drawer open/close
- `layout/LanguageSwitcher` (client) — he/en toggle preserving current path via next-intl's `useRouter.replace`
- `layout/Header` (server) — sticky with logo, nav, language switcher, cart icon
- `layout/Footer` (server) — 4-column responsive footer
- `sections/Hero`, `sections/TrustBar`, `sections/FeaturedProducts` (server, fetches), `sections/ForeverSpotlight` (server, fetches), `sections/CategoryGrid` (server, fetches)

**Lib:**
- `lib/cn.ts` — tiny class-name joiner, no external dep
- `lib/payload.ts` — cached `getPayloadClient()` for server components
- `lib/cart/store.ts` — Zustand store with `persist` middleware, `shoresh-cart` localStorage key, selectors for count + subtotal

**Config:**
- `next.config.ts` — added `images.remotePatterns` for Payload media URLs
- `next-intl` params now support `count` placeholder (e.g. `shop.subtitle: "{count} products"`)
- Storefront layout mounts `<CartDrawer />` inside `NextIntlClientProvider`

**Verified:**
- Typecheck: 0 errors
- Dev server boots, hits `GET /` and multiple `GET /api/media/file/...` at 200
- Screenshot of `/` (Hebrew RTL) and `/en` (English LTR) both render correctly with real products
- Forever spotlight, featured products, and category grid all pull live data from Payload
- Logo integrates cleanly with `#ECE5D4` site background

## Phase D summary (2026-04-09)

**All scaffolding done. Runs end-to-end with the mock provider.** Real payment gateway (Meshulam or alternative) slots in via one file without touching the checkout orchestration, API routes, or pages.

**Pluggable PaymentProvider abstraction** (`src/lib/payments/`)
- `provider.ts` — `PaymentProvider` interface with `createPayment` + `verifyWebhook`
- `mock.ts` — dev mock that synchronously marks orders as paid
- `meshulam.ts` — STUB with clear `HOW TO FINISH` comments (peek when Yarit has credentials)
- `index.ts` — `getPaymentProvider()` factory that picks based on `PAYMENT_PROVIDER` env var

**Pluggable EmailProvider abstraction** (`src/lib/email/`)
- Same shape (interface + mock + resend stub + factory)
- `templates.ts` — HTML order confirmation email template, bilingual, inline styles matching the Shoresh palette

**Shipping rate calculator** (`src/lib/shipping.ts`)
- Country → region mapping (IL / EU / NA / ROW) with Israel + 6 international countries
- Free-shipping threshold applies only when region is IL AND subtotal ≥ threshold
- Used by `/api/shipping-rates?country=X&subtotal=Y` (dynamic rate refresh in CheckoutForm)

**Server-side checkout orchestration** (`src/lib/checkout.ts`)
- `createOrderFromCheckout(payload, input)` does: re-validates every line item against the live catalog (never trust client prices), calculates totals + shipping, finds-or-creates the customer user, creates the Order with the right initial `fulfillmentStatus` (Forever items → `awaiting_forever_purchase`, all independent with stock → `packed`), decrements independent stock, calls the active payment provider, flips to `paid` immediately for synchronous providers, sends the confirmation email, returns `{orderId, orderNumber, redirectUrl}`.
- Security: client can only submit `productId + quantity + customer info + address`. Prices and stock come from Payload.

**API routes** (under `src/app/(payload)/api/`)
- `POST /api/checkout` — thin HTTP adapter, delegates to `createOrderFromCheckout`
- `POST /api/webhooks/payment` — for asynchronous providers; updates `paymentStatus` + flips order to paid when webhook verifies
- `GET /api/shipping-rates?country=&subtotal=` — live rate fetch for the CheckoutForm when country changes

**Pages**
- `/checkout` — server component that fetches initial IL rates, renders `<CheckoutForm />`
- `/checkout/success?order=<id>` — server component, fetches the order, shows confirmation + summary
- `CheckoutForm` — client component with sections (contact info / shipping address / shipping method), dynamic rate re-fetch on country change, order summary sidebar, submits to `/api/checkout`, redirects to `redirectUrl` and clears cart on success

**End-to-end verification (2026-04-09)**
- `POST /api/shipping-rates?country=IL&subtotal=150` → 2 IL rates (₪29, ₪49) ✓
- `POST /api/shipping-rates?country=IL&subtotal=500` → both rates drop to ₪0 (free-shipping threshold ₪300) ✓
- `POST /api/shipping-rates?country=US&subtotal=100` → 1 NA rate (₪119) ✓
- `POST /api/checkout` with 2 Forever + 1 independent item → Order `SH-202604-9412` created, `immediatePaid: true`, stock on product 9 decremented 12 → 11 ✓
- Mock email logged to dev console with full Hebrew HTML template body ✓
- `/checkout/success?order=1` renders the thank-you page correctly with real order data ✓
- Playwright screenshot of populated `/checkout` form: 3-column layout, all sections, 2 IL shipping options, summary sidebar ✓

## Design uplift (post-Phase C review) — 2026-04-09

Background agent reviewed the homepage and reported it felt "empty" / not sufficiently botanical. Implemented the high-priority punchlist:

**New primitives**
- `components/ui/BranchDivider.tsx` — inline SVG sage sprig with hairlines on both sides, used between homepage sections
- `components/ui/SectionHeading.tsx` — reusable h2 with optional italic eyebrow, Frank Ruhl Libre serif title, small sprig flourishes on both sides (RTL-aware)

**New sections**
- `components/sections/MeetYarit.tsx` — 2-col strip with `about-hero.jpg` (previously unused), eyebrow + serif heading + short bio + link to /about. Fills the "no human presence" gap.
- `components/sections/Testimonials.tsx` — 3 placeholder customer testimonials with stars, corner sprig flourish, bilingual content via `testimonials` i18n namespace (he + en)

**Existing sections polished**
- `Hero` — already had wash, unchanged
- `FeaturedProducts` — adds `newsletter-bg.jpg` as 20% ambient background + SectionHeading + eyebrow ("הבחירות שלי" / "Hand-picked")
- `ForeverSpotlight` — background opacity raised 30% → 45% for more distinction, serif heading, punchier eyebrow
- `CategoryGrid` — SectionHeading + category titles now use the display serif

**Global polish**
- `ProductCard` — background inverted: card body is parchment (warmer) and image viewport is bright white, so the product pops off the card instead of disappearing into beige
- `globals.css` — subtle paper-grain noise overlay (SVG fractal noise at 5% opacity, `mix-blend-mode: multiply`, fixed position) to read "handmade" instead of "digital"
- Homepage now composes: Hero → TrustBar → BranchDivider → Featured → BranchDivider → MeetYarit → ForeverSpotlight → Testimonials → BranchDivider → CategoryGrid

**Verified via screenshots**: both Hebrew and English homepages render beautifully, the page feels significantly fuller, and the watercolor aesthetic is consistent throughout.

## Phase E summary (2026-04-10)

**Admin panel organized for Yarit + custom Fulfillment Dashboard working end-to-end.**

**Payload admin polish**
- `i18n.fallbackLanguage` flipped `en` → `he` so Yarit lands in Hebrew by default
- `admin.group` added to every collection so the sidebar is organized:
  - **קטלוג** (Catalog): Products, Categories, Tags
  - **מכירות** (Sales): Orders, Users
  - **תוכן** (Content): Media, Site settings
- `Products.slug` field hidden from the edit form (auto-generated via `beforeValidate` hook, Yarit doesn't need to see URL slugs)
- `Products.admin.listSearchableFields`: title, sku, foreverProductCode
- `Orders.admin.listSearchableFields`: orderNumber

**New-order email notification to Yarit (`src/collections/Orders.ts` hook)**
- `afterChange` hook on Orders collection fires once per paid transition (`previousDoc.paymentStatus !== 'paid' && doc.paymentStatus === 'paid'`)
- Reads admin email from `SiteSettings.contact.email`
- Looks up customer name/email/phone
- Renders the Hebrew new-order alert template (`src/lib/email/adminTemplates.ts`) with a ⚠️ warning if the order contains Forever items
- Sends via the active `EmailProvider` (mock → console log, resend → real email)
- Non-fatal: a send failure does not block order creation
- **Verified**: creating a test order with 2 Forever + 1 independent item fired the hook and logged the Hebrew alert email to the dev console with the Forever warning intact

**Custom Fulfillment Dashboard at `/fulfillment`**
- New route group `(admin-tools)` with its own root layout (brand theme, Heebo font, RTL) — separate from both the `(storefront)` and `(payload)` groups to avoid routing conflicts with Payload's `admin/[[...segments]]` catch-all
- Layout (`src/app/(admin-tools)/layout.tsx`) uses `next/link` (NOT the i18n Link) because the route group has no NextIntlClientProvider — initially crashed with "No intl context found", fixed by switching the import
- `src/app/(admin-tools)/fulfillment/page.tsx` — server component with:
  - Auth gate via `payload.auth({ headers })` — redirects unauthenticated or non-admin users to `/admin`
  - Fetches all orders with `paymentStatus='paid'` and `fulfillmentStatus!='delivered'`
  - Sections grouped by urgency: לטיפול דחוף → נרכש מפוראבר → מוכן למשלוח → בדרך ללקוח
  - Stats bar with counts per state
  - "Show completed orders" toggle via `?all=1` query param
- `src/components/admin/OrderRow.tsx` — client component per order with:
  - Order number (serif), fulfillment status badge, Forever badge if applicable, timestamp
  - Customer info (name + email + phone + city, with tel: and mailto: links)
  - Line items list with color-dot indicators (accent for Forever, primary for independent)
  - Total in ILS
  - State-machine-aware action button: `awaiting_forever_purchase → forever_purchased → packed → shipped → delivered`
  - PATCHes via Payload's built-in `/api/orders/[id]` REST endpoint (Payload handles the admin auth check automatically)
  - `router.refresh()` after update to re-fetch the list
- Middleware matcher updated to exclude `/fulfillment` so next-intl doesn't intercept it for locale rewriting

**Bootstrap dev endpoint**
- `src/app/(payload)/api/dev/create-admin/route.ts` — `POST` endpoint gated on `NODE_ENV !== 'production'` that creates an admin user (email/password/name configurable via request body, defaults to `admin@shoresh.example / admin1234 / Yarit`). Returns existing user if the email is already in use. Used to bootstrap Phase E verification without clicking through Payload's first-user-create wizard manually.

**Design polish wave (same-day)**
- New primitives: `BranchDivider`, `SectionHeading` (both used throughout homepage)
- New sections: `MeetYarit`, `Testimonials` (composed into homepage)
- `ProductCard` polished: corner sprig SVG flourish, hover lift via `.product-card` CSS class, inverted bg (parchment body + white image viewport), serif price (Frank Ruhl Libre), type-aware badges moved to top-end corner
- `AddToCartButton` — pulse animation on "נוסף ✓" state + auto-opens cart drawer on add
- `Header` — `.nav-link` CSS class with RTL-aware animated underline on hover
- `Button` — `.btn-lift` CSS class with subtle translate-y + shadow on hover
- `Hero` — tightened vertical padding, larger gap between logo + headline, staggered `animate-fade-up` keyframes
- `globals.css` — smooth scroll, focus-visible outline, keyframes (pulse-added, fade-up), `.nav-link`, `.product-card`, `.btn-lift` CSS classes
- Homepage now has animation + hover feedback throughout

**Deferred to Phase G**
- Duplicate-product row action — Payload 3 has no native per-row action API. The closest is `listMenuItems` (bulk, not per-row) or replacing the entire list view. Not launch-critical; Yarit can manually recreate a similar product.
- Full Payload-native custom admin view registration (the "proper" way to add sidebar items). My standalone `(admin-tools)` approach works immediately and uses the brand theme, which is actually better UX for a non-technical user.

## What's next

- [ ] Start **Phase F**: Customer account + i18n finalization + SEO + first Vercel deploy
  - `/account` + `/account/orders/[id]`
  - Complete he↔en string coverage
  - `sitemap.xml`, `robots.txt`, per-page meta, Product structured data
  - Responsive QA across iPhone SE / iPad / Desktop 1440
  - **Switch DB adapter from SQLite → Neon Postgres** (required before production)
  - Vercel deploy with custom domain
- [ ] **Phase G**: Post-launch bonuses (blog, newsletter, GA4, WhatsApp notification, duplicate-product action, reviews, low-stock alerts)
- [ ] **Phase H**: Final organization pass for AI handoff (docs audit, JSDoc audit, dead code sweep, navigation index, ONBOARDING.md, naming consistency pass). Runs at the end, takes ~1 day.

## Known issues / blockers

- The logo still has its original parchment background. Yarit or dev should run `python scripts/process-logo.py` to generate `public/brand/logo.png` (transparent). The header and hero currently reference `logo-parchment.jpg` which blends with the parchment site background, so this is not visually blocking — it's a flexibility improvement.
- **Meshulam gateway not yet chosen.** The plan keeps Meshulam as the recommended default but it's not locked. No impact until Phase D (checkout + payments).
- **Forever URL pattern unknown.** Yarit needs to confirm the URL format for Forever Israel distributor deep-links with her upline. No impact until Phase B uses Forever product seeding (and even there, a placeholder can be used).

## Notes for the next session

- Next 16 has async `cookies()`, `headers()`, `params`, `searchParams`. Always `await` them in server components.
- `useTranslations` from next-intl works in both server and client components as long as `setRequestLocale(locale)` was called for the current request.
- The storefront root layout is `src/app/(storefront)/[locale]/layout.tsx` (nested inside the dynamic `[locale]` segment). The Payload admin root is `src/app/(payload)/layout.tsx`. They each own their own `<html>`/`<body>`. There is intentionally no `src/app/layout.tsx`.
- When adding a new collection, remember to import it into `src/payload.config.ts` AND register it in the `collections` array AND give it Hebrew `labels`/`description` for the admin UI (Yarit is non-technical).

## Changelog

- **2026-04-10** — **Phase E complete + design polish pass + Phase H added to plan.** Hebrew-default Payload admin with grouped sidebar (קטלוג / מכירות / תוכן), hidden slug field, search fields. Orders `afterChange` hook fires a Hebrew new-order alert email to Yarit (via the EmailProvider abstraction) when payment flips to paid — includes a ⚠️ Forever warning when applicable. New `(admin-tools)` route group with `/fulfillment` custom dashboard: auth-gated, server-fetched orders grouped by urgency, state-machine action buttons that PATCH via Payload's built-in REST endpoint. Design polish: product card corner sprigs + hover lift + serif price, nav link animated underlines, button lift transitions, hero animate-fade-up keyframes, `globals.css` micro-interactions. Dev bootstrap: `POST /api/dev/create-admin`. Verified end-to-end: seeded DB, created admin user, posted test order, both customer confirmation email + admin alert email logged to console, fulfillment dashboard renders correctly with the order grouped under "לטיפול דחוף — להזמין מפוראבר". Phase H added to plan file — final organization pass for AI handoff readiness, runs at the very end.
- **2026-04-09** — **Phase D complete (with mock provider) + design uplift.** Payment + email provider abstractions, shipping rate calculator, server-side checkout orchestration with price validation + stock decrement + state-machine-aware order creation, full /checkout + /checkout/success pages, 3 API routes, bilingual HTML email template. End-to-end verified: order `SH-202604-9412` created via POST /api/checkout with real stock decrement and mock email logged. Design review agent (spawned in parallel with Phase D work) delivered a 15-item punchlist; implemented high-priority items: BranchDivider + SectionHeading primitives, MeetYarit + Testimonials new sections, newsletter-bg ambient background on Featured, bg opacity bump on Forever Spotlight, inverted ProductCard colors (parchment body + white image viewport), paper-grain noise overlay on body. Homepage now has 7 sections + 3 dividers, feels full and hand-curated.
- **2026-04-09** — **AI brand assets integrated.** User generated all 14 watercolor assets from the prompts (5 category tiles, 4 trust-bar icons, 3 section backgrounds, about-hero, empty-state, product-placeholder). Copied to `public/brand/ai/`, ran rembg on the 4 icons for transparency. Rewrote `Hero`, `TrustBar`, `ForeverSpotlight`, `CategoryGrid`, `ProductCard` to use them. Both Hebrew and English homepages verified via screenshot — the watercolor aesthetic is consistent throughout.
- **2026-04-09** — **Phase C complete.** Full storefront shipping with real data from Payload: home (Hero + TrustBar + FeaturedProducts + ForeverSpotlight + CategoryGrid), /shop with URL-based brand + category filters, /product/[slug] with gallery and Add to Cart, /cart page, cart drawer with quantity controls, language switcher, 4-column footer. Zustand cart store with localStorage persistence. Added `ui/Container`, `ui/Button`, `ui/Badge`, `ProductCard`, `AddToCartButton`, `CartIcon`, `CartDrawer`, `LanguageSwitcher`, 5 section components. Typecheck clean, dev server verified, screenshots captured. 
- **2026-04-09** — **Phase B complete.** 6 collections (Users/Media/Tags/Categories/Products/Orders) + SiteSettings global, all with Hebrew + English labels. Products have a `type: 'forever' | 'independent'` discriminator with `admin.condition`-gated conditional fields. Orders have dual state machines (`orderStatus` + `fulfillmentStatus`) with Forever-aware transitions. International-aware shipping address (country select: IL/US/GB/EU/CA/AU/OTHER). Seeded 10 products (8 real Forever + 2 independent) via `POST /api/dev/seed`. Dual toolchain pivot: tried `tsx`/`payload run --use-swc` for a CLI seed, hit ESM/CJS interop edge cases, pivoted to a dev-only Next.js API route.
- **2026-04-09** — **Phase A complete.** Next.js 16.2.3 + Tailwind v4 + Payload 3.82.1 (SQLite adapter) + next-intl 4.9 + Heebo font + bilingual RTL/LTR routing + Shoresh logo wired into header and hero + full AI-handoff docs (CLAUDE.md + 7 docs files). Dev server verified: `/`, `/en`, `/admin` all respond 200 with correct markers.
