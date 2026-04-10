# Open tasks

> Append new items to the relevant list. Move completed items to the changelog in `docs/STATE.md`.

## Phase A — ✅ complete (see STATE.md)
## Phase B — ✅ complete (see STATE.md)
## Phase C — ✅ complete (see STATE.md)
## Phase D — ✅ complete with mock provider (see STATE.md)
## Design uplift — ✅ complete (see STATE.md, DECISIONS.md ADR-010)
## Phase E — ✅ complete (see STATE.md)
## Design polish pass — ✅ complete (corner sprigs, hover lifts, serif prices, animations)
## Phase H (NEW) — scheduled at the very end, after Phases F + G. See plan file.

## Phase C (storefront)

- [ ] Full homepage (hero, trust bar, featured products carousel, Forever spotlight, categories, new arrivals, testimonials, newsletter CTA, footer with 4 columns)
- [ ] `/shop` — product grid + category filter + Forever/independent visual indicator
- [ ] `/product/[slug]` — detail page with image gallery, add-to-cart, Forever vs independent CTA branching (defense-in-depth: cart rejects Forever)
- [ ] Cart drawer + `/cart` page (Zustand store, localStorage persist, Forever products rejected)

## Phase D (checkout + payments)

- [ ] `/checkout` form (address, shipping, payment)
- [ ] Shipping cost logic (flat rate OR weight-based — confirm with Yarit)
- [ ] `src/lib/payments/provider.ts` abstract `PaymentProvider` interface
- [ ] `src/lib/payments/meshulam.ts` implementation (once gateway is chosen)
- [ ] `/api/checkout` orchestration route
- [ ] `/api/webhooks/meshulam` webhook + signature verification
- [ ] `/checkout/success` page
- [ ] Resend customer order-confirmation email (React Email template)

## Phase E (admin UX + fulfillment)

- [ ] Hebrew localization of Payload admin UI
- [ ] Hebrew help text on every product/order field
- [ ] Hide technical fields (slug, status, SKU) from Yarit's view
- [ ] Reorder product form so images appear first
- [ ] Custom admin view: `/admin/fulfillment` — order queue with action buttons
- [ ] New-order email notification to Yarit (via Resend webhook handler)
- [ ] In-admin unread badge on Orders
- [ ] Mobile responsiveness check on admin UI
- [ ] "Duplicate product" action + bulk select actions
- [ ] Update `docs/FULFILLMENT.md` with the finalized workflow

## Phase F (account, i18n, SEO, polish)

- [ ] `/account` — order history + detail
- [ ] `/account/orders/[id]` — order status visible to customer
- [ ] Translate every remaining string into both `he.json` and `en.json`
- [ ] SEO: per-page meta, `sitemap.xml`, `robots.txt`, Product structured data
- [ ] Responsive QA (iPhone SE, iPad, desktop 1440)
- [ ] Accessibility pass (WCAG AA)
- [ ] First deploy to Vercel + Neon production

## Phase G (post-launch bonuses)

- [ ] Blog (Payload Posts collection)
- [ ] Newsletter (Resend audience)
- [ ] WhatsApp notification on new order
- [ ] Google Analytics 4
- [ ] Customer reviews per product
- [ ] Automated low-stock alerts for independent products

## External blockers (require input from Yarit)

- [ ] Payment gateway decision (Meshulam recommended, alternatives: Tranzila / CardCom / Grow / Pelecard) — blocks Phase D
- [ ] Meshulam (or alternative) API credentials — blocks Phase D
- [ ] Business details: phone, WhatsApp, address, ח.פ./ע.מ., email — blocks Phase D + launch
- [ ] Forever distributor ID and URL pattern (even though we no longer deep-link, these are still useful for marketing purposes and link-outs)
- [ ] Legal content: Terms, Shipping Policy, Returns Policy, Privacy Policy — blocks launch
- [ ] Domain name (e.g. `shoresh.co.il`, `shoresh-shop.co.il`) — blocks launch
- [ ] Final product catalog copy (titles, descriptions, prices) — can be added through admin after Phase B

## Deferred / maybe

- [ ] Migrate `src/middleware.ts` → `src/proxy.ts` (Next 16 naming). Works as-is; migration is cosmetic.
- [ ] Revisit CLI seed script now that a working seed lives in `src/lib/seed.ts`. Could be invoked via a small Next.js build-time hook or `payload run --disable-transpile` against a pre-compiled JS bundle. Not blocking.
- [ ] Remove `@swc-node/register` and `@swc/core` dev deps — we installed them exploring the CLI seed path but ended up not using them.
- [ ] Consider React Compiler (stable in Next 16) in Phase F for performance.

## Round 5 follow-ups

- [ ] **Verify Vercel GitHub auto-deploy is self-healed.** Round 5 Phase 1 triggered a manual deploy via `npx vercel --prod` because the webhook had stalled after an Error deploy. Next time a commit is pushed to `main`, check whether Vercel auto-builds. If not, re-link the project in the Vercel dashboard to re-issue the webhook.
- [x] **Hide Tags collection from sidebar and hide `tags` field from product edit form.** Done in Round 5 Fix 2.1.
- [x] **Hide Media collection from sidebar and remove gallery dashboard tile.** Done in Round 5 Fix 2.2.
- [x] **Kill the triple help-link redundancy (HelpButton + WelcomeBanner + SidebarGreeting).** Done in Round 5 Fix 2.3.
- [x] **Delete the duplicated WelcomeBanner from the dashboard.** Done in Round 5 Fix 2.4.
- [x] **Add `/admin/account` dashboard tile so Yarit can discover the language switcher.** Done in Round 5 Fix 2.5.
- [x] **Fix the dark-mode "black gap between cards" visual bug.** Done in Round 5 Fix 2.10.
- [x] **Delete the legacy `src/app/(admin-tools)/fulfillment` route group.** Done in Round 5 Fix 2.13.
- [x] **Write `docs/ADMIN-SURFACES.md`.** Done in Round 5 Fix 2.6.

## Design Round 4 follow-ups

- [ ] **Make the Orders `afterChange` hook dev-safe.** `src/collections/Orders.ts:364` tries to send a new-order alert email whenever `paymentStatus` flips to `paid` on create/update. In dev with no email provider configured, the hook can interfere with order creation silently (Round 4 Track B smoke test observed creates returning `doc.id` but subsequent GETs returning `totalDocs: 0` when `paymentStatus: 'paid'` was set at create-time). Wrap the email dispatch in a "do we even have a provider" check and a broader try/catch so failures are logged but never block the write. Log added 2026-04-10 during Round 4 Track B.
- [ ] **Track D design review follow-ups.** Two Explore agents (D1 dark/light parity + D2 admin-at-65) landed their reports in `docs/round-4-design-review/`. Any "polish" items they flagged that weren't fixed in the Round 4 wave itself should land here as individual tasks.
- [ ] **Restore `<details>` field helper on complex Product fields (C7 ideal version).** Round 4 pivoted to "richer multi-line Hebrew descriptions with `•` bullets" because Payload 3.x's `admin.components.Description` slot is brittle and needed import-map regen. If a future Payload release makes component slots on field descriptions robust, upgrade `type` / `stock` / `status` on Products to a true collapsible `<details>` via a `FieldHelper` React component. Non-urgent — current bullet-separated descriptions already deliver most of the value.
- [ ] **Verify Round 4 in the preview browser.** During the Round 4 implementation, the Claude-in-Chrome preview had an intermittent cookie/navigation quirk where top-level navigation to `/admin` after a fetch-based login didn't pick up the HttpOnly `payload-token` cookie. Verification pivoted to curl-based REST + SSR HTML markers, which is functionally equivalent for proving the server renders correctly. At the start of the next session, spot-check the admin dashboard in a real browser (dev profile): verify the time-synced greeting renders, the 8 tiles fade in with stagger, the drifting leaves are visible, the `צפייה באתר` button appears in the header actions, and the driver.js tour fires on first load.

### Round 4 design-review agent findings (triage from `docs/round-4-design-review/sweep-results.md`)

- [ ] **D2.2 — Robustify C8 save button text swap against future Payload upgrades.** Currently a CSS `font-size: 0` + `::after { content: 'שמרי ✓' }` trick hits three independent Payload button selectors. Migrate to a Payload admin component hook that intercepts the button at render time so a single markup change in an upstream Payload release doesn't silently break the Hebrew label. Not urgent.
- [ ] **D2.3 — Consider reducing C5 tile stagger on mobile.** 60ms × 8 tiles = 480ms total. On the slowest devices this can feel draggy. Try 40ms or gate the stagger to ≥640px. Not urgent.
- [ ] **D2.4 — Drifting leaves may be too subtle on bright screens.** Current opacity is 0.05–0.07. On a 300+ nits display in daylight, Yarit may not see them. Consider bumping to 0.10–0.12. Wait for Yarit feedback before tuning.
- [ ] **D2.5 — Document the localizer RTL fix as brittle.** The `admin-brand.css` block around the language switcher patches Payload's RTL layout via a narrow selector. If a future Payload major version rewrites the localizer, the fix will silently break. Add a note in the CSS comment + watch `/admin` after every Payload upgrade.
- [ ] **D2.6 — driver.js 900ms timeout may race on fast machines.** Current approach: `setTimeout(() => d.drive(), 900)` after import. Refactor to wait for `.yarit-dashboard__hello` via MutationObserver or ResizeObserver instead of a hardcoded delay. Low priority.
- [ ] **D2.7 — Move Track C animations into an explicit `@layer`.** Current rules sit at the end of admin-brand.css without a dedicated layer. If Payload adds competing animations in a future release, specificity wars could break our stagger/fade. Preventive cleanup.
- [ ] **D2.8 — Empty list `::before` illustration may clash with future native Payload empty states.** If Payload ships a native empty-state component, we'd render two illustrations stacked. Switch to a conditional component wrapper if/when that happens.
- [ ] **D2.9 — Document drifting leaves z-index stacking.** Leaves sit at `z-index: 0`, content at `z-index: 1`, modals at `z-index: 100+`. Add a CSS comment block documenting the expected z-order so future changes don't invert it.
- [ ] **D2.10 — OrderRow mobile layout at 650px tablet portrait.** Between mobile (375) and tablet (768) breakpoints. Consider adding an `sm:` (640px) tweak so tablets keep the inline layout. Not urgent — current vertical stack is forgiving at any width.
