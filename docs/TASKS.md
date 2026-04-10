# Open tasks

> **Append new items to the relevant list. Move completed items to the changelog in `docs/STATE.md`.**
>
> **Last updated:** 2026-04-10 (after the pre-launch hardening sprint + Phase F.1 + design + animation sprint + admin audit bug fixes).

---

## ⚠️ This file is mostly historical now — read `docs/NEXT-SESSION.md` first

Since the end of Round 6, four more sprints have shipped and the whole section below is out of date:

1. **Pre-launch hardening sprint (Waves B1–B8)** — security, a11y, SEO, mobile nav, CI, email + payment stubs. All done.
2. **Phase F.1 — customer accounts** — /login, /forgot-password, /reset-password, /account, /account/orders/[id]. All done.
3. **Design + animation sprint** (plan: `~/.claude/plans/humming-popping-turtle.md`) — every per-page wave shipped (H/S/P/C/K/Y from Session 1, L/A/O/B/T/G/4/D/F/M from Session 2). Full motion primitives library (useInView, Reveal, StaggeredReveal, KenBurns, ConfettiTrigger, SplitWords, CountUp), hero Ken Burns, staggered reveals everywhere, gold focus rings, order timeline SVG draw, admin dashboard pulse rings + count-up, the critical storefront→admin theme-jump fix, and more. All done.
4. **Admin audit + bulk-delete fix + new hero background** (today's session) — 7 product photo slug aliases, visible delete pill, off-screen modal fix, new hero-bg-2.png with vignette + bigger logo. All done.

**Authoritative next-step file is `docs/NEXT-SESSION.md`.** It lists the only remaining work (all external dependencies waiting on Yarit) plus documented gotchas for the next AI session. Read that first.

The phase-by-phase plan below is kept for historical reference — the items under "Phase F.1", "Phase F.2", "Phase F.3" are all marked done in `docs/STATE.md` and should NOT be re-worked.

---

## 🚀 [HISTORICAL] START HERE — next session (as of Round 6)

Everything through **Round 6** is shipped and live on `https://yarit-shop.vercel.app`. The admin panel is in its final functional form; the next phases are about completing the storefront to launch-ready and wiring the last external integrations.

**Recommended order for the next session:**

### 1. Phase F.1 — Customer account pages (highest value, no external deps)

- [ ] **`/account` — order history.** Logged-in customer's orders list. Use `payload.find({ collection: 'orders', where: { customer: { equals: user.id } } })`. Reuse `OrderRow` styling or build a lighter customer-facing variant. Include an empty state for users with no orders yet.
- [ ] **`/account/orders/[id]` — order detail.** Line items snapshot, shipping address, payment status, fulfillment status (customer-friendly Hebrew labels, NOT the raw enum values).
- [ ] **Login/register flow for customers.** Payload already supports it via `/api/users/login` + `/api/users`. Need a storefront login page at `/login` and a register page at `/register`. Keep it simple — email + password, no OAuth for v1.
- [ ] **Logout button** in the storefront header when logged in. Conditionally show "login/register" vs "my account/logout" based on auth state.

### 2. Phase F.2 — SEO pass (required for Google indexing)

- [ ] **`sitemap.xml`** — `src/app/sitemap.ts` static route that emits all products, categories, and static pages. Use next-intl's `generateStaticParams` for both locales.
- [ ] **`robots.txt`** — `src/app/robots.ts` with `Allow: /` except `/admin`, `/api`, `/cart`, `/checkout`.
- [ ] **Per-page `<Metadata>`** — `generateMetadata` functions on every storefront page. Already wired on the root layout; extend to `/shop`, `/product/[slug]`, `/about`, `/contact`, `/checkout/*`.
- [ ] **Open Graph tags** — `og:title`, `og:description`, `og:image` per page. Product pages should use the first product image.
- [ ] **Product structured data (JSON-LD)** — emit a `<script type="application/ld+json">` block on `/product/[slug]` using schema.org `Product` markup with price, availability, image.

### 3. Phase F.3 — Responsive QA + accessibility

- [ ] **Responsive sweep** — iPhone SE (375w), iPad (768w), desktop 1440. Pages to test: `/`, `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/about`, `/account`. Log every visual bug; fix in a single commit per viewport.
- [ ] **WCAG AA accessibility audit** — run Lighthouse + axe-core against every storefront page. Focus areas: color contrast (dark mode Hero pocket already passes), keyboard nav, focus-visible outlines, form labels, alt text, heading order.
- [ ] **i18n string coverage** — grep for any hardcoded Hebrew/English strings in `src/components/**` that should be in `src/messages/{he,en}.json`. Use `useTranslations` everywhere.

### 4. Phase F.4 — Dev ergonomics + Orders hook fix

- [ ] **Make the Orders `afterChange` email hook dev-safe.** `src/collections/Orders.ts:364` tries to send a new-order alert email whenever `paymentStatus` flips to `paid` on create/update. In dev with no email provider configured, the hook can interfere with order creation silently (Round 4 Track B smoke test observed creates returning `doc.id` but subsequent GETs returning `totalDocs: 0` when `paymentStatus: 'paid'` was set at create-time). Wrap the email dispatch in a provider-check + broader try/catch so failures are logged but never block the write.
- [ ] **Verify Vercel GitHub auto-deploy is self-healed.** Rounds 5 + 6 were manually deployed via `npx vercel --prod` because the webhook had stalled. Next time a commit is pushed to `main`, check whether Vercel auto-builds. If not, re-link the project in the Vercel dashboard.

### 5. Phase G bonuses (after launch)

Do these only after F is complete and the site is publicly launched. None of them block launch.

- [ ] **Blog** — new Payload `Posts` collection, `/blog` + `/blog/[slug]` storefront routes
- [ ] **Newsletter signup wiring** — connect the existing `<NewsletterSignup>` client component to Resend (or Brevo / Mailchimp)
- [ ] **WhatsApp notification on new order** — webhook handler that calls WhatsApp Business API with a short Hebrew order summary
- [ ] **Google Analytics 4** — `@next/third-parties/google` GA4 component in the root layout, gated on env var
- [ ] **Customer reviews per product** — new `Reviews` collection with moderation workflow
- [ ] **Automated low-stock alerts** — cron job or Payload `afterChange` hook on Products that emails Yarit when `stock < 3` for independent products

### 6. Phase H — final organization pass (run before closing out)

- [ ] Docs audit — every `docs/*.md` current?
- [ ] JSDoc audit — every `src/**/*.ts{x}` has a `@file` + `@summary`?
- [ ] Dead-code sweep — grep for unused exports, unreferenced components
- [ ] Write `docs/ONBOARDING.md` for future contributors (the "5-minute starter" after cloning the repo)
- [ ] Naming consistency pass — any `Yarit*` vs `Shoresh*` vs `Admin*` inconsistencies?

---

## 🔒 External blockers (need Yarit / stakeholder input)

**None of the Phase F storefront work is blocked by these** — Phase F can proceed in parallel. These only become blockers for launch.

- [ ] **Payment gateway decision.** Meshulam recommended, alternatives: Tranzila / CardCom / Grow / Pelecard. Once chosen, wire `src/lib/payments/{gatewayName}.ts` against the existing `PaymentProvider` interface in `src/lib/payments/provider.ts`. The mock provider currently ships in prod; real transactions need the swap.
- [ ] **Gateway API credentials.** Sandbox + production tokens for whichever gateway is picked.
- [ ] **Business details for SiteSettings.** Phone, WhatsApp, public email, physical address, Israeli tax ID (ח.פ. / ע.מ.). Placeholders are seeded; Yarit can replace them via `/admin/globals/site-settings` directly.
- [ ] **Forever distributor info.** ID + landing URL for footer marketing + compliance.
- [ ] **Legal content.** Terms, Shipping Policy, Returns Policy, Privacy Policy. Each becomes a markdown-rendered page under `/legal/[slug]`.
- [ ] **Domain name.** Currently `yarit-shop.vercel.app`. Target: `shoresh.co.il` or similar. Register → point DNS → add to Vercel project.
- [ ] **Final product catalog copy.** The 9 seeded products have placeholder bilingual copy. Yarit will edit live via the admin panel.

---

## 🧩 Round 4 design-review agent findings (triage — all polish, not blocking)

These are the remaining "polish" items from the two design-review agents that ran at the end of Round 4 (full reports in `docs/round-4-design-review/sweep-results.md`).

- [ ] **D2.2 — Robustify C8 save button text swap against future Payload upgrades.** CSS `font-size: 0` + `::after { content: 'שמרי ✓' }` trick hits three independent Payload button selectors. Migrate to a Payload admin component hook that intercepts the button at render time.
- [ ] **D2.3 — Consider reducing C5 tile stagger on mobile.** 60ms × 8 tiles = 480ms total. Try 40ms or gate the stagger to ≥640px.
- [ ] **D2.4 — Drifting leaves may be too subtle on bright screens.** Current opacity is 0.05–0.07. Consider bumping to 0.10–0.12. Wait for Yarit feedback.
- [ ] **D2.5 — Document the localizer RTL fix as brittle.** admin-brand.css patches Payload's RTL layout via a narrow selector. If a future Payload major version rewrites the localizer, the fix will silently break.
- [ ] **D2.6 — driver.js 900ms timeout may race on fast machines.** Refactor `setTimeout(() => d.drive(), 900)` to wait for `.yarit-dashboard__hello` via MutationObserver.
- [ ] **D2.7 — Move Track C animations into an explicit `@layer`.** Preventive cleanup.
- [ ] **D2.8 — Empty list `::before` illustration may clash with future native Payload empty states.** Switch to a conditional component wrapper if/when Payload ships a native one.
- [ ] **D2.9 — Document drifting leaves z-index stacking.** Add a CSS comment block documenting the expected z-order.
- [ ] **D2.10 — OrderRow mobile layout at 650px tablet portrait.** Consider adding an `sm:` (640px) tweak.
- [ ] **Restore `<details>` field helper on complex Product fields (Round 4 C7 ideal version).** Round 4 pivoted to "richer multi-line Hebrew descriptions with `•` bullets" because Payload 3.x's `admin.components.Description` slot is brittle. If a future Payload release makes component slots robust, upgrade `type` / `stock` / `status` on Products.
- [ ] **Verify Round 4 in a real browser.** Claude Preview MCP's virtual browser has limitations rendering Payload 3.x admin client components — spot-check the dashboard in a real browser to verify the time-synced greeting, tile stagger, drifting leaves, and driver.js tour all render correctly.

---

## 💤 Deferred / maybe

- [ ] Migrate `src/middleware.ts` → `src/proxy.ts` (Next 16 naming). Works as-is; migration is cosmetic.
- [ ] Revisit CLI seed script now that a working seed lives in `src/lib/seed.ts`.
- [ ] Remove `@swc-node/register` and `@swc/core` dev deps — installed exploring the CLI seed path but not used.
- [ ] Consider React Compiler (stable in Next 16) in Phase F for performance.

---

## ✅ Completed phases (full history in `docs/STATE.md`)

- **Phase A** — scaffolding, brand tokens, i18n
- **Phase B** — collections, globals, seed
- **Phase C** — storefront pages
- **Phase D** — checkout + payments (mock provider)
- **Phase E** — admin UX + fulfillment dashboard
- **Phase F partially** — infrastructure (Neon Postgres, Vercel Blob, first deploy) — remaining: account pages + SEO + responsive QA + a11y
- **Design Round 1** — Yarit-friendly admin re-skin
- **Design Round 2 (Waves 1+2)** — editorial storefront uplift + admin polish
- **Design Round 3 (Waves 1-4)** — Night Apothecary palette, Warm Night dark mode, drifting leaves, iridescent hero, logo halo, Bellefair font
- **Design Round 4** — Hero dark-light pocket + logo blur fix + 12 admin delight moves
- **Round 5** — emergency Vercel redeploy + purposeful-minimalism pass
- **Round 6** — hide misleading content-locale chip + theme-adaptive admin chrome
