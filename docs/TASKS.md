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
