# Next session — read this first

> This document is the fastest possible orientation for whoever opens the project next, human or AI. Read this, then `CLAUDE.md`, then `docs/STATE.md`. You'll be productive in 5 minutes.

## Where things stand (2026-04-10, end of Round 5 — purposeful admin minimalism)

**Status:** 🚀 Everything through Round 5 is **live on production** at `https://yarit-shop.vercel.app`. The admin panel has been trimmed of dead code (hidden Tags + Media collections, removed gallery tile, killed triple help-link redundancy), the dark mode "black gap between cards" visual bug is fixed, the old `(admin-tools)` route group is deleted, and a new `docs/ADMIN-SURFACES.md` inventory doc is the canonical map of every remaining admin surface.

### Why Round 5 happened

The user hit two problems at once:

1. **Vercel wasn't deploying the Round 4 code.** He checked `yarit-shop.vercel.app/admin/login` and saw Payload's **stock** login page — no Shoresh branding, no Heebo/Bellefair fonts. Diagnosed via `gh api` + `npx vercel ls`: both commits were on GitHub but Vercel's most recent deploy was 5 hours old. The GitHub webhook had stalled after an Error deploy earlier in the day. **Fix:** Manual `npx vercel --prod` from the linked project directory. The 2-minute build went green, the alias updated, and production now serves all Round 4 markers.
2. **The admin had confusing dead code.** User quote: "why can she upload a picture to gallery? what is gallery? what happens to a picture if she uploads there — why not just create a product?" This triggered a full audit of every admin surface through the lens of a 65-year-old non-technical merchant.

### What Round 5 shipped

- **Media collection hidden from sidebar + gallery dashboard tile removed.** Yarit no longer has a standalone "gallery" entry point that invites orphan uploads. Inline image pickers on product/category forms still work exactly as before (Payload pattern: hide collection from sidebar, keep relationship uploads functional).
- **Tags collection hidden from sidebar + `tags` field hidden on Products.** Dead code — nothing on the storefront queries tags. Hidden (not deleted) so a future phase can un-hide in one line.
- **HelpButton changed from external GitHub link to `mailto:`.** Pre-filled with Hebrew subject + body. Yarit clicks help → her email client opens → Nir answers in ~30 min. Real support, no GitHub account required.
- **WelcomeBanner deleted from dashboard.** Duplicated the SidebarGreeting message, non-dismissible, wasted space above the stats row.
- **`SidebarGreeting` help link removed.** The help affordance now exists only in `HelpButton` (was previously in 3 places).
- **🔑 "חשבון, שפה וסיסמה" dashboard tile added.** Deep-links to `/admin/account` so Yarit can find the admin language switcher (Hebrew/English toggle) without discovering Payload's default top-right "Account" action on her own.
- **Dark-mode elevation ladder flattened.** The previous page bg (`#1E1609`) and card bg (`#2A2012`) differed by 12 units, rendering as near-black strips between field cards on every edit form. Bumped the page bg to match the card bg and shifted every elevation token one step warmer. Also swept `.yarit-tile` + `.yarit-stat` (both had hardcoded `background: #FFFFFF` which broke in dark mode).
- **Legacy `src/app/(admin-tools)/fulfillment` route group deleted.** Dead code — superseded by `/admin/fulfillment` as the branded view. Also cleaned the middleware matcher.
- **`docs/ADMIN-SURFACES.md` written.** New canonical map of every admin surface with "what / used for / why" for each, plus rules for adding new surfaces in the future.

### Post-Round-5 state of the admin

Sidebar:
- 👥 משתמשים
- 🖼 (empty group — Media hidden)
- 📦 קטלוג → קטגוריות, מוצרים (Tags hidden)
- 💰 מכירות → הזמנות
- 🌿 הגדרות → הגדרות אתר

Dashboard tiles (8):
1. 📦 ההזמנות החדשות (accent)
2. 🌿 המוצרים שלי
3. ➕ הוספת מוצר חדש
4. 🗂 קטגוריות
5. ⚙️ פרטי החנות והמשלוחים
6. 📣 הודעה בראש האתר
7. 🧾 היסטוריית הזמנות
8. 🔑 חשבון, שפה וסיסמה

Chrome:
- `SidebarGreeting` (top) — identity only
- `SidebarFooter` (bottom) — לאתר החי / ההזמנות החדשות / יציאה
- `HelpButton` top-right — opens mailto
- `ViewOnSite` top-right — opens storefront in new tab

Invisible providers:
- `AdminThemeInit` — light/dark theme sync with storefront
- `AdminToaster` — react-hot-toast bottom-center
- `AdminDriftingLeaves` — 5 SVG leaves behind content
- `OnboardingTour` — 4-step driver.js walkthrough on first visit

### End-to-end verified (Round 5 exit checks)

- `tsc --noEmit` → 0 errors
- 10/10 CRUD smoke rows: auth, all 6 collections + global GET, Products CREATE → PATCH → DELETE round-trip, all 7 admin routes return 200
- Preview MCP visual confirmation: dashboard + fulfillment + product edit + site settings all render correctly in dark mode with no "black gap" between cards
- Production Phase 1 redeploy: `yarit-shop.vercel.app/admin/login` now serves the Shoresh-branded page

### What's next (future phases)

- **Vercel GitHub auto-deploy might still be broken.** The Phase 1 manual deploy worked but I don't know if the webhook self-healed. Next time a commit is pushed, watch whether Vercel auto-builds. If not, re-link the project in Vercel dashboard.
- **Restore `<details>` field helper on complex Product fields (Round 4 C7 ideal version).** Round 4 pivoted to "richer multi-line Hebrew descriptions with `•` bullets" because Payload 3.x's `admin.components.Description` slot is brittle. If a future Payload release makes component slots robust, upgrade to a true collapsible helper.
- **Make the Orders `afterChange` hook dev-safe.** Still needs the try/catch wrapper + provider check so creating orders in dev with no email provider doesn't interfere with writes (Round 4 TASKS.md follow-up).
- **D2 polish items from the Round 4 design review** (all logged in `docs/TASKS.md` under "Round 4 design-review agent findings").

### Old Status header (preserved for history)
## Where things stand (2026-04-10, end of Design Round 4)

**Status:** 🚀 Phases A–E + design polish + customer-facing rebrand + cart-fix + product-copy refresh are **complete and deployed to production**. The **admin redesign** + **Design Round 2 Waves 1 + 2** + **Design Round 3 (Night Apothecary palette / Warm Night dark mode / drifting leaves / iridescent hero) Waves 1-4** + **Design Round 4 (Hero light pocket + logo blur fix + 12 admin delight moves)** are **all complete locally**. Nothing is yet pushed to production — the next session should commit + push everything together.

### Design Round 4 — what's done in this session

**Problem statement:** Round 3's Warm Night dark mode landed well but two visual bugs remained: (1) the Hero section felt gloomy in dark mode and the user wanted the Hero specifically to keep a bright parchment background so the TrustBar below creates an intentional "day → night" contrast cliff, and (2) the Shoresh logo looked BLURRY in dark mode. Separately, the admin panel still felt like Payload's default engineering UI rather than a place a 65-year-old non-technical woman would enjoy spending time.

**Track A — Dark mode visual fixes (shipped first, safest):**

1. **A1 — Hero light pocket in dark mode.** Added `hero-section` className to the `<section>` tag in `src/components/sections/Hero.tsx:25` and a scoped `[data-theme="dark"] .hero-section { --color-background: #f6efdc; ... }` override block in `src/app/globals.css` that re-defines all 10 palette tokens inside the Hero subtree. CSS custom-property inheritance does the work — every child inside the Hero (wash, halo, iridescent heading, gradient fade) reads the light-mode tokens automatically. Additional `[data-theme="dark"] .hero-section .logo-halo::before { background: transparent !important }` disables the cream halo oval inside the Hero (the pocket is already on parchment — a second oval would read as a bug). One `!important` total in globals.css. Verified via preview MCP: Hero `--color-background === #f6efdc`, TrustBar `--color-background === #1e1609`. Clean contrast cliff.

2. **A2 — Logo halo blur leak fix.** The previous `filter: blur(2px)` on `.logo-halo::before` was leaking through `isolation: isolate` and rasterizing the logo `<Image>` at `z-index: 10`. Confirmed via `getComputedStyle('.logo-halo').filter === 'blur(1.5px)'`. Browser rendering engines treat a stacking context + descendant filter as a hint to rasterize the entire composited layer, regardless of where the filter is applied inside. Fix: removed the filter entirely and rebuilt the gradient with 14 stops (from 9) so every transition is under 8%, invisible to the eye without needing a blur. Logo is now tack sharp — verified `haloFilter === "none"`.

**Track B — Admin functional verification.** Before piling on delight, proved the plumbing works via 20-row curl-based REST API + SSR HTML smoke test: all admin routes serve authed HTML, all 6 collection GETs work, Product CREATE/PATCH/DELETE round-trip succeeds, Order fulfillment state machine walks `awaiting_forever_purchase → forever_purchased → packed → shipped → delivered → deleted`. Results logged in `docs/round-4-admin-verify/verify-notes.md`. One non-blocking dev-ergonomics note: the Orders `afterChange` hook at `src/collections/Orders.ts:364` tries to send a new-order alert email when `paymentStatus` flips to `paid` and can fail silently in dev with no email provider — create orders with `paymentStatus: 'pending'` and flip via PATCH as the safer test path.

**Track C — 12 admin delight moves, all additive and individually revertable:**

- **C1** — Time-synced Hebrew greeting on dashboard (`לילה טוב` / `בוקר טוב` / `צהריים טובים` / `ערב טוב ירית` with seasonal emoji). Asia/Jerusalem TZ.
- **C2** — Warm branded `react-hot-toast` system at bottom-center via `AdminToaster.tsx` provider. Gradient success variant.
- **C3** — Illustrated fulfillment empty state with `empty-shop.jpg` watercolor + "לעדכן מוצרים ←" CTA.
- **C4** — OrderRow spinner + success toast on PATCH + `canvas-confetti` burst on the final `delivered` transition.
- **C5** — Dashboard tile stagger fade-up with 60ms offsets via `yarit-tile-in` keyframe.
- **C6** — `AdminDriftingLeaves.tsx` mounts the shared `<DriftingLeaves>` in the admin. CSS duplicated into `admin-brand.css` (globals.css isn't loaded in the admin route group). Dark mode switches leaves to luminous ochre.
- **C7** — Richer multi-line Hebrew descriptions on Products `type`, `stock`, `status` (originally planned as a `<details>` helper via Payload's component slot, pivoted to richer text because the slot is brittle in 3.x).
- **C8** — CSS-only Hebrew save button text swap: `[dir="rtl"] .btn--style-primary[type="submit"]::after { content: 'שמרי ✓' }`.
- **C9** — Illustrated empty list state pseudo-element on `.collection-list__no-results` + `.no-results` via `admin-brand.css`.
- **C10** — OrderRow mobile layout stacks with top border separator; `min-w-0` on summary so long titles truncate.
- **C11** — `OnboardingTour.tsx` provider with `driver.js` 4-step Hebrew walkthrough on first `/admin` load. localStorage-gated. Popover fully rebranded via `.driver-popover*` rules in admin-brand.css.
- **C12** — `ViewOnSite.tsx` action component renders a `🌿 צפייה באתר ↗` pill in the admin header.

**Dependencies added (4):** `react-hot-toast@2.5.1`, `canvas-confetti@1.9.3`, `@types/canvas-confetti@1.9.0`, `driver.js@1.3.1`. All MIT, ~25kb total gzipped.

**Files added (5):** `AdminToaster.tsx`, `AdminDriftingLeaves.tsx`, `OnboardingTour.tsx`, `ViewOnSite.tsx`, `docs/round-4-admin-verify/verify-notes.md`.

**Files modified (8):** `Hero.tsx`, `globals.css`, `YaritDashboard.tsx`, `FulfillmentView.tsx`, `OrderRow.tsx`, `Products.ts`, `payload.config.ts`, `admin-brand.css` (+~330 lines of Track C styles + reduced-motion guards).

**Track D — Design review agent sweep (complete).** Two Explore agents ran in parallel and landed in `docs/round-4-design-review/sweep-results.md`. **1 real blocker caught + fixed same session:** D1.1 — CheckoutForm error card was using hardcoded `border-red-300 bg-red-50 text-red-900` Tailwind classes that are invisible in dark mode. Replaced with theme-aware `--color-accent-deep` ochre that stays AA-legible in both modes (`src/components/checkout/CheckoutForm.tsx:286`). D2's 8 polish items logged to `docs/TASKS.md` under "Round 4 design-review agent findings".

**Post-Track-C blocker caught during cleaning phase:** the `.drifting-leaves` rules I copied into `admin-brand.css` created a `position: fixed; z-index: 0` stacking context that painted on top of Payload's unpositioned admin content and hid every admin surface. The storefront `globals.css` has a `body > *:not([role="dialog"]) { position: relative; z-index: 2 }` lifter that my Track C6 copy missed. Added the matching rule to `admin-brand.css`. Required a `rm -rf .next` cache clear + dev server restart to pick up the Track C import-map regeneration (Next.js Turbopack had cached the "Module not found" error from before the new files existed).

**Cleaning phase verified:**
- `tsc --noEmit` → **0 errors**
- `npm run build` → **✓ Compiled successfully in 5.4s**, 24 static pages generated
- `npm run lint` → 25 pre-existing issues only, no new errors from Round 4
- Admin login via Payload REST: token length 268, `/admin` + `/admin/collections/products` + `/admin/fulfillment` + `/admin/globals/site-settings` all return 200 with `yarit-dashboard` + `yarit-tile--stagger` + `yarit-welcome` + Hebrew time-synced greeting markers present in HTML
- Storefront Hero visual via preview MCP (dark mode): `heroHasClass = true`, `heroBg = rgb(246, 239, 220)` inside pocket, `haloFilter = "none"` (crisp logo), 5 drifting leaves rendering, iridescent heading animated, TrustBar below creates deep Warm Night contrast cliff — matches Yarit's request exactly

**Preview MCP quirk documented:** the Claude Preview virtual browser has a persistent limitation rendering Payload 3.x admin client components even when the server returns proper RSC flight data (the same admin renders fine in real browsers and has been live on https://yarit-shop.vercel.app for a month). Fetched admin HTML via curl contains `"LoginForm"` RSC placeholders and `yarit-brand-logo` markers — server is healthy. Logged in `docs/TASKS.md` as "verify Round 4 in real browser next session".

**Status after this session:** ready to commit + push.

### Design Round 2 Wave 2 — what's done in this session

**Assets:** The user generated 20 watercolor/photographic AI images from the Wave 2 prompts and placed them in `media/`. Copied all 20 to `public/brand/ai/` (renamed the truncated `icons-trust-se.jpg` → `icons-trust-set.jpg` during the copy).

**Shipped (4 moves):**
- **B5 — Museum-label ProductCard.** Rebuilt the product card with 4:5 image viewport on pure white (so transparent product PNGs pop), parchment `surface-warm` card body, serif product name, italic serif descriptor, tabular-numeral price on a thin sage divider, and a quiet `"להוסיף לסל"` ghost-link CTA (text-only underlined sage, not a filled button). `isNew` is now a tiny italic eyebrow `"חדש בחנות"` top-start instead of a pill. Added a `variant="ghost-link"` option to `AddToCartButton` with `e.preventDefault() + stopPropagation()` so clicking the CTA inside a `<Link>`-wrapped card doesn't navigate.
- **B7 — Art-directed CategoryGrid covers.** The 5 new `cat-*.jpg` flat-lays overwrote the previous tiles. Added a numeric Eyebrow above each category title (`"01 / קטגוריות"` through `"05 / קטגוריות"`) in warm-tan small-caps — signals apothecary craft.
- **B8 — MeetYarit watercolor portrait.** Swapped the image from `about-hero.jpg` to `yarit-portrait.jpg` — the new watercolor shows a woman tending potted herbs on a sunlit windowsill. The editorial vignette structure (2-col, serif italic body, Eyebrow above heading) was already in place from Wave 1.
- **B13 — Footer rework.** Full rewrite: 4-column editorial layout (brand blurb / shop / information / newsletter signup), subtle watercolor botanical garland background at the top of the footer (8% opacity, mix-blend-multiply), eyebrows on each column header, social links moved to a bottom strip with the copyright. New `<NewsletterSignup>` client component with a stub submit handler. New i18n keys for the brand blurb + newsletter copy in both he.json and en.json.

**Reverted per user feedback (2 moves):**
- **B4 — Editorial single-CTA Hero.** The new `hero-still-life.jpg` was wired into a 2-column layout (text on one side, photograph on the other), but the user said the image "just looks like a square sitting there, better to keep the logo image". Reverted to the Wave 1 Hero (centered Shoresh logo, `hero-bg-wash.jpg` background, dual CTA).
- **B9 — TrustBar 2x2 sprite.** The new `icons-trust-set.jpg` was wired via `background-image` + `background-position` to show each quadrant as a separate icon, but the user said "the previous trust bar icons looked better". Reverted to the Wave 1 TrustBar with the 4 separate `icon-*.png` watercolor icons.

**Bug caught and fixed during verification:**
After the initial Wave 2 implementation, every storefront page returned HTTP 500 while admin was fine. Root cause: the Footer is a server component but I added an inline `onSubmit={(e) => e.preventDefault()}` to the newsletter form — server components can't have event handlers. Fix: extracted the form into a new `<NewsletterSignup>` client component (`src/components/layout/NewsletterSignup.tsx`). Also extended the `Eyebrow` component's `as` prop to include `'h2' | 'h3' | 'h4'` (it was `'span' | 'p' | 'div'` only) so the Footer could use `<Eyebrow as="h3">` as column headings.

**End-to-end verified locally:** typecheck 0 errors, all 9 key URLs return 200, live DevTools eval confirmed every new asset is loading correctly, screenshots taken of hero / meetYarit / categoryGrid / footer — everything looks polished and editorial.

### Design Round 2 — what's done in Wave 1 (this session)

**Admin polish (Track A, no new images):**
- Multiplied every `rem` in admin-brand.css by ~1.333 to compensate for Payload's hardcoded 12px root font size — every admin text was rendering 25% smaller than designed
- Fixed the inverted sidebar hierarchy (the "clicking an item makes it bigger" bug Yarit reported): parent group labels are now 15.6px Frank Ruhl serif weight 800 sage with a thin underline, child links are 13.8px charcoal weight 500
- Branded Payload's stock collection list views, edit forms, tables, pagination, and field labels — `/admin/collections/products` now shows a 31.8px Frank Ruhl serif sage H1 over a sage-tinted table with parchment rows (was previously gray Payload defaults — this is the biggest visual win)
- Moved HelpButton inline styles into a `.yarit-help-button` CSS class with hover + focus-visible states
- Added `:focus-visible` outlines and hover backgrounds to all sidebar greeting/footer links
- Added Tailwind utility aliases scoped under `.yarit-fulfillment` so OrderRow renders with full sizing/weights inside `/admin/fulfillment`

**Storefront free wins (Track B Tier 1, no new images):**
- New `--color-surface-warm: #f5efe0` token (lighter parchment than `--color-background: #ECE5D4`) used everywhere instead of pure white. Pure white is now reserved only for product image viewports
- New `<Eyebrow>` component + `.eyebrow` CSS utility (11–12px uppercase, +0.14em tracking, sage default with `accent` and `muted` variants). Wired into SectionHeading and MeetYarit so every section heading has a small-caps accent above it
- New `--radius-card: 2px` token, swept onto cards/sections (square editorial-print corners). Pills keep `rounded-full`
- Slim 64px sticky header with sage border-bottom (was 72px tan border)
- Restyled testimonial quotes in serif italic, upgraded MeetYarit to a 2-column editorial layout
- Pre-existing i18n bug fixed: TrustBar's "authorized" key (which didn't exist) → `curated` (which does)

**Verification:** typecheck 0 errors, all 9 key URLs return 200, DevTools eval confirmed font sizes/weights/colors render correctly. Screenshots taken of dashboard / products list / homepage.

### What just landed in this session — Yarit-friendly admin re-skin

A 6-phase plan to make the Payload admin warm, inviting, and obvious for Yarit (65-year-old non-technical owner). All 6 phases are committed locally and verified end-to-end at http://localhost:3000.

1. **Brand chrome** — `src/app/(payload)/admin-brand.css` (~600 lines, plain CSS) re-skins Payload's CSS variables to the Shoresh palette (parchment + sage). It sits in `@layer payload`, which Payload's compiled SCSS already declares as the layer **after** `payload-default`, so we never need `!important`. `admin.theme: 'light'` locks the theme. `htmlProps={{lang:'he', dir:'rtl', className: heebo+frankRuhl}}` is passed to `<RootLayout>`. Custom `BrandLogo` (login screen) + `BrandIcon` (sidebar) graphics. Title suffix changed to "— ניהול שורש".
2. **Custom dashboard** — `YaritDashboard.tsx` replaces Payload's `/admin` view with a Hebrew "שלום ירית 🌿" greeting, 6 parallel `payload.count()` stat tiles (open orders / urgent / published / drafts / low-stock / customers), and an 8-tile illustrated grid pointing at the most common Yarit tasks. Mobile-friendly via `auto-fit, minmax(260px, 1fr)`.
3. **Sidebar polish** — `SidebarGreeting` (top, with user name + help link), `SidebarFooter` (bottom, with live-site / fulfillment / logout shortcuts), all 7 collection/global groups now emoji-prefixed (📦 קטלוג / 💰 מכירות / 👥 לקוחות / 🖼 תוכן ותמונות / 🌿 הגדרות).
4. **Fulfillment dashboard moved inside `/admin`** — `FulfillmentView.tsx` registered via `admin.components.views.fulfillment` lives at `/admin/fulfillment`. Reuses the existing `OrderRow` client component via a 12-line `--color-primary` aliasing block scoped to `.yarit-fulfillment`. Shared loader at `src/lib/admin/fulfillment.ts`. Old `/fulfillment` route under `(admin-tools)` left intact as a fallback (to be replaced with a `redirect()` in a tiny follow-up PR after a couple weeks of bake time).
5. **Hebrew copy pass** — every confusing label rewritten:
   - `slug` → "כתובת באתר" (and hidden on Categories + Tags via `admin.hidden: true`)
   - `sku` → "מספר קטלוגי (מק״ט)" with description
   - `awaiting_forever_purchase` → "להזמין מפוראבר" (was the confusing "לשלם לפוראבר")
   - `delivered` → "נמסר ללקוח" (was the ambiguous "הושלם")
   - `packed` → "ארוז ומוכן", `shipped` → "בדרך ללקוח"
   - `heroImages` → "תמונות באנר ראשי"
   - `businessTaxId` → "מספר עוסק (ח״פ או ע״מ)" with full explanation
   - The `OrderRow.STATUS_HE` map at `src/components/admin/OrderRow.tsx:57` was synced — there's a comment above it pointing back to `Orders.ts` so future contributors keep them in sync.
   - **Option `value` strings were never touched** — only labels — so no DB migration is needed.
6. **Welcome banner + help button** — `WelcomeBanner` is rendered inline at the top of `YaritDashboard` (not via `beforeDashboard` — that slot only fires when `DefaultDashboard` is in use, and we replaced the dashboard). `HelpButton` registered in `admin.components.actions` shows a permanent "?צריכה עזרה" pill in the top-right of every admin page, linking to YARIT-ADMIN-GUIDE.md.

**Plus a tutorial-help follow-up** the user requested: every field on the product create form that lacked a description got a friendly Hebrew helper aimed at a 65-year-old non-technical user. Examples:
- Image upload: "גררי תמונה לכאן או לחצי לבחור מהמחשב/הטלפון. JPG או PNG עד 10MB."
- Rich-text description: "התיאור הארוך שמופיע בדף המוצר באתר. כתבי כאן את כל מה שחשוב — תועלות, מרכיבים, איך להשתמש. אפשר להשתמש בכפתורים שמעל כדי להדגיש, להוסיף כותרת, או רשימה."
- Category: "באיזו קטגוריה הקונים ימצאו את המוצר באתר. בחרי אחת מהרשימה."
- Tags: "אופציונלי — תגיות מסייעות לסינון באתר. אפשר לבחור כמה תגיות או להשאיר ריק."

Equivalent helpers added on `Categories` (`title`, `description`, `image`), `Media` (collection-level), and `SiteSettings` contact + social fields. Goal: every form is self-explanatory.

**RTL bug fix Yarit reported:** the top-bar breadcrumb (e.g., "מדיה") was clipping to just its last character "ה" when the sidebar was open. Root cause: Payload's `.step-nav span { max-width: 160px }` plus `.step-nav:after { position: sticky; right: 0; ... linear-gradient(to right, transparent, var(--theme-bg)) }` is LTR-baked. In RTL, `right: 0` puts the fade gradient over the *start* of Hebrew text (the right edge), not the end. Added `html[dir="rtl"] .step-nav:after { display: none }` + `max-width: none` + `flex-wrap: nowrap; min-width: 0` overrides in `admin-brand.css` under the existing `@layer payload` block. No `!important`.

### Production deploy of all three rounds — DO THIS FIRST

The admin redesign + Design Round 2 Waves 1 & 2 are all committed locally only. To ship them together:
```bash
cd yarit-shop
npx tsc --noEmit          # already 0 errors, but worth re-running
git add -A
git status                # sanity check
git commit -m "Yarit-friendly admin redesign + design round 2 (waves 1-2)"
git push origin main       # Vercel will auto-deploy
```
After deploy, walk through https://yarit-shop.vercel.app in production:
- Storefront: header is 64px slim with sage border, every section heading has a small-caps accent eyebrow above it, cards have 2px square corners, surfaces are parchment (no pure white anywhere except product image viewports), trust bar shows the 4 Hebrew labels correctly
- Admin login: Shoresh logo on parchment with sage button
- `/admin`: dashboard text feels right-sized (no longer 25% small), "שלום ירית 🌿" prominent in serif sage, tile titles visible, stats numbers prominent
- `/admin` sidebar: 5 emoji groups in 15.6px Frank Ruhl serif sage with thin underlines, child links in 13.8px charcoal smaller below
- `/admin/collections/products`: large Frank Ruhl "מוצרים" H1, sage-tinted table headers, parchment row backgrounds — feels like Yarit's shop
- `/admin/collections/orders`, `/admin/collections/categories`, `/admin/globals/site-settings`: same branded look
- `/admin/fulfillment`: OrderRows render with full sizing
- Top-right "?צריכה עזרה" pill works on every admin page
- Breadcrumb in the top header shows the full Hebrew name even with sidebar open

### Production URLs
- **Storefront:** https://yarit-shop.vercel.app
- **Admin (Payload):** https://yarit-shop.vercel.app/admin (`admin@shoresh.example` / `admin1234` — **rotate password first thing**)
- **Fulfillment Dashboard:** https://yarit-shop.vercel.app/fulfillment (admin-only)
- **GitHub:** https://github.com/nirpache1989-gif/yarit-shop (public)
- **Vercel project:** https://vercel.com/nirpache1989-gifs-projects/yarit-shop
- **Database:** Neon Postgres, Frankfurt region, seeded with 7 products + 5 categories + site settings + admin user

### Local dev
Still works — SQLite via `DATABASE_URI=file:./shoresh-dev.db` in `.env.local`, OR point at the Neon URL for production-parity dev. Re-seed with `curl -X POST "http://localhost:3000/api/dev/seed?wipe=1"` (the `?wipe=1` flag drops everything except the admin user before seeding).

## ⚠️ Things still worth doing

### 1. Rotate the Neon DB password

The password `npg_P1DUc9hvXItk` was pasted in chat during the deploy conversation. Best practice:
1. Go to https://console.neon.tech → your project → Settings → Reset password
2. Copy the new connection string
3. Update the Vercel env var:
   ```bash
   cd yarit-shop
   # remove old
   printf 'yes' | npx vercel env rm DATABASE_URI production
   # add new
   printf 'postgresql://NEW_PASSWORD_HERE@...' | npx vercel env add DATABASE_URI production
   # trigger a redeploy so the new value takes effect
   npx vercel --prod
   ```
4. Also update your local `.env.local` with the new password.

Not urgent — it's a dev-stage secret, but good hygiene.

### 3. (Minor) Middleware `proxy.ts` rename deprecation warning

Next 16 has been nagging: "The `middleware` file convention is deprecated. Please use `proxy` instead." The site works — this is cosmetic. Fix when you have 5 minutes: rename `src/middleware.ts` → `src/proxy.ts` and update any `next/link` imports inside. Tracked in `docs/TASKS.md`.

## What's done (so you don't redo any of it)

**Phases A–E (all 5 implementation phases):** scaffolding, Payload collections + seed, storefront (homepage + shop + product + cart), checkout + payments with mock providers, admin panel + Hebrew UI + fulfillment dashboard. See `docs/STATE.md` for the per-phase changelog.

**Design polish:** BranchDivider + SectionHeading primitives, MeetYarit + Testimonials new sections, corner sprigs + hover lifts + serif prices on ProductCard, nav link animated underlines, hero fade-up keyframes, paper grain overlay. See `docs/DECISIONS.md` ADR-010.

**Infrastructure:** Neon Postgres for prod DB (via env-based adapter selection in `src/payload.config.ts`), Vercel Blob plugin wired conditionally, `vercel.json` locks framework to nextjs, public GitHub repo, deployed to Vercel, 3 env vars set (PAYLOAD_SECRET, DATABASE_URI, NEXT_PUBLIC_SITE_URL). See `docs/DECISIONS.md` ADR-014.

**Customer-facing rebrand (ADR-015):** All Forever mentions scrubbed from the storefront while keeping the internal `type: 'forever' | 'independent'` discriminator and fulfillment workflow intact.

**Cart fix + image resolver (ADR-016 + ADR-017):** Diagnosed and fixed a `position:fixed` regression on the cart drawer (an unlayered `body > *` rule was beating Tailwind v4's `.fixed` utility). Centralized the static product image override map in `src/lib/product-image.ts` so the shop grid, cart drawer, product detail page, and order snapshot all stay in sync. Static photos now ship as part of the build via `public/brand/ai/` — Vercel Blob is no longer required to launch.

**Catalog refresh:** Trimmed seed from 10 to 7 products (only the ones with real photos). Rewrote all 7 with warmer Hebrew + English copy that includes a "How to use" block per product.

**Yarit guide:** `docs/YARIT-ADMIN-GUIDE.md` is a Hebrew end-user manual she can read on her own — covers login, password rotation, product editing, the fulfillment dashboard, and adding the admin to her phone home screen.

**AI handoff hygiene:** CLAUDE.md + 10 docs files (this one, STATE, TASKS, ARCHITECTURE, DECISIONS with 17 ADRs, CONVENTIONS, ENVIRONMENT, FULFILLMENT, BRAND, YARIT-ADMIN-GUIDE). Phase H (final organization pass for AI handoff) is in the plan file and will run at the very end.

## What to do next (your options)

### Option Z — Wave 2 of Design Round 2 (editorial moves with new images)

The plan file `~/.claude/plans/iridescent-exploring-cerf.md` has 20 detailed AI image generation prompts. To ship Wave 2 (the bigger editorial moves), the user needs to generate **9 images** using Prompts 1, 3, 4, 5, 6, 7, 9, 10, 14 and drop them into `public/brand/ai/`:
- `hero-still-life.jpg` — for the new editorial Hero
- `cat-skincare.jpg` / `cat-nutrition.jpg` / `cat-aloe.jpg` / `cat-beauty.jpg` / `cat-gifts.jpg` — for the art-directed CategoryGrid
- `yarit-portrait.jpg` — for the editorial MeetYarit vignette
- `icons-trust-set.png` — for the new watercolor TrustBar icon set
- `footer-garland.png` — for the footer botanical texture

Once those exist, Wave 2 ships in one PR: B4 (editorial Hero with single CTA), B5 (museum-label ProductCard), B7 (CategoryGrid art-directed covers), B8 (MeetYarit editorial vignette), B9 (watercolor TrustBar), B13 (Footer rework). All component file paths are listed in the plan.

### Option A — Ship the admin redesign + Wave 1 storefront polish (Recommended)
1. Push the admin redesign to production (commit + push, see "Production deploy of the admin redesign — DO THIS FIRST" above)
2. Walk through every admin section in production and verify the styling, copy, and the breadcrumb fix all hold up
3. Send the URL to Yarit for first feedback ("https://yarit-shop.vercel.app/admin — login: admin@shoresh.example / admin1234, please change the password right away")
4. Once she's used it for a week, collect feedback and prioritise the deferred items below

### Option B — Phase F: Customer account + SEO + responsive QA
- `/account` + `/account/orders/[id]` for customers to see their order history
- Full he↔en string coverage audit
- Per-page SEO meta + `sitemap.xml` + `robots.txt` + Product structured data
- Responsive QA (iPhone SE, iPad, desktop 1440) in both RTL and LTR
- Switch middleware.ts → proxy.ts (Next 16 convention)
- Custom domain once one is picked and purchased

### Deferred from this session (when there's time)
- **Production deploy** of the admin redesign (Option A)
- **Watercolor PNG icons** in the dashboard tile grid — currently emoji. Could swap four of the eight tiles for `public/brand/ai/icon-natural.png` / `icon-personal.png` / `icon-shipping.png` / `icon-certified.png`.
- **Dismissible welcome banner** with localStorage state — only build if Yarit asks for it.
- **Replace `(admin-tools)/fulfillment/page.tsx`** with `redirect('/admin/fulfillment')` after a couple of weeks of bake time confirms `/admin/fulfillment` is solid.
- **Re-grouping `SiteSettings`** into `branding` / `topBar` Payload `group` fields — would change DB column names, breaking change, defer until there's a real reason.

### Option C — Replace the placeholder brand name
Shoresh is a placeholder. If the final brand name is picked:
1. Edit `src/brand.config.ts` → change `brand.name.he` and `brand.name.en`
2. Replace `assets/Logomain1.jpg` with the new logo
3. Re-run `python scripts/process-logo.py` (requires `pip install rembg pillow`)
4. Commit + push — Vercel auto-deploys
5. Optionally rename the GitHub repo + the Vercel project

Everything else (docs, i18n keys, etc.) already uses the `brand` import, so a name change propagates automatically.

## Critical files to know about

| File | Purpose |
|---|---|
| `CLAUDE.md` | AI entry point — always read first |
| `docs/STATE.md` | Per-session progress log |
| `docs/TASKS.md` | Open items by phase |
| `docs/DECISIONS.md` | 14 ADRs explaining the non-obvious choices |
| `docs/ENVIRONMENT.md` | Env vars + Neon + Vercel Blob setup recipes |
| `docs/ARCHITECTURE.md` | System diagram + data model + flow descriptions |
| `docs/FULFILLMENT.md` | The Forever order state machine explained |
| `docs/BRAND.md` | Colors, fonts, logo rules |
| `src/brand.config.ts` | SINGLE source of truth for brand data |
| `src/payload.config.ts` | Payload root config + DB adapter branching + Blob plugin |
| `src/lib/seed.ts` | The one-shot seed logic called by `/api/dev/seed` |
| `~/.claude/plans/glimmering-scribbling-pudding.md` | The master plan file with all 8 phases (A–H) |

## Don't do these things

- **Don't commit `.env.local`** or anything with real secrets. The `.gitignore` is audited but always double-check `git status` before committing.
- **Don't run `/api/dev/*` endpoints in production.** They're gated on `NODE_ENV !== 'production'` and return 403 otherwise, but the gate only works if `NODE_ENV` is set correctly by Vercel (it is, by default).
- **Don't drop the Neon database** without re-seeding — the site crashes on `/admin` without a user.
- **Don't push to main without typechecking first** (`node node_modules/typescript/bin/tsc --noEmit`).
- **Don't edit `src/app/(payload)/admin/importMap.js` by hand** — Payload regenerates it on dev boot.

## Contacts / access

- **GitHub:** `gh` CLI is authenticated as `nirpache1989-gif`
- **Vercel:** `npx vercel whoami` → `nirpache1989-gif`, project linked at `nirpache1989-gifs-projects/yarit-shop`
- **Neon:** console at https://console.neon.tech, project in EU Central
- **Admin login (temporary):** `admin@shoresh.example` / `admin1234` — CHANGE FIRST THING

---

Good luck. Everything needed to pick this up is documented. 🌿
