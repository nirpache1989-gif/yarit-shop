# Current state

> **This file is updated at the end of every work session.** When you finish a chunk of work, replace the relevant sections below and add an entry to the changelog at the bottom. Historical entries have been moved to [`docs/STATE-ARCHIVE.md`](./STATE-ARCHIVE.md) — this file only holds the two most recent ships.

## Latest (2026-04-11 very late — Copaia brand rename + catalog replacement + Track D motion + Track B admin UX + docs handoff)

**Feature branch `feat/brand-rename` is 5 commits ahead of `main` (`a3b767d`).** Prod is UNCHANGED at `8d50bd4` via `dpl_EFBBXQ1ZKxrDe2T7ZJTcQTBsJzui`. **Nothing pushed or deployed yet** — waiting on explicit user "push" / "deploy" word. See ADR-020 in `docs/DECISIONS.md` for the decision record.

### Commits on the feature branch

```
1ae5a73 feat(brand): swap hero background to herobg3 + reduce opacity to 85%
fe8b97d feat(admin): Track B — thumbnail column, stock +/-, recent orders, live preview
20a9e2d feat(motion): Track D — sticky header scrub, card Ken Burns, add-to-cart press bounce
f489808 feat(brand): rename Shoresh → Copaia + replace catalog + 3-image galleries
```

### What shipped

**Track A — Brand rename + logo + catalog** (commit `f489808`, 45 files changed, +276/−238)
- `src/brand.config.ts`: `name.he = 'קופאה' / name.en = 'Copaia'`. Tagline (`שורשים של בריאות` / `Rooted in wellness`) and description kept unchanged — the new tree-with-roots logo matches the tagline visually even better than the old wordplay did.
- **55 brand-text hits renamed** across i18n (he/en.json 11 hits), email templates (Users password-reset + adminTemplates new-order alert, 6 hits), admin chrome (BrandLogo/BrandIcon refactored to read `brand.name.he` instead of hardcoding, 4 hits), Payload config (`titleSuffix`, email adapter rename `shoreshEmailAdapter → copaiaEmailAdapter`, `meta.icons` URL, 7 hits), CSS selector (`globals.css:203` dark-mode header drop-shadow, which would have silently broken), product OG descriptions, `.env.example`, `.gitignore`, `scripts/reset-db.mjs`, dev create-admin route, and 10 docs files' current-state sections (CLAUDE.md, AGENTS.md, README.md, docs/BRAND.md, docs/ARCHITECTURE.md, docs/INDEX.md, docs/FULFILLMENT.md, docs/CONVENTIONS.md, docs/ENVIRONMENT.md, docs/ONBOARDING.md, docs/YARIT-ADMIN-GUIDE.md, docs/ADMIN-SURFACES.md).
- **Kept unchanged:** localStorage keys (`shoresh-theme`, `shoresh-cart`) so returning customers keep their theme + cart state. SQLite dev filename renamed `shoresh-dev.db → copaia-dev.db` with both names in `.gitignore` for a grace period. A backwards-compat placeholder string `hello@shoresh.example` is explicitly preserved in `src/lib/siteSettings.ts` `PLACEHOLDER_STRINGS` so prod DB rows still holding the old default are treated as "unset".
- **Logo swap:** Yarit provided `LogoCopaia.jpg` then `LogoCopaiaSMALL.jpg` then `LogoNew.jpg` over the session. The final `LogoNew.jpg` source was processed via PIL brightness-threshold color-key (brightness > 248 → fully transparent, 240–248 → linear fade) to produce a clean transparent PNG. `rembg` was tried first but the default model stripped the tree canopy along with the background — the explicit RGB threshold is more reliable for a source with a near-white background. File named `public/brand/copaia.png` (not `logo.png`) because renaming was necessary to bust Turbopack's in-process Next Image cache — clearing `.next/cache/images` alone was insufficient. Old `public/brand/logo.png` + `logo-parchment.jpg` deleted.
- **Hero logo sizing:** bumped from `h-64/md:h-96` → `h-72/md:h-[28rem]` + nudged `mt-6/md:mt-10` down per Yarit's ask for a more prominent mark.
- **Hero backdrop:** `hero-bg-2.png → herobg3.jpg` (user-provided, warmer watercolor botanical frame with olive branches on top + chamomile/lavender on bottom) + reduced `data-hero-bg` opacity to 85% so the tree has stronger focal priority. `hero-bg-2.png` left as archival asset.
- **Catalog: 8 new products** replacing the old 7:
  - **Dropped:** aloe-lip-balm, aloe-vera-gel, aloe-body-duo-gift-set
  - **Kept unchanged:** aloe-toothgel, bee-propolis, daily-multivitamin
  - **Renamed:** aloe-soothing-spray → aloe-first-spray (same Forever Aloe First product)
  - **New:** aloe-drink (Forever Aloe Peaches, 3 images), aloe-heat-lotion, aloe-deodorant, bee-pollen
  - Each product has 2 or 3 Payload Media photos; aloe-drink + aloe-toothgel have 3 images each (showcasing the T1.7 Flip gallery).
  - SKUs for the 4 new products left as `'TBD'` for Yarit to fill in from the admin.
  - Featured slugs reshuffled: aloe-drink + aloe-toothgel + daily-multivitamin (was aloe-lip-balm + daily-multivitamin + aloe-body-duo-gift-set).
  - Descriptions for the 4 new products are drafts based on Forever Living's public product line; Yarit can refine them via the admin.
- **Image files moved:** 18 new product JPGs moved from `yarit-shop/media/Do not touch - temporary/` → `C:/AI/YaritShop/assets/` (where the seed reads from). 8 old WhatsApp-era source photos deleted from `assets/`.
- **STATIC_IMAGE_OVERRIDES removed entirely** from `src/lib/product-image.ts` + `src/lib/checkout.ts` + the product detail page — the map was both stale (pointed at AI watercolors of the old 7 slugs) and a structural blocker to the 3-image gallery. `resolveProductImage()` now falls through to `product.images[0].image.url → PRODUCT_PLACEHOLDER`.
- **JSON-LD `Product.image`** on `/product/[slug]` now emits the full image array (was single-image only). Google Rich Results docs recommend array shape for product schema.
- **Prod DB: NOT updated.** Prod Neon still holds the old 7 Shoresh-era sourced products. The next session's job is either (a) Yarit manually rebuilds the catalog via the admin (21 image uploads, ~20 min) or (b) a one-off migration script. Recommendation: option (a).

**Track D — GSAP motion polish** (commit `20a9e2d`, 6 files, +218/−60)
- **D.1 Sticky-header scroll scrub** — `HeaderShrinkObserver.tsx` now writes a `--header-scroll-progress` CSS custom property (0..1, interpolated between scrollY 0 and 120) on every rAF scroll frame. `globals.css` uses `calc()` + this variable to continuously interpolate header bg alpha (0.46 → 0.96), box-shadow opacity (0 → 0.35), and logo height (2.5rem → 2rem). Old 280ms binary snap replaced with a 120ms tail that just smooths scroll-end momentum. Reduced-motion fallback re-snaps to the old binary behavior. Added `--color-surface-warm-rgb` to `@theme` + `[data-theme="dark"]` blocks so `rgba() + calc(alpha)` can reference the parchment color through a variable (`calc()` inside `color-mix` isn't reliable across engines). Removed the conflicting `bg-[var(--color-surface-warm)]/92` Tailwind utility from `Header.tsx`. Verified: at scrollY=0 progress=0, bg alpha 0.46, logo 40px, no shadow. At scrollY=60 progress=0.5, bg alpha 0.71, logo 36px, shadow alpha 0.176. At scrollY=200 progress=1, bg alpha 0.96, logo 32px, shadow alpha 0.35. Continuous interpolation confirmed.
- **D.2 Product card Ken Burns** — `ProductCardMotion.tsx` adds a scroll-triggered `gsap.from('.product-image', { scale: 1.08, duration: 1.4, ease: 'power2.out' })` tween with the 2026-04-11 bug-fix pattern (`immediateRender: false + once: true + start: 'top bottom-=40'`) per CLAUDE.md rule #12. Pairs with the existing T1.2 card blooming entrance — cards bloom up, photos breathe down to rest. Moved image ref capture above the touch-device guard so Ken Burns fires on touch devices too. Verified: card caught mid-tween at `matrix(1.0232, ..., 1.0232, 0, 0)`.
- **D.3 Add-to-cart press bounce** — `AddToCartButton.tsx` captures the underlying `<button>` via a new `buttonRef` and fires a `gsap.timeline` on click: scale 1 → 0.96 (100ms, `power2.out`) → 1 (220ms, `back.out(1.8)`). The overshoot is intentional. Works on both `primary` + `ghost-link` variants. Respects `prefers-reduced-motion: reduce`. `Button.tsx` now supports React 19 ref-as-prop + event-carrying `onClick` (was swallowing the event on the primary variant). Verified: caught at `matrix(1.0212, ..., 1.0212, 0, 0)` 50ms after dispatchEvent — that's the `back.out(1.8)` overshoot phase. Button text flipped to "✓ Added" confirming the full handler chain (press + confetti + cart mutation + drawer open) still runs.

**Track B — Admin UX picks** (commit `fe8b97d`, 6 files, +599/−3)
- **B.1 Thumbnail column on products list** — new server cell `ProductThumbnailCell.tsx` reads the first image off each row and renders a 48px rounded thumbnail. Registered as `admin.components.Cell` on the `images` field in `Products.ts`; `images` added to `defaultColumns` (first column, before title/type/price/category/status). Depth fallback: Payload's default list-view fetch leaves `images[].image` as a bare ID, so the cell component does a one-off `payload.findByID` when it detects an unpopulated relation (N+1 per page is acceptable — admin-only, small pages). Empty-state `—` placeholder keeps rows aligned. Verified: 8 rows, 8 populated thumbnails, first src `/api/media/file/ForeverDailyMAIN.jpg`, columns rendered in correct order.
- **B.2 Stock +/- quick adjust** — new client field component `StockQuickAdjust.tsx` wraps `@payloadcms/ui`'s default `NumberField` and adds two small sage pills for `+1` / `−1`. Uses `useField<number>` to stay integrated with Payload's form state. Only visible when `data.type === 'stocked'` (inherited from the existing `admin.condition`). `−1` button disabled when stock is 0. Verified via PATCH: flipped product 1 to `type=stocked, stock=7`, clicked `+1`, form value went 7 → 8. Reverted afterward.
- **B.3 Dashboard recent orders section** — `YaritDashboard.tsx` now fetches the 3 most recent paid orders via `payload.find({ collection: 'orders', sort: '-createdAt', limit: 3, depth: 1 })` and renders them between the stats row and the tile grid. Each item shows: order number, fulfillment status pill, customer label (name → email → fallback), ₪total, 1-line item summary, link to the order edit page. Friendly empty-state ("כשהזמנות יתחילו להיכנס, שלושת האחרונות יופיעו כאן.") fills the slot during launch week. Verified: empty-state renders with the current dev DB (0 orders).
- **B.4 Live Preview on products** — Payload 3's built-in Live Preview enabled via `admin.livePreview.url` on the Products collection. URL builder reads form `slug` + locale and returns `${SITE_URL}${localePrefix}/product/${slug}`. Three breakpoints: Mobile (375×812), Tablet (768×1024), Desktop (1440×900). Verified: Live Preview button detected on the product edit page.

### Quality gates

- `npx tsc --noEmit` → 0 errors
- `npm run lint` → 0 errors, 0 warnings
- `npm run build` → 40 routes, all `ƒ`/`○`, zero `●` SSG

### Verification (dev + preview MCP)

- **Dev reseed** via `POST /api/dev/seed?wipe=1`: 8 products, 18 media docs, 5 categories, site-settings populated.
- **Storefront `/en`:** title "Copaia — Rooted in wellness", header logo `alt="Copaia"` src `/brand/copaia.png`, hero tree logo at natural size 832×1248 rendering with solid dark-green canopy pixels (color-key fix verified via canvas.getImageData), no visible parchment rectangle, `herobg3.jpg` serves at 0.85 opacity, `--header-scroll-progress` interpolates continuously 0 → 1 as you scroll.
- **Storefront `/en/shop`:** 8 products, all with MAIN-image previews served from `/api/media/file/*MAIN.jpg`, Ken Burns tween catches card 3 mid-animation at `matrix(1.0232, ..., 1.0232, 0, 0)`.
- **Storefront `/en/product/aloe-drink`:** h1="Aloe Peaches Drink", title "Aloe Peaches Drink — Copaia", 3 thumbs, JSON-LD `image` array length = 3, thumb #2 click Flip-morphs the main image to `AloeDrink1.jpg`.
- **Storefront cart:** add-to-cart press bounce verified at `scale 1.0212` mid-tween, button text "✓ Added", full click chain runs.
- **Admin `/admin` dashboard:** greeting "ערב טוב ירית 🌸", 5 stats + 3 empty-state recent-orders + 8 tiles.
- **Admin `/admin/collections/products`:** 8 rows with populated thumbnails, columns תמונות → שם המוצר → סוג מוצר → מחיר → קטגוריה → מצב פרסום.
- **Admin `/admin/collections/products/1`:** after PATCH to `type=stocked, stock=7`, stock field renders with `+1 / −1` pills, `+1` click bumps form value 7 → 8.

### Files touched (summary)

- **Brand text:** brand.config.ts, 2× i18n messages, Users.ts, adminTemplates.ts, BrandLogo.tsx, BrandIcon.tsx, payload.config.ts, emailAdapter.ts, ForgotPasswordForm.tsx, globals.css, product page, siteSettings.ts, seed.ts, checkout.ts, format.ts, fulfillment.ts, meshulam.ts, resend.ts, admin-brand.css, create-admin route, .env.example, .gitignore, reset-db.mjs, next.config.ts
- **Logo + catalog:** HeroMotion.tsx, public/brand/copaia.png (new), public/brand/ai/herobg3.jpg (new), public/brand/logo.png (deleted), public/brand/logo-parchment.jpg (deleted), 18 image files moved to ../assets/, 8 WhatsApp files deleted from ../assets/
- **Motion:** HeaderShrinkObserver.tsx, ProductCardMotion.tsx, AddToCartButton.tsx, Button.tsx, globals.css, Header.tsx
- **Admin UX:** ProductThumbnailCell.tsx (new), StockQuickAdjust.tsx (new), YaritDashboard.tsx, Products.ts, admin-brand.css, admin/importMap.js (auto-generated)
- **Docs current-state updates:** CLAUDE.md, AGENTS.md, README.md, BRAND.md, ARCHITECTURE.md, INDEX.md, FULFILLMENT.md, CONVENTIONS.md, ENVIRONMENT.md, ONBOARDING.md, YARIT-ADMIN-GUIDE.md, ADMIN-SURFACES.md
- **Docs new (Track F handoff):** DECISIONS.md (ADR-019 + ADR-020), FULFILLMENT.md (full rewrite to 4-state), YARIT-WELCOME-LETTER.md (new), NIR-HANDOFF.md (new, pending), NEXT-SESSION.md (TL;DR refresh), STATE.md (this entry), STATE-ARCHIVE.md (new — 1186 lines of historical entries)

### Final polish batch (after Track G)

- **MobileNav portal fix** (`f7fb0b8`) — clicking the hamburger on mobile was opening a "weird" 288×64 strip in the top-left instead of a full-screen slide-in. Root cause: the Header's `backdrop-blur-sm` (CSS `backdrop-filter`) creates a new containing block for `position: fixed` descendants in modern browsers, clamping the MobileNav dialog to the Header's bounds. Fixed by rendering the dialog via `React.createPortal` to `document.body` so it escapes the Header's subtree entirely. Verified: dialog is now 375×812 at `top: 0, left: 0`, parentElement is `BODY`, panel inside is full-height 288×812, nav area inside the panel is 287×748 with 4 nav links + language switcher + theme toggle + close X.

- **Track G cleanup** (`3d67cf9`) — dropped `@swc-node/register` + `@swc/core` devDeps (both dead weight from a rejected "standalone CLI seed script" experiment). Deleted 25 unused AI brand assets from `public/brand/ai/`: 7 Shoresh-era product watercolors (dropped with STATIC_IMAGE_OVERRIDES in Track A), 4 trust-bar `icon-*.jpg` JPEG variants (the `.png` versions are wired in TrustBar.tsx), 9 never-wired editorial photos (hero-still-life, hero-bg-wash, journal-hero, newsletter-*, yarit-portrait, sourcing-basket, ritual-steps, sprig-stamp, icons-trust-set, about-hands), and the `hero-bg-2.png` swap leftover. Also removed 2 dead CSS rules in `globals.css` that targeted `img[src*="hero-bg-wash"]`. Post-cleanup: `public/brand/ai/` now holds 19 files (5 category tiles + 4 trust-bar icon PNGs + 2 backdrops + 4 empty states + 2 utility + 1 about + 3 night-mode images).

- **ContactBG1.jpg** — user-provided watercolor eucalyptus + herbs backdrop for `/contact`. Moved to `public/brand/ai/`, wrapped the `ContactContent` in a `<section>` with an `absolute inset-0 -z-0` image layer + gradient fade top/bottom. Initial opacity was 0.18; bumped to **0.55** per user "make it stand out more" feedback so the eucalyptus framing reads as personality rather than just subtle texture.

- **Shop grid first-render stagger removed** — user reported the shop page products "jump around and aren't organized" on page load. Root cause: `ShopGridFlip`'s first-render entrance tween was `gsap.from({ y: 24, opacity: 0, stagger: 0.08, duration: 0.7 })` which applied the from-state immediately on mount then animated cards back in over ~1.3s, reading as chaotic reflow instead of a settled grid. Removed the `useGSAP` block entirely — cards now render at their natural position with no entrance tween. The filter-change Flip tween (T1.6) still plays for meaningful category filter transitions; only the decorative mount-time stagger is gone. Verified: all 8 cards at `opacity: 1, transform: none, top: 319/866` from first paint.

### Follow-up TODOs

- **Prod Neon catalog update** — still holds the old 7 products. Next session: Yarit rebuilds via admin OR one-off migration script.
- **Yarit's admin password** — Nir sets these out of band. The dev default `admin@copaia.example / admin1234` is local-only.
- **External inputs still pending** — Meshulam PDF, Resend API key, legal markdown (8 files), custom domain. None landed this session.
- **YARIT-ADMIN-GUIDE.md §2 + §3** still describe the pre-ADR-019 Forever workflow + `forever | independent` product type options. A prominent "out of date" banner was added at the top of the file pointing Yarit at the admin HelpButton for current instructions, but a full rewrite of those sections is still outstanding.
- **React dev-mode warnings** on `<script>` tags inside React components — pre-existing from `src/app/(storefront)/[locale]/layout.tsx:138` (themeBootstrap) + `src/app/(storefront)/[locale]/product/[slug]/page.tsx:187` (JSON-LD). Valid patterns, not regressions, but show up in `preview_console_logs` as errors.

---

## Previous (2026-04-11 night — Remove Forever terminology + collapse fulfillment workflow)

**Commit `8d50bd4`** (fast-forward merged to `main`) + prod DB migration shipped back-to-back
with the T2.9 ship earlier in the same session. **Production is now at `8d50bd4`** via
`dpl_EFBBXQ1ZKxrDe2T7ZJTcQTBsJzui` and the Neon DB has been migrated in-place to the new
enum values. See ADR-019 for the decision record.

### What shipped

Yarit's explicit ask after reviewing the admin panel following T2.9: "why does the system split
orders between Forever and independent products when in practice I handle everything myself?
When a customer orders, it should just show up as an order." This session collapsed the dual
workflow and removed every admin-visible "Forever" reference.

**Schema (4 files):**
- `Products.type` enum: `forever|independent` → `sourced|stocked`. `sourced` = order from
  supplier on demand (no stock tracking); `stocked` = kept in Yarit's house (stock field
  active). Default changed from `forever` → `stocked` because a new product is most likely
  something she's bringing in-house. Labels in Hebrew: "קיים במלאי" / "לפי הזמנה מהספק".
- `Products` collection: `foreverProductCode` and `foreverDistributorPrice` fields dropped
  entirely (nothing read them — seed-script supplier codes now populate the existing `sku`
  field). `sku` and `weightGrams` no longer gated on `type`, they always render.
- `Orders.fulfillmentStatus`: dropped `awaiting_forever_purchase` and `forever_purchased`. New
  state machine is `pending → packed → shipped → delivered` (4 states, not 6). Every paid
  order starts at `packed` regardless of whether any line items came from a supplier.
- `Orders.items.productType` options renamed with bilingual labels (same two values as
  Products.type).
- `SiteSettings.forever` distributor-metadata group: removed entirely (dead code, never read
  by any runtime path).

**Business logic (6 files):**
- `lib/checkout.ts`: every paid order's initial `fulfillmentStatus` is hardcoded to `packed`
  (the old `hasForever` branch that routed through `awaiting_forever_purchase` is gone).
  Stock decrement gate: `type === 'stocked'`.
- `lib/admin/fulfillment.ts`: `FulfillmentBuckets` has 3 buckets (`readyToPack`, `shipped`,
  `delivered`) instead of 5 (`awaitingForever`, `foreverPurchased`, `readyToPack`, `shipped`,
  `delivered`). `readyToPack` now includes both `pending` and `packed` rows for robustness.
- `lib/orders/statusLabels.ts`: dropped the 2 Forever enum values, merged
  `FULFILLMENT_STEPS_BASE` and `FULFILLMENT_STEPS_FOREVER` into one `FULFILLMENT_STEPS`,
  dropped the `hasForever` parameter everywhere. Customer-side collapse helpers
  (`getCustomerStepFor`, `CUSTOMER_FULFILLMENT_STEPS`) retained the same 4 customer-visible
  buckets so `OrderTimeline` renders identically.
- `lib/cart/store.ts`: `CartItem.type` renamed. Bumps Zustand persist version to v2 with a
  `migrate` function that maps old localStorage values (`forever`/`independent`) to the new
  enum for returning customers with stale carts.
- `lib/email/adminTemplates.ts`: dropped the `hasForever` flag, the "⚠️ כולל פריטי Forever"
  warning banner, and the `[Forever]` inline item tag. Template data type updated.
- `lib/product-image.ts`: renamed 2 static-override image paths
  (`ForeverBeepropolis.jpg` → `BeePropolis.jpg`, `ForeverDaily.jpg` → `DailyMultivitamin.jpg`)
  and dropped dead `forever-*` drift aliases.

**Admin UI (3 files):**
- `OrderRow.tsx`: dropped the "🌿 פוראבר" pill, the per-item dot-coloring switch between
  `forever` (accent) and `independent` (primary), and the 2 Forever branches of `nextStatus`.
  Every order advances through the same single path.
- `FulfillmentView.tsx`: dropped 2 stat tiles + 2 bucket sections. The urgent bucket is now
  "לטיפול — להכין ולשלוח" (handle + ship) instead of "לטיפול דחוף — להזמין מפוראבר".
- `YaritDashboard.tsx`: dropped the duplicate "לטיפול דחוף" stat tile that showed the
  `awaitingForever` count. The `lowStock` query now filters on `type === 'stocked'` instead
  of `'independent'`.

**Customer-facing (7 touches):**
- `ProductCard.tsx`, `OrderList.tsx`, `OrderTimeline.tsx` (comment), `product/[slug]/page.tsx`,
  `account/orders/[id]/page.tsx`, `shop/page.tsx` (comment), homepage `page.tsx` (comment),
  `Badge.tsx` (comment) — all type references + stale comments updated. Nothing visually
  changes for customers; they never saw `type` anyway.

**Assets:**
- `public/brand/ai/ForeverBeepropolis.jpg` → `BeePropolis.jpg`
- `public/brand/ai/ForeverDaily.jpg` → `DailyMultivitamin.jpg`
- `public/brand/ai/forever-spotlight-bg.jpg`: deleted (only referenced from a docs note; the
  ForeverSpotlight section was removed during ADR-015 rebrand)

**Docs:**
- `CLAUDE.md`: business-model section rewritten to describe `stocked/sourced` without Forever
  (Yarit's factual supplier relationship is still real, just not exposed in the schema).
  Rule #6 updated. File-lookup-table row says "fulfillment workflow" instead of "Forever
  fulfillment workflow".
- `docs/BRAND.md`: dropped the `forever-spotlight-bg.jpg` entry.

### Seed

`src/lib/seed.ts`:
- Renamed `FOREVER_PRODUCTS` → `SOURCED_PRODUCTS` and `INDEPENDENT_PRODUCTS` → `STOCKED_PRODUCTS`.
- Each product entry's `foreverProductCode: '022'` (etc) is now `supplierCode: '022'`, passed
  into the existing `sku` field during create (previously passed into the dropped
  `foreverProductCode` field).
- SiteSettings create call no longer passes a `forever` group (the field is gone).

### Prod DB migration

Neon Postgres was migrated in-place via a single-transaction SQL script (run from a local
Node script using the Vercel-pulled `DATABASE_URI`). The approach: Postgres enums are
immutable, so renaming a value in place isn't possible. Instead, for each enum column we
`RENAME` the existing enum type to `_old`, `CREATE` the new enum type with the new values,
`ALTER TABLE ... ALTER COLUMN ... TYPE new_enum USING (CASE ... END)` to map every row's
value atomically, then `DROP TYPE _old`. Wrapped in a transaction so the whole thing is
atomic.

State before migration:
- `products.type = 'forever'`: 7 rows (all 7 canonical seed products)
- `orders`: empty (0 rows)
- `orders_items`: empty (0 rows)
- `enum_products_type` values: forever, independent
- `enum_orders_fulfillment_status` values: pending, awaiting_forever_purchase,
  forever_purchased, packed, shipped, delivered
- `enum_orders_items_product_type` values: forever, independent
- Deprecated columns present: `products.forever_product_code`,
  `products.forever_distributor_price`, `site_settings.forever_distributor_name`,
  `site_settings.forever_distributor_id`

State after migration (verified):
- `products.type = 'sourced'`: 7 rows (all 7 canonical products)
- `orders`, `orders_items`: still empty
- `enum_products_type` values now: sourced, stocked
- `enum_orders_fulfillment_status` values now: pending, packed, shipped, delivered
- `enum_orders_items_product_type` values now: sourced, stocked
- All 4 deprecated columns dropped

The 7 products all landed in `sourced` (not `stocked`) because prod had never been manually
edited — the seed set them all to `'forever'`, which maps to `'sourced'` under the new enum.
Yarit can flip any individual product to `'stocked'` from the admin if she starts inventorying
it at home.

### Quality gates

- `npx tsc --noEmit` → 0 errors
- `npm run lint` → 0 errors, 0 warnings
- `npm run build` → 40 routes, all `ƒ`/`○`, zero `●` SSG

### Local smoke test (prod build + migrated dev DB)

- Storefront `/en` + `/en/shop` + `/en/product/*` → 200. 7 products render. No `ForeverBeepropolis`
  / `ForeverDaily` references in HTML.
- API `/api/products` → 7 products, all `type: 'sourced' | 'stocked'`, no `foreverProductCode`
  or `foreverDistributorPrice` fields in response.
- Admin dashboard → 5 stat tiles (removed the duplicate "לטיפול דחוף" tile), HelpButton still
  works, no `פוראבר` / `Forever` text.
- Admin product edit form (id=1) → "סוג מוצר" dropdown visible with the new "קיים במלאי" +
  "לפי הזמנה מהספק" options. Body text contains neither `forever` nor `פוראבר`.
- Admin fulfillment dashboard → new "להכין ולשלוח" bucket, no Forever buckets, empty state
  renders.
- Admin orders / categories / users / site-settings → all 200.
- The only "forever" substring left in the admin HTML is Payload's i18n key `updateForEveryone`
  (false positive — Payload's own library code).

### Prod smoke test (live yarit-shop.vercel.app after deploy)

- `https://yarit-shop.vercel.app/en?cb=...` → 200. 5 category cards, 3 featured cards,
  3 testimonial cards, no Forever image URLs, no `פוראבר`/`Forever` in HTML.
- `https://yarit-shop.vercel.app/en/shop?cb=...` → 200. 7 unique product slugs, no stray
  references.
- `https://yarit-shop.vercel.app/api/products?limit=20&depth=0` → 200, 7 products, all with
  `type: "sourced"`, zero `foreverProductCode` / `foreverDistributorPrice` fields.

### Files touched (26)

**Schema + globals:**
- `src/collections/Products.ts`
- `src/collections/Orders.ts`
- `src/globals/SiteSettings.ts`

**Lib:**
- `src/lib/orders/statusLabels.ts`
- `src/lib/checkout.ts`
- `src/lib/admin/fulfillment.ts`
- `src/lib/cart/store.ts`
- `src/lib/email/adminTemplates.ts`
- `src/lib/product-image.ts`
- `src/lib/seed.ts`

**Admin components:**
- `src/components/admin/OrderRow.tsx`
- `src/components/admin/payload/FulfillmentView.tsx`
- `src/components/admin/payload/YaritDashboard.tsx`

**Customer-facing components + pages:**
- `src/components/product/ProductCard.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/account/OrderList.tsx`
- `src/components/account/OrderTimeline.tsx`
- `src/app/(storefront)/[locale]/page.tsx`
- `src/app/(storefront)/[locale]/shop/page.tsx`
- `src/app/(storefront)/[locale]/product/[slug]/page.tsx`
- `src/app/(storefront)/[locale]/account/orders/[id]/page.tsx`

**Assets:**
- `public/brand/ai/ForeverBeepropolis.jpg` → renamed to `BeePropolis.jpg`
- `public/brand/ai/ForeverDaily.jpg` → renamed to `DailyMultivitamin.jpg`
- `public/brand/ai/forever-spotlight-bg.jpg` → deleted

**Docs:**
- `CLAUDE.md`
- `docs/BRAND.md`

### Follow-up TODOs

- **docs/DECISIONS.md ADR-019**: this session references ADR-019 from multiple new comments,
  but the actual ADR entry hasn't been written into docs/DECISIONS.md yet. Next session
  should add a short ADR-019 section describing the "Forever removal + fulfillment collapse"
  decision with date, status, context, decision, consequences.
- **docs/FULFILLMENT.md**: still describes the old 6-state workflow with the 2 Forever states.
  Small update needed to reflect the 4-state flow.
- **docs/YARIT-ADMIN-GUIDE.md**: references "סוג מוצר" vocabulary — should be spot-checked for
  any stale Forever wording. Most of it is product-agnostic so likely fine.

---

## Earlier entries — archived

Everything from the previous "Earlier" sections (T2.9 homepage storytelling, QA pass, motion hotfix, close-out deploy, GSAP Tier-1, Phases A–F.1, ADR summaries, design uplift, changelog) has been moved to [`docs/STATE-ARCHIVE.md`](./STATE-ARCHIVE.md) to keep this file scannable for newer sessions. Every historical entry is preserved verbatim there.
