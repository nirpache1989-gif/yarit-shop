# Next session — read this first

> **Audience:** Whoever opens this repo next, human or AI. This is the 5-minute orientation. After this, read `CLAUDE.md`, then `docs/STATE.md` for full history.
>
> **Last updated:** 2026-04-10, end of Round 6.

---

## TL;DR — where we are right now

- 🚀 **Live on production at `https://yarit-shop.vercel.app`.** Everything through **Round 6** is deployed. Branded Shoresh storefront + branded Yarit-friendly Payload admin panel + Warm Night dark mode + Hero light pocket + all 12 admin delight moves + the purposeful-minimalism pass.
- **Owner:** Yarit, a 65-year-old non-technical Hebrew-speaking merchant selling Forever Living + independent wellness products. She will use the admin panel every day.
- **Tech stack:** Next.js 16.2.3 + Tailwind v4 + Payload CMS 3.82 + Neon Postgres (prod) / SQLite (dev) + next-intl 4.9 + Vercel.
- **Admin login (dev only):** `admin@shoresh.example` / `admin1234` (created via `POST /api/dev/create-admin`).
- **Production admin login:** Yarit's own credentials (not in this repo).
- **Dev server:** `npm run dev` from `C:\AI\YaritShop\yarit-shop` → `http://localhost:3000`. `.vercel/project.json` is already linked to `prj_nog4wxxJHini5jSu9iW5CPGDAuYj` so `npx vercel --prod` triggers a production deploy without extra config.

## Critical read-me-first

1. **Every admin provider MUST accept and render `{children}`** or the entire admin below it disappears. See the comment block at the top of `src/components/admin/payload/AdminThemeInit.tsx` for the full post-mortem. Round 4 introduced this bug when we went from 1 provider to 4; Round 4 fix commit `cfcba0e` restored the chain.
2. **Vercel's GitHub webhook may still be stalled.** The auto-deploy chain broke after an Error deploy mid-session. Rounds 5 and 6 were deployed via `npx vercel --prod` as a workaround. On the next commit, check whether Vercel auto-builds from the push. If not, re-link the project in the Vercel dashboard.
3. **`docs/ADMIN-SURFACES.md` is the canonical map** of every admin surface with "what / used for / why" for each. Read it before adding or removing ANY admin surface. The goal is purposeful minimalism — every entry point must exist for a reason Yarit understands.
4. **Admin is Hebrew-only.** Any English string visible in the admin UI is a blocker. The admin-UI language switcher lives at `/admin/account` (field `שפה`), reachable via the 🔑 "חשבון, שפה וסיסמה" dashboard tile.
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

### 🚧 In progress / near-term

**This is what the next session should tackle, in priority order:**

1. **Phase F customer account** — `/account` page (order history) + `/account/orders/[id]` (order detail visible to the customer). Blocks "launch-ready storefront." Highest user value, no external dependencies.
2. **Phase F SEO pass** — `sitemap.xml`, `robots.txt`, per-page `<meta>` + Open Graph, Product structured data (JSON-LD). Required for Google indexing.
3. **Phase F responsive QA** — systematic check at iPhone SE / iPad / 1440px desktop across all storefront pages. Log issues, fix in waves.
4. **Phase F accessibility pass** — WCAG AA sweep. Start with the audit tools (axe-core or Lighthouse) across `/`, `/shop`, `/product/[slug]`, `/cart`, `/checkout`.
5. **Phase F string coverage** — grep for any remaining hardcoded Hebrew/English strings in components that should go through `useTranslations`.
6. **Orders email hook dev-safe** — `src/collections/Orders.ts:364` `afterChange` can silently interfere with order creation when `paymentStatus: 'paid'` is set on create and no email provider is configured. Wrap the dispatch in a provider-check + broader try/catch.

### 🔒 Blocked — waiting on Yarit/stakeholder input

- **Payment gateway credentials.** Meshulam is the recommended default but not locked — alternatives are Tranzila / CardCom / Grow / Pelecard. Once a gateway is chosen, wire `src/lib/payments/{gatewayName}.ts` against the existing `PaymentProvider` interface in `src/lib/payments/provider.ts`. The mock provider currently ships in prod; real transactions need the swap.
- **Business details for SiteSettings.** Phone, WhatsApp, public email, physical address, Israeli tax ID (ח.פ. / ע.מ.). Some placeholder values are seeded but they need to be replaced before launch.
- **Forever distributor info.** ID + landing URL (even though we don't deep-link, these are needed for footer marketing + compliance).
- **Legal content.** Terms, Shipping Policy, Returns Policy, Privacy Policy. Each becomes a simple markdown-rendered page under `/legal/[slug]`.
- **Domain name.** Currently on `yarit-shop.vercel.app`. Yarit wants `shoresh.co.il` or similar. Register + point DNS + add to Vercel.
- **Final product catalog copy.** The 9 seeded products have placeholder Hebrew + English copy. Yarit will edit via the admin panel once live.

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

**Sidebar** (post-Round 5 cleanup):
- 👥 אנשים → משתמשים
- 📦 קטלוג → קטגוריות, מוצרים  *(Tags hidden, Media hidden)*
- 💰 מכירות → הזמנות
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

Full entries are in `docs/STATE.md` under `## Changelog`. Read from the top for reverse-chronological history.
