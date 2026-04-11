# Next session — read this first

> **Audience:** Whoever opens this repo next, human or AI. This is the 5-minute orientation. After this, read `CLAUDE.md`, then `docs/STATE.md` for full history.
>
> **Last updated:** 2026-04-11 late, end of the prod close-out deploy session. `e3a8a53` (GSAP Tier-1 finish + mobile audit) + `4ea4d90` (SSG incident fix — see `docs/STATE.md` 2026-04-11 late for the post-mortem) are BOTH pushed and live on production at `https://yarit-shop.vercel.app`. All 16 smoke-test routes return 200. The remaining work is whatever Yarit hasn't sent yet: Resend keys, Meshulam PDF + sandbox creds, legal markdown, and custom domain. See `docs/NEXT-SESSION-PROMPT.md` for the next-session menu (Track A paste-and-go / Track B GSAP Tier-2 / Track C QA polish / Track D final handoff).

---

## TL;DR — where we are right now

- 🚀 **Live on production at `https://yarit-shop.vercel.app`**, latest deploy `dpl_Asz72xL4FqWDPHacoe6khgSf5gXV` based on `4ea4d90`. All Phase A–F.1 + pre-launch hardening + design/motion sprint + admin re-skin + GSAP G1/G2/G3 + T1.1/T1.2/T1.3/T1.4/T1.5/T1.6/T1.7 + mobile audit fixes + 2026-04-11 SSG incident fix are all live and verified. **Vercel auto-deploy webhook has been stalling since 2026-04-10; the close-out session fell back to `npx vercel --prod --yes` twice.** Next session should retry auto-deploy first, then fall back to manual if needed.
- **NEW — GSAP Tier-1 completely done.** All four remaining waves (T1.4 → T1.7) shipped in one session plus mobile fixes. See `docs/STATE.md` top section "Latest (2026-04-11)" for the full file-level breakdown. Highlights: FeaturedProducts heading pins to viewport top on desktop while cards scroll past (`pinSpacing:false` + `gsap.matchMedia('(min-width: 768px)')` gate); sticky header shrinks its background opacity + shadow + logo size after 80px scroll via a tiny rAF-throttled observer writing `data-scrolled="true"` to `#site-header`; shop page filter chips now morph the product grid via GSAP Flip instead of hard-cutting; product detail gallery has smooth hover zoom (1 → 1.12 scale, 900ms) and thumb-click Flip morph into the main slot.
- **NEW — Mobile UX audit fixed two regressions.** (1) `LanguageSwitcher` was hidden on mobile because it lived inside `<div className="hidden md:flex">`; a Redmi Note Poco X7 user couldn't find it. Fix: moved outside the hidden wrapper so it's visible at every breakpoint. (2) Theme bootstrap was auto-following OS dark mode preference, causing the Poco X7 user to land on the site in dark mode because their phone is OS-wide dark. The brand palette is warmer and more editorial in light mode and dark should be opt-in. Fix: the inline bootstrap script now defaults to light unless `localStorage.shoresh-theme` was explicitly set to `dark` by the user clicking the toggle. The ThemeToggle still works normally; dark mode is fully supported, just not auto-enabled.
- **NEW — admin language switcher (visible pill).** New `AdminLangSwitcher.tsx` client component registered as the FIRST entry in `admin.components.actions` so it renders top-right on every admin page. One click flips `🌐 עברית` ↔ `🌐 English`. Uses `useTranslation()` + `switchLanguage()` from `@payloadcms/ui` — the same API Payload's built-in `/admin/account` dropdown uses internally, so the two controls stay in sync. Paired with localization of the three custom admin chrome components (`SidebarGreeting`, `SidebarFooter`, `HelpButton`) so the entire right-hand sidebar flips end-to-end — greeting, live-site/new-orders/sign-out shortcuts, help button, mailto subject+body, and Payload's built-in collection group labels (`📦 קטלוג` ↔ `📦 Catalog`) all swap cleanly. Round-trip verified in Preview MCP with real DOM queries. Root cause of the original bug report: Payload's built-in `LanguageSelector` IS rendered on `/admin/account`, but via `DocumentInfoProvider.AfterFields` which places it BELOW the user form fields — a 65-year-old non-technical user on a long Hebrew form doesn't scroll that far. The pill surfaces the same preference one click from anywhere.
- **NEW — GSAP core 3 waves shipped (storefront only).** First new motion dependencies since the design sprint closed: `gsap@^3.13` + `@gsap/react@^2.1` (~42KB gzipped, tree-shaken so only the routes that import it pay the cost). Policy-break is intentional and approved. User explicitly scoped this to customer experience — **NO admin GSAP polish in this sprint.** Three waves:
  - **G1 Foundation** — `src/lib/motion/gsap.ts` (single entry with `ScrollTrigger` pre-registered), `src/lib/motion/useGsapReducedMotion.ts` (reactive `useSyncExternalStore` hook), `src/components/motion/GsapScope.tsx` (the `useGsapScope(ref, setup)` helper that bundles `useGSAP()` + reduced-motion check).
  - **G2 Hero master timeline + scroll parallax** — `Hero.tsx` split into a ~30-line server shell that fetches translations + a new `HeroMotion.tsx` client component that owns all 4 background layers + Container + logo + headline words + subheadline + CTAs. Entrance timeline: logo → headline words (stagger with `rotationX: -8°`) → subheadline → CTAs, ~2.1s total. Plus two scrubbed ScrollTriggers: Layer 1 botanical frame `yPercent 0 → -12` as hero exits, Layer 3 cream vignette `opacity 1 → 0.4`. Replaces the old `<SplitWords>` + inline `animationDelay` approach on the Hero ONLY; other pages keep using `SplitWords`.
  - **G3 Product card magnetic hover** — new `ProductCardMotion.tsx` client component that renders the card's `<article>` root and attaches pointer listeners. On `pointermove`: `rotationY: nx * 3°`, `rotationX: -ny * 3°`, `transformPerspective: 1000`; inner `.product-image` gets a ±4px translate for parallax-of-depth. On `pointerleave`: 900ms `power3.out` return. Gated on `hover: hover` (skip on touch) + `prefers-reduced-motion` (skip entirely). Added `perspective: 1000px; transform-style: preserve-3d;` to `.product-card` in `globals.css`. Composes cleanly with the existing CSS hover lift because GSAP uses `matrix3d()` and CSS hover uses `matrix()`.
- **NEW — GSAP Tier-1 safe waves T1.1, T1.2, T1.3 shipped.** Follow-up after G1/G2/G3. Three additive additions that layer on top of the existing design without removing or replacing any CSS keyframe or motion primitive outside their own scope:
  - **T1.1 MeetYarit converge** — the 2-column editorial strip (image + text) now slides its two columns toward each other from opposite edges as the section enters the viewport. RTL-aware. New `MeetYaritMotion.tsx` (client) + simplified `MeetYarit.tsx` (server shell that passes strings). Replaces the old `<Reveal direction="start">` + `<StaggeredReveal>` on this section only.
  - **T1.2 CategoryGrid expand-on-enter** — all 5 category cards now animate from `scale: 0.96, y: 24, opacity: 0` to settled state with a 90ms stagger via a single ScrollTrigger tween. New `CategoryGridMotion.tsx` is a thin wrapper replacing the previous `<StaggeredReveal>`. Each card has `data-category-card` so the GSAP selector finds them.
  - **T1.3 BranchDivider SVG draw-in** — the 3 sprig dividers between homepage sections now draw themselves in. The central stem animates `stroke-dashoffset` from its measured total length → 0 (standard SVG "draw" trick), the two side hairlines extend via `scaleX: 0 → 1`, then the 5 leaves + 2 berries fade in with a stagger. Total sequence ~1.6s per divider. `BranchDivider.tsx` was converted from server to client component to own the GSAP timeline.
- **GSAP Tier-1 complete; Tier-2 + G4/G5 deferred.** Waves T1.4 (FeaturedProducts heading pin), T1.5 (header shrink), T1.6 (shop filter Flip) and T1.7 (product gallery Flip) all shipped 2026-04-11 — see the bullet above and `docs/STATE.md` 2026-04-11 entry. The Tier-1 foundation is in place; any Tier-2 work (About page narrative, cart drawer timeline, checkout confetti, footer reveal) and the original G4/G5 waves (homepage scroll-linked storytelling + page transitions) build on top additively. See `docs/NEXT-SESSION-GSAP-PROMPT.md` for historical vocabulary reference.
- **Design + animation sprint (previous sessions) — still in effect.** Every per-page wave from `~/.claude/plans/humming-popping-turtle.md` has landed. Session 1 landed Wave 0 (motion primitives: `useInView`, `Reveal`, `StaggeredReveal`, `KenBurns`, `ConfettiTrigger`, `SplitWords`) + Waves H / S / P / C / K / Y. Session 2 landed Waves L / A / O / B / T / G / 4 / D / F / M. Every wave kept the minimalist-luxurious language — slow spring/ease, no loud colors, per-keyframe `prefers-reduced-motion` guards. GSAP layers on top additively — it does NOT replace any of the existing primitives.
- **Storefront→admin theme-jump fix** still in effect from the previous session. See `STATE.md` Wave D entry.
- **Owner:** Yarit, a 65-year-old non-technical Hebrew-speaking merchant selling Forever Living + independent wellness products. She will use the admin panel every day.
- **Tech stack:** Next.js 16.2.3 + Tailwind v4 + Payload CMS 3.82 + SQLite (dev) / Neon Postgres (prod) + next-intl 4.9 + Vercel.
- **Admin login (dev only):** `admin@shoresh.example` / `admin1234` (created via `POST /api/dev/create-admin`).
- **Production admin login:** Yarit's own credentials (not in this repo).
- **Dev server:** `npm run dev` from `C:\AI\YaritShop\yarit-shop` → `http://localhost:3000`. Local dev hits `./shoresh-dev.db` (SQLite) because `DATABASE_URI` is commented out in `.env.local`. Production Vercel holds its own `DATABASE_URI` pointing at Neon.
- **Vercel deploy:** `.vercel/project.json` is already linked. `npx vercel --prod` triggers a production deploy without extra config.
- **Quality gates:** `npx tsc --noEmit` + `npm run build` + `npm run lint` all pass (only warnings are in three stub files that disappear once Track A credentials land). `npm test` is the one-line shorthand.

## Critical read-me-first

1. **Every admin provider MUST accept and render `{children}`** or the entire admin below it disappears. See the comment block at the top of `src/components/admin/payload/AdminThemeInit.tsx` for the full post-mortem. Round 4 introduced this bug when we went from 1 provider to 4; Round 4 fix commit `cfcba0e` restored the chain.
2. **Vercel's GitHub webhook may still be stalled.** The auto-deploy chain broke after an Error deploy mid-session. Rounds 5 and 6 were deployed via `npx vercel --prod` as a workaround. On the next commit, check whether Vercel auto-builds from the push. If not, re-link the project in the Vercel dashboard.
3. **`docs/ADMIN-SURFACES.md` is the canonical map** of every admin surface with "what / used for / why" for each. Read it before adding or removing ANY admin surface. The goal is purposeful minimalism — every entry point must exist for a reason Yarit understands.
4. **Admin supports Hebrew + English, Hebrew default.** As of this session the admin UI language can be flipped in one click via the `🌐` pill in the top-right action cluster (`AdminLangSwitcher.tsx` — first entry in `admin.components.actions`). Payload's built-in dropdown on `/admin/account` still works and stays in sync because both controls write to the same Payload preference via `switchLanguage()` from `@payloadcms/ui`. All three custom admin chrome components (`SidebarGreeting`, `SidebarFooter`, `HelpButton`) now read `props.i18n?.language` and branch inline `strings` objects, so the entire right-hand sidebar flips end-to-end. Hebrew is still the fallback language for first-visit users.
5. **Storefront has light + dark mode.** Dark is Warm Night (#2A2012 base, sage-olive primary, warm ochre accent). The Hero section stays in light-mode parchment even in dark mode (intentional contrast cliff with the TrustBar below). Logo halo has a 14-stop radial gradient, NO blur filter (blur leaks through `isolation: isolate`).

---

## What's deployed vs what's left

### ✅ Done and live

- **Phase A** — scaffolding, brand tokens, Hebrew + English i18n
- **Phase B** — 6 collections + SiteSettings global + seed script + 7 Forever products + 2 independent
- **Phase C** — storefront pages: `/`, `/shop`, `/product/[slug]`, `/cart`, `/about`, `/contact`, `/checkout`, `/checkout/success`
- **Phase D** — checkout form + shipping rates + payment provider abstraction + mock payment gateway + Resend email stubs
- **Phase E** — admin UX + fulfillment dashboard + Hebrew copy pass + /admin/fulfillment custom view
- **Design Rounds 1-4** — Yarit-friendly admin re-skin + editorial storefront uplift + Night Apothecary palette + Warm Night dark mode + drifting leaves + iridescent hero + logo halo + 12 admin delight moves
- **Round 5** — admin purposeful-minimalism pass (hide Tags + Media + WelcomeBanner, kill triple help link, add account tile, flatten dark ladder, delete legacy route)
- **Round 6** — hide misleading content-locale chip + theme-adaptive admin chrome (nav, header, sidebar greeting, tables)
- **Infrastructure** — Neon Postgres adapter, Vercel Blob plugin (token-gated), Vercel deploys, custom `yarit-shop.vercel.app` domain

### 🚧 Shipped in the pre-launch hardening sprint (end of session, 2026-04-10)

**All code work is done.** Phase F.1 + Wave B1 → B8 + Track A prep all landed in one sprint. Nothing in code is blocking launch.

- **Wave B1 hardening** — `PAYLOAD_SECRET` hard-fails in production-like env instead of falling back to a source-code default; `/api/checkout` reads `siteUrl` from server env only (ignores client); customer passwords use `crypto.randomBytes`; `/api/checkout` body goes through a hand-rolled runtime validator.
- **Wave B2 mobile nav** — `MobileNav.tsx` hamburger + slide-in panel with focus trap + ESC + scroll lock + focus restore. Wired into `Header.tsx` below the `md` breakpoint.
- **Wave B3 SEO** — `src/app/sitemap.ts` + `src/app/robots.ts` (Next.js convention routes). Per-page `generateMetadata` on shop/product/about/contact. Product `schema.org/Product` JSON-LD with ILS price + availability.
- **Wave B4 a11y** — cart quantity buttons now have descriptive aria-labels (`t('cart.increaseQty', { item })`), cart drawer has a real focus trap + focus restore, back links on about/contact have accessible names.
- **Wave B5 lint + format** — `mounted+setState` anti-pattern replaced with a shared `useHasMounted()` hook (uses `useSyncExternalStore` — the React 19 approved API). `ThemeToggle` now subscribes to the `[data-theme]` attribute via `MutationObserver` + `useSyncExternalStore`. Shared `src/lib/format.ts` for ILS + date formatting. Windows-compatible `scripts/reset-db.mjs` replaces the old `rm -rf …` shell script. Lint is 0 errors + 3 warnings (only in Track A stub files that disappear once credentials are pasted in).
- **Wave B6 admin hardening** — fulfillment loader bumped to 500 cap with a "near cap" warning, N+1 customer lookup dropped in favor of `depth: 1` population, `YaritDashboard` stats now filter by `paymentStatus: paid` to match fulfillment dashboard's "actionable" semantics. Three fragile CSS overrides in `admin-brand.css` carry ⚠ PAYLOAD INTERNAL guard comments.
- **Wave B7 post-checkout email** — order confirmation email now includes a "set your account password" CTA for first-time customers with a deep link to `/forgot-password?email=<their email>`. `ForgotPasswordForm` prefills the input from the query param.
- **Wave B8 docs + CI** — new `docs/INDEX.md` + `docs/ONBOARDING.md`. `.github/workflows/ci.yml` runs tsc + lint + build on every push and PR. `package.json` has a new `test` script.

### 🟢 Track A prep — paste-in-ready (waiting on Yarit to provide the values)

**All the scaffolding is done.** When Yarit hands over the credentials and content, it's literally copy-paste:

- **Email provider (Resend)** — `src/lib/email/resend.ts` is fully implemented. To activate:
  ```
  EMAIL_PROVIDER=resend
  RESEND_API_KEY=re_xxx
  EMAIL_FROM=shop@shoresh.co.il
  EMAIL_FROM_NAME=שורש
  ```
  That's it. Restart the dev server or redeploy.

- **Payment gateway (Meshulam)** — `src/lib/payments/meshulam.ts` is scaffolded with the full framework: env reading, error handling, HMAC signature verification, status mapping. Two `TODO(meshulam)` hotspots mark the spots where Meshulam's PDF docs dictate exact field names. To activate:
  ```
  PAYMENT_PROVIDER=meshulam
  MESHULAM_API_KEY=xxx
  MESHULAM_USER_ID=xxx
  MESHULAM_PAGE_CODE=xxx
  MESHULAM_WEBHOOK_SECRET=xxx
  MESHULAM_BASE_URL=https://sandbox.meshulam.co.il/api/light/server/1.0
  ```
  Plus ~30-60 min of work to reconcile the two TODO spots against the Meshulam PDF, then a sandbox E2E test before flipping the base URL to live.

- **Legal content** — `src/app/(storefront)/[locale]/legal/[slug]/page.tsx` reads markdown from `content/legal/<slug>/<locale>.md`. Drop the files in:
  ```
  content/legal/terms/he.md
  content/legal/terms/en.md
  content/legal/privacy/he.md
  ... etc.
  ```
  See `content/legal/README.md` for the exact paths. The four `/legal/*` routes are reachable immediately — they show a "coming soon" fallback until the files land.

- **Real business info** — Yarit fills `/admin/globals/site-settings` directly (phone, WhatsApp, email, address, tax ID, social handles). The admin form is already in Hebrew with per-field help text.

- **Footer legal links** — once the markdown files are in place, add four `<Link>` entries back to `src/components/layout/Footer.tsx` (they were removed in the polish pass because the pages didn't exist yet).

- **Domain name** — register + DNS + add to Vercel. Non-code.

- **Final product catalog copy** — Yarit edits live via `/admin/collections/products`. Non-code.

### 🔒 Blocked — waiting on Yarit/stakeholder input

(Same as Track A prep above — each item is a pure "paste the values" operation because the code is ready.)

### 🎁 Phase G — post-launch bonuses (after launch, not blockers)

- Blog (new Payload `Posts` collection)
- Newsletter signup wiring (Resend audience)
- WhatsApp notification on new order (via a webhook)
- Google Analytics 4
- Customer reviews per product
- Automated low-stock alerts for independent products

### 🧹 Phase H — final organization pass (run before closing out the project)

- Docs audit (are all docs current?)
- JSDoc audit (every file has a `@file` + `@summary`?)
- Dead-code sweep
- Write `docs/ONBOARDING.md` for future contributors
- Naming consistency pass

---

## Admin panel — current state

**Sidebar** (post-Round 5 cleanup — group names authoritative per `src/collections/*` + `src/globals/SiteSettings.ts`):
- 📦 קטלוג → קטגוריות, מוצרים  *(Tags hidden, Media hidden)*
- 💰 מכירות → הזמנות
- 👥 לקוחות → משתמשים
- 🌿 הגדרות → הגדרות אתר
- Plus `SidebarGreeting` at top + `SidebarFooter` at bottom

**Dashboard** (`/admin`): 6 stat cards + 8 action tiles + time-synced Hebrew greeting + drifting leaves background.

**Custom views:**
- `/admin/fulfillment` — branded order workflow with state-machine buttons and illustrated empty state
- `/admin/account` — Payload built-in (reachable via the 🔑 account tile)

**Header actions:**
- `HelpButton` → `mailto:` to Nir with pre-filled Hebrew subject
- `ViewOnSite` → opens storefront in new tab

**Invisible providers** (ALL must render `{children}`):
- `AdminThemeInit` — syncs theme with storefront via `shoresh-theme` localStorage
- `AdminToaster` — react-hot-toast bottom-center, Warm Night branded
- `AdminDriftingLeaves` — 5 SVG leaves at `z-index: 0`
- `OnboardingTour` — 4-step driver.js walkthrough on first visit

See `docs/ADMIN-SURFACES.md` for the full inventory with rationale.

---

## Quick commands

```bash
# from C:\AI\YaritShop\yarit-shop

# dev
npm run dev                       # http://localhost:3000

# dev bootstrap (first run only)
curl -X POST http://localhost:3000/api/dev/create-admin \
  -H "content-type: application/json" \
  -d '{"email":"admin@shoresh.example","password":"admin1234"}'
curl -X POST http://localhost:3000/api/dev/seed        # (optional — seed 9 products)

# verify
npx tsc --noEmit                  # type check
npm run build                     # prod build (Turbopack) → ~5-8s
npm run lint                      # ESLint

# deploy (manual, works around the stalled webhook)
npx vercel --prod

# deploy check
npx vercel ls | head -5
curl -s https://yarit-shop.vercel.app/admin/login | grep -c "yarit-brand-logo"  # should be > 0
```

---

## Known rough edges (don't let them surprise you)

1. **Vercel GitHub auto-deploy is unreliable.** See the "Critical" section above. If you push and nothing builds, run `npx vercel --prod`.
2. **Orders `afterChange` email hook can eat writes.** `paymentStatus: 'paid'` on create triggers the hook; with no email provider in dev, it can silently drop order writes. Create orders with `paymentStatus: 'pending'` and flip via PATCH as a workaround until the hook is wrapped in a provider check.
3. **Claude Preview MCP's virtual browser has limitations rendering Payload 3.x admin client components.** Fetched HTML contains all the markers (confirmed via curl), but the JS sidebar nav + login form sometimes won't hydrate in the preview. Real browsers work fine. If you see a blank admin in Claude Preview, verify with curl before assuming it's a code bug.
4. **Tailwind v4 is used via `@theme` directive, NOT `tailwind.config.ts`.** Brand tokens live in `@theme { --color-*: ... }` blocks in `src/app/globals.css` (storefront) and `src/app/(payload)/admin-brand.css` (admin). Do not add `tailwind.config.ts` — it won't be read.
5. **Admin uses Payload's hardcoded `html { font-size: 12px }` root.** Every `rem` value in `admin-brand.css` is scaled to that 12px base. Don't change the root — adjust individual `rem` values.
6. **RTL + Payload interactions have quirks.** The step-nav breadcrumb fade, the content-locale chip, and the sidebar group labels all needed targeted CSS fixes. Be careful adding new absolute-positioned admin chrome — test in RTL first.

---

## Round-by-round changelog pointer

- **Round 1** — Initial admin re-skin (Yarit-friendly dashboard, brand chrome, Hebrew copy)
- **Round 2** — Editorial storefront uplift waves 1+2 + admin polish (eyebrow component, ProductCard, CategoryGrid, Footer)
- **Round 3** — Night Apothecary palette, Warm Night dark mode, drifting leaves, iridescent hero, logo halo, Bellefair font swap
- **Round 4** — Hero dark-light pocket + logo blur fix + 12 admin delight moves + design-review agent sweep
- **Round 5** — Emergency Vercel redeploy + purposeful-minimalism pass (hide dead code, kill duplicates)
- **Round 6** — Hide misleading content-locale chip + theme-adaptive admin chrome
- **Design + animation sprint Session 1** — Wave 0 motion primitives + Waves H / S / P / C / K / Y (homepage, shop, product, cart, checkout, success). Plan file: `~/.claude/plans/humming-popping-turtle.md`.
- **Design + animation sprint Session 2** — Waves L / A / O / B / T / G / 4 / D / F / M (auth, account, order detail, about, contact, legal, 404, admin dashboard, admin fulfillment, admin forms). Includes the critical storefront→admin theme-jump fix in Wave D.

Full entries are in `docs/STATE.md` under `## Changelog`. Read from the top for reverse-chronological history.

---

## What's next — the path to finishing the project

Everything from the design + animation sprint, Phase F.1 customer
accounts, the pre-launch hardening sprint, and today's admin audit
fixes is now pushed to main. Vercel will auto-deploy from the push.
The project is **functionally complete for launch** — the only things
left are external dependencies (credentials + content from Yarit) plus
a handful of nice-to-have polish items that don't block launch.

### 🚀 Immediate (verify the push went through)

1. **Check Vercel auto-deploy.** The push in today's big commit
   should trigger a Vercel build. Watch `https://yarit-shop.vercel.app`
   for the new deploy. If auto-deploy is still stalled (it was flaky
   during Rounds 5-6), run `npx vercel --prod` manually.
2. **Spot-check the live URLs in a real browser** (Claude Preview
   can't fully exercise client-side motion — needs a real eye):
   - `/` — new hero: watercolor botanical frame + big Shoresh logo +
     headline "שורשים של בריאות" visible in the cream vignette
   - `/shop` — 7 new flat-lay product photos (BodylotionNwsh.jpg,
     ForeverDaily.jpg, etc.) on each card
   - `/admin/collections/products` — select a row, red "מחיקה" pill
     visible top-left, click it, confirmation modal appears in the
     CENTER of the viewport, clicking "אישור" actually deletes
   - `/admin` from a dark-mode storefront visit — should render dark
     on first paint, not flash light
   - `/account/orders/[id]` of a paid order — timeline line draws
     in, total counts up from 0

### 🟢 Launch blockers — waiting on Yarit / external input

These are the only things stopping the shop from being ready for real
customers. Each is paste-in-ready:

1. **Payment gateway** — Meshulam (recommended) or alternative. Paste
   `MESHULAM_API_KEY` / `MESHULAM_USER_ID` / `MESHULAM_PAGE_CODE` /
   `MESHULAM_WEBHOOK_SECRET` into Vercel env, set
   `PAYMENT_PROVIDER=meshulam`. Scaffolding in `src/lib/payments/` is
   complete with two `TODO(meshulam)` hotspots for the exact field
   names from Meshulam's PDF.
2. **Email provider** — Resend. Paste `RESEND_API_KEY` + `EMAIL_FROM`,
   set `EMAIL_PROVIDER=resend`. Adapter in `src/lib/email/resend.ts`
   is complete.
3. **Legal content** — terms / privacy / shipping / returns. Drop
   the four markdown files into `content/legal/<slug>/<locale>.md`
   (placeholders + README already in place). Pages at `/legal/<slug>`
   go live on the next deploy.
4. **Real business info** — Yarit fills via `/admin/globals/
   site-settings` (contact email, WhatsApp, phone, social links,
   business tax ID, distributor ID).
5. **Custom domain** — map `yarit-shop.vercel.app` to a real domain
   (e.g., `shoresh.co.il`) via Vercel DNS.
6. **Final catalog copy** — Yarit edits the 7 seed products and adds
   anything else she wants via the admin. The catalog is hers to
   curate.

### 🟡 Nice-to-have polish (not blocking launch)

These are documented for a future session but no one has asked for
them and the site ships fine without them:

1. **Wire the `.yarit-save-flourish` CSS animation** to Payload's
   save button on successful save. Keyframe is already defined in
   `admin-brand.css`; needs a Payload `afterChange` admin component
   that toggles the class on the sticky save control. Payload
   doesn't expose a stable class for "save just succeeded" so this
   requires touching Payload internals.
2. **Add descriptions to the Users create form** (email, name,
   phone, saved addresses). The role + preferredLocale fields
   already have rich helpers; the rest rely on labels alone. Minor.
3. **Add a `listSearchableFields: ['email', 'name']`** to the Users
   collection for better admin search UX. Small QoL win.
4. **Audit docs consistency** after launch — `docs/TASKS.md`,
   `docs/ADMIN-SURFACES.md`, `docs/FULFILLMENT.md` might have stale
   references to the old slug convention or the pre-redesign admin
   chrome.
5. **Admin onboarding tour enhancement** — the current OnboardingTour
   is basic (driver.js with a few steps). Could be expanded to walk
   Yarit through her first product edit / first order fulfillment
   end-to-end.

### 📝 Gotchas documented for the next AI session

- **Never use Tailwind-like bracketed class names inside JSX/TSX
  comments.** Tailwind v4's scanner treats them as real classes and
  will try to compile them. If the example contains literal `...` or
  any non-CSS-variable characters, the compiled output will be
  invalid CSS and will 500 every storefront page at build time.
  Write examples in plain prose ("arbitrary text color utility")
  instead.
- **CountUp takes string props (prefix / suffix / locale), NOT a
  format function.** React Server Components cannot pass function
  props to Client Components — Next 16 throws at render time. If you
  extend CountUp, keep it serializable.
- **Payload's `.payload__modal-container` is an un-role'd `<div>`,
  NOT a `[role="dialog"]`.** Any `body > *:not([role="dialog"])`
  rule in admin-brand.css must explicitly also
  `:not(.payload__modal-container)` or it will break every modal in
  the admin (confirm button drops off-screen).
- **Bulk-delete buttons in Payload list views inherit
  `btn--style-none`** by default. If you rewrite admin-brand.css,
  keep the `.list-selection__button` pill treatment around — without
  it the delete button is invisible against the parchment bg.
- **Seed script slug convention vs. production DB drift:**
  `STATIC_IMAGE_OVERRIDES` in `src/lib/product-image.ts` registers
  TWO key conventions for each photo (seed slugs like `aloe-lip-balm`
  AND drift slugs like `aloe-lips`). Don't collapse the map without
  first confirming what's actually in the production Neon DB.
- **Admin theme-jump:** the storefront's inline `themeBootstrap`
  script in `(storefront)/[locale]/layout.tsx` mirrors the theme into
  the `payload-theme` cookie on every page load. If you touch that
  script, make sure the cookie write stays, or the first paint of
  `/admin` will flash light then flip to dark.
- **GSAP single-entry rule.** Never import `gsap` or
  `gsap/ScrollTrigger` directly from any component. Always import
  from `src/lib/motion/gsap.ts` — that file registers ScrollTrigger
  exactly once and re-exports both. Direct imports from anywhere
  else cause duplicate plugin registrations (GSAP dedupes but the
  policy keeps the intent obvious).
- **GSAP components MUST use `useGsapScope`.** Never call GSAP from
  a raw `useEffect` — React 19 StrictMode double-mounts will leak
  timelines. Always use `useGsapScope(ref, setup)` from
  `src/components/motion/GsapScope.tsx` — it wraps
  `useGSAP()` from `@gsap/react` (auto-cleanup on unmount +
  dependency changes) AND injects a `reduced` flag from
  `useGsapReducedMotion` so every setup can branch on reduced motion.
  The setup may return a cleanup function for DOM listeners etc.
- **Reduced motion is mandatory for every GSAP component.** Every
  `useGsapScope` setup callback MUST check `reduced` first and fall
  through to `gsap.set([...], { clearProps: 'all' })` to snap to the
  settled state. See `HeroMotion.tsx` and `ProductCardMotion.tsx` for
  the reference pattern.
- **Server→client function-prop rule applies to GSAP components.**
  `HeroMotion` / `ProductCardMotion` receive only strings, numbers,
  and booleans from their server parents. Never pass a callback,
  formatter, or translation function — Next 16 throws at render.
- **GSAP's `ScrollTrigger` inline config works without importing
  the class.** Any `gsap.to()` call can take `scrollTrigger: {...}`
  directly because the plugin is pre-registered in
  `src/lib/motion/gsap.ts`. If you destructure `ScrollTrigger` from
  the `useGsapScope` context but don't actually use the class, ESLint
  will flag it as unused. Just drop it from the destructure.
- **HMR may leave stale error entries in the browser console** after
  an iterative GSAP/React edit cycle. They're not real — trust
  `preview_logs --level error` (server-side compile errors) as ground
  truth, not `preview_console_logs --level error` (browser buffer).
  A hard reload does NOT always flush them.
- **Admin language flip persists across routes.** Payload stores the
  preference in the user's `payload-preferences` document, so
  switching on one admin page and navigating to another keeps the
  new language. The custom sidebar components (`SidebarGreeting`,
  `SidebarFooter`, `HelpButton`) re-read `props.i18n.language` on
  every render so they always reflect the live state.

Full per-wave details are in `docs/STATE.md` — read the changelog
from the top for reverse-chronological history.
