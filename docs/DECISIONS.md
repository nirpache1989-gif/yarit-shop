# Decision log (ADRs)

Every significant architectural or product decision is logged here with a date and rationale. Append new ADRs at the top.

---

## ADR-012 — Phase H (organization pass) added to plan at client request

**Date:** 2026-04-10
**Status:** Accepted
**Context:** The client's #1 priority from day one was "if I open this project in another AI, it should understand everything with zero explanation from me." Phase A addressed this with CLAUDE.md + the `docs/` folder, and we've been updating STATE.md at the end of each session. But the client explicitly asked for a dedicated final pass at the end of all implementation phases — a focused day of documentation audit, dead-code removal, and navigation index creation — to make sure the project is genuinely AI-handoff-ready at whatever final size it reaches (potentially thousands of files).

**Decision:** Add **Phase H — Final organization pass (AI handoff readiness)** to the plan file, scheduled at the very end (after Phases F + G). It's a ~1-day focused pass covering: docs audit, file-header JSDoc audit, CLAUDE.md rewrite against final reality, `docs/INDEX.md` navigation map, dead code sweep, naming consistency pass, URL audit, env var audit, README rewrite, folder layout sanity check, final STATE.md snapshot, new `docs/ONBOARDING.md` targeted at fresh AI sessions, verification that a fresh AI can add a product category without asking questions.

**Consequences:**
- Phase H is **not** optional — it's the explicit deliverable the client cares about most.
- The ongoing discipline (updating STATE.md every session, writing JSDoc headers on new files as we go, recording ADRs here) remains what keeps the project AI-ready between now and Phase H. Phase H is just the final cleanup, not a substitute for consistent hygiene.
- Phase H intentionally runs AFTER Phase G (post-launch bonuses) so it reflects the real final shape, not an imagined one.

---

## ADR-011 — Fulfillment Dashboard as standalone route group, not Payload custom admin view

**Date:** 2026-04-10
**Status:** Accepted
**Context:** Phase E needed a "daily order queue" for Yarit. Two approaches existed:
1. **Payload-native custom admin view** — register a component at `admin.components.views.fulfillment` with path, exportName, meta.title. This is the "correct" way per Payload 3 docs.
2. **Standalone Next.js route in a new `(admin-tools)` route group** — `/fulfillment` URL, own layout, own brand theme.

A background research agent read the installed Payload 3.82.1 packages and surfaced multiple gotchas with the native approach: (a) component paths use runtime string references, not TS aliases; (b) the importMap regenerates on dev server boot and may not auto-register custom components; (c) `meta.title` alone doesn't add a sidebar link — that requires `admin.components.Nav` injection; (d) server-side data fetching inside a client component requires a wrapper pattern; (e) the component styling uses Payload's internal admin CSS which is separate from the Shoresh brand.

**Decision:** Build the Fulfillment Dashboard as a standalone Next.js route in a new `(admin-tools)` route group, with its own root layout that uses the Shoresh brand theme (Heebo font, parchment bg, serif display font). Auth is gated via `payload.auth({ headers })` which reads the JWT cookie set by Payload's login flow. Action buttons PATCH via Payload's built-in `/api/orders/[id]` REST endpoint, which already enforces the admin-only `access.update` rule.

**Consequences:**
- No Payload-specific plumbing — works immediately with zero custom view registration.
- Visual consistency with the rest of the site (same fonts, colors, CSS variables). For a non-technical user, this is actually BETTER UX than Payload's default admin theme.
- Uses Payload's built-in auth via `payload.auth({ headers })` so it still feels like part of the admin from a security standpoint.
- Trade-off: no sidebar link from Payload's native admin to `/fulfillment`. Yarit bookmarks it or navigates via the `(admin-tools)` layout's own header that links to "פאנל ניהול מלא" (back to Payload admin). Phase G can revisit if we want deeper integration.
- The middleware matcher had to be updated to exclude `/fulfillment` so next-intl doesn't intercept it for locale routing.

---

## ADR-010 — Design uplift per background-agent review

**Date:** 2026-04-09
**Status:** Accepted
**Context:** After Phase C shipped, the client reported the homepage felt "empty" despite having the AI-generated botanical background assets. I spawned a background design-review agent with access to the screenshots and component code, asking for a prioritized punchlist of specific improvements without changing the palette, existing sections, or introducing new image dependencies.

**Decision:** Implement the agent's H-priority items verbatim:
- `BranchDivider` primitive (inline SVG) between all major sections
- `SectionHeading` primitive with eyebrow + Frank Ruhl Libre serif + sprig flourishes
- 2 new sections: `MeetYarit` (personal story strip) and `Testimonials` (social proof)
- Invert `ProductCard` background colors (parchment body, white image viewport)
- Add paper-grain noise overlay via `body::before` with SVG fractal noise
- Use `newsletter-bg.jpg` as an ambient 20% background on `FeaturedProducts`
- Raise `ForeverSpotlight` background opacity 30% → 45%

Deferred: corner sprigs on product cards (D2), brand motto strip (F3), ingredient spotlight row (F4), typography polish on price (D3).

**Consequences:**
- Homepage went from 5 sections to 7 sections + 3 dividers — visual density roughly doubled without adding noise.
- The design now has consistent "connective tissue" between sections (dividers + eyebrows + serif headings) so the page reads as intentional rather than templated.
- Paper grain overlay adds a ~0.4KB inline SVG and a `mix-blend-mode` layer — no external asset, no perceptible perf impact.
- `SectionHeading` is now the canonical way to add section titles — future sections should use it.

---

## ADR-009 — Pluggable PaymentProvider + EmailProvider abstractions

**Date:** 2026-04-09
**Status:** Accepted
**Context:** Phase D needs a checkout flow but Yarit hasn't chosen a payment gateway yet and has no Resend account. We need the entire flow to run end-to-end in local dev without credentials, and to switch to real providers later without touching routes, pages, or business logic.

**Decision:** Build two parallel provider abstractions:
- `src/lib/payments/` — `PaymentProvider` interface, `mock` implementation (synchronous success), `meshulam` stub with implementation guide, `getPaymentProvider()` factory keyed on `PAYMENT_PROVIDER` env var
- `src/lib/email/` — `EmailProvider` interface, `mock` implementation (console logger), `resend` stub, `getEmailProvider()` factory keyed on `EMAIL_PROVIDER` env var

All of `src/lib/checkout.ts`, API routes, and pages depend only on the interfaces. The stubs for real providers throw explicit errors instead of silently no-op'ing so a broken production deploy fails loudly.

**Consequences:**
- Entire checkout flow works in local dev with zero credentials.
- Swapping to Meshulam (once Yarit signs up) is a one-file change: fill in `src/lib/payments/meshulam.ts` and set `PAYMENT_PROVIDER=meshulam` in the environment. Same for Resend.
- Adding a new provider (Tranzila, CardCom, Grow, Pelecard) is a new file in `src/lib/payments/` plus one line in the factory.
- No dev-only code paths leak into production because the factory picks based on env, not on `NODE_ENV`.

---

## ADR-008 — Seed runs as a dev-only Next.js API route, not a standalone CLI script

**Date:** 2026-04-09
**Status:** Accepted
**Context:** Phase B needed to import 8 real Forever product photos and create demo catalog data. Initial plan was a standalone `scripts/seed.ts` run via `tsx`. We hit three unrelated ESM/CJS interop issues in sequence:
1. `tsx` in CJS mode transpiled Payload's own ESM `loadEnv.js`, breaking the `@next/env` default-import pattern it uses.
2. `.mts` + native ESM hit the same issue because `tsx` still transformed Payload internals through its CJS hook.
3. `payload run --use-swc` failed with `ERR_REQUIRE_CYCLE_MODULE` because swc-node/register mixes CJS require with ESM imports.

**Decision:** Abandon the standalone CLI approach for now. Put the seed logic in `src/lib/seed.ts` exporting `runSeed(payload: Payload)`. Add a dev-only endpoint at `src/app/(payload)/api/dev/seed/route.ts` that calls `getPayload({ config })` inside the Next.js request pipeline (which already handles all the ESM/CJS correctly). The endpoint is gated on `process.env.NODE_ENV !== 'production'` and returns 403 otherwise.

**Consequences:**
- Seed flow is now: `npm run dev` → `npm run seed` (which curls the endpoint) → visit `/admin`.
- No extra transpiler dependencies needed (removed need for `@swc-node/register` and `@swc/core`; we keep them installed but don't use them).
- The seed can run against the in-process Payload instance, so there's no risk of a second Payload instance clashing with the dev server.
- In production the endpoint refuses to run. Production seeding (if ever needed) will use Neon's branching + Payload migrations, not this endpoint.

---

## ADR-007 — `fulfillmentStatus` is distinct from `orderStatus`

**Date:** 2026-04-09
**Status:** Accepted
**Context:** An order has two independent lifecycles: money and physical goods. Money flows pending → paid (or cancelled/refunded). Goods flow pending → packed → shipped → delivered. When an order contains Forever items, the goods lifecycle has extra states (`awaiting_forever_purchase`, `forever_purchased`) because Yarit has to source from Forever manually.

**Decision:** Model them as two separate select fields on the `Orders` collection:
- `orderStatus`: `pending | paid | cancelled`
- `fulfillmentStatus`: `pending | awaiting_forever_purchase | forever_purchased | packed | shipped | delivered`

When a paid order contains at least one Forever item, `fulfillmentStatus` is initialized to `awaiting_forever_purchase`. When all items are independent with stock available, it goes straight to `packed`. Yarit advances `fulfillmentStatus` manually from the Fulfillment Dashboard (Phase E).

**Consequences:**
- Customer-facing status UI reads `fulfillmentStatus` for "where is my order" messaging.
- Refunds / cancellations only touch `orderStatus`. A cancelled order can still have `fulfillmentStatus = 'packed'` temporarily while Yarit physically unpacks it.
- The two fields are independent but not orthogonal — certain combinations don't make sense (e.g. `orderStatus='pending'` with `fulfillmentStatus='shipped'`). Validation of impossible combos is deferred to Phase E.

---

## ADR-006 — Single Users collection with role discriminator, not separate Admins + Customers

**Date:** 2026-04-09
**Status:** Accepted
**Context:** Shoresh needs two kinds of users: Yarit (admin) and customers. Options:
- One `Users` collection with a `role: 'admin' | 'customer'` field
- Separate `Admins` + `Customers` auth collections

**Decision:** Single `Users` collection with a `role` field. Admin panel access is gated on `role === 'admin'` via `access.admin`. Customer-specific fields (phone, preferredLocale, addresses) are hidden from admins via `admin.condition`.

**Consequences:**
- Simpler mental model — one auth system, one login flow.
- Forever vs customer field visibility handled in the admin UI via `admin.condition` (same pattern as Products type discriminator).
- Fewer Payload collections = less admin sidebar clutter for Yarit.
- Trade-off: admins and customers share the same `users` table. If Shoresh ever grows to a multi-admin team or a customer-facing account system with complex RBAC, this might need to split. For a single-person shop it's overkill to split.

---

## ADR-005 — Middleware stays as `middleware.ts`, not `proxy.ts`

**Date:** 2026-04-09
**Status:** Accepted
**Context:** Next 16 deprecated `middleware.ts` in favour of `proxy.ts`. `proxy.ts` only supports the Node.js runtime, while `middleware.ts` supports both Node.js and Edge.

**Decision:** Keep `src/middleware.ts` for now. Next.js still supports it; the deprecation is a rename, not a removal. next-intl's middleware is the only middleware we run, and it's lightweight — migration is cosmetic, not functional.

**Consequences:**
- Slight deprecation warning in logs, which we can ignore.
- Migration to `proxy.ts` is a safe rename + function signature tweak. Deferred to Phase F polish.

---

## ADR-004 — SQLite for local dev, Neon Postgres for production

**Date:** 2026-04-09
**Status:** Accepted
**Context:** Payload CMS needs a database. Options: Postgres via Neon, SQLite (`@payloadcms/db-sqlite`), MongoDB (`@payloadcms/db-mongodb`). Yarit's friend (the dev) was unfamiliar with Neon and wanted local dev to "just work" without credentials.

**Decision:** Ship SQLite for local dev (zero config, zero credentials, single file `shoresh-dev.db`) and document the Neon swap for production in `docs/ENVIRONMENT.md`. The adapter is a one-file change in `src/payload.config.ts`.

**Consequences:**
- Local dev is instant, no signup flow.
- Schema differences between SQLite and Postgres are possible; Payload abstracts most of these away, but we should run full tests against Neon before every major release.
- Phase D deploy will require creating a Neon project and setting `DATABASE_URI` in Vercel env vars.

---

## ADR-003 — Next.js 16, not 15

**Date:** 2026-04-09
**Status:** Accepted
**Context:** The original plan targeted "Next.js 15 + Tailwind". `create-next-app@latest` installs Next 16.2.3. Payload 3.82.1's peer dependency on `@payloadcms/next` excludes Next 15.5.x but accepts `>=16.2.2 <17.0.0`. We downgraded to 15.5.15 briefly, hit the peer-dep exclusion, then upgraded back.

**Decision:** Use Next 16.2.3. It's current, supported by Payload, and the breaking changes (async `cookies`/`headers`/`params`, turbopack by default, `middleware` → `proxy` rename) are manageable.

**Consequences:**
- All server components must `await params` / `searchParams` — no synchronous access.
- `cookies()`, `headers()`, `draftMode()` must be awaited.
- `middleware.ts` is deprecated (see ADR-005).
- The original plan's "Next.js 15" references are outdated; treat them as "Next.js 15 or 16" wherever they appear.

---

## ADR-002 — Forever products flow through our cart + Meshulam, not deep-links

**Date:** 2026-04-09
**Status:** Accepted
**Context:** Early in planning we considered having Forever products deep-link to the official Forever Israel site with Yarit's distributor ID, so Forever would handle payment, fulfilment, and tracking. Yarit reversed this preference: she wants payment to land in her bank account directly, and is willing to handle fulfilment herself (she orders from Forever per-order at her distributor price, then ships to the customer).

**Decision:** All orders — Forever and independent — go through our own cart + checkout + Meshulam (or replacement gateway). The `type: 'forever' | 'independent'` field on each Product still exists, but it now means **fulfilment source**, not **sales model**. It gates:
- Whether stock is tracked (no for Forever — she orders on demand)
- How the order appears in the Fulfillment Dashboard (Forever orders go into a "needs sourcing" queue)
- Which help text appears in the admin when Yarit edits the product

**Consequences:**
- **Pro:** Higher margin (retail markup + distributor discount), one consistent customer experience, one invoice, one payment provider.
- **Con:** Yarit is legally the merchant of record for Forever sales too — she needs real T&Cs, returns policy, VAT handling, and up-front cash flow to buy from Forever per-order.
- Cleaner architecture: one checkout flow, one payment provider, one order model, one notification path.
- Requires a notification system: Yarit must be alerted when a new order arrives so she can source from Forever promptly.

---

## ADR-001 — Payload CMS 3 as the CMS + admin UI

**Date:** 2026-04-09
**Status:** Accepted
**Context:** Shoresh needs a CMS for products, orders, and content, plus an admin panel for a non-technical user (Yarit). Options considered:
- **Payload 3** — Next.js-native, TypeScript, embedded admin, open source, free
- **Sanity** — external SaaS, excellent content editing, but separate deployment and subscription
- **Strapi** — self-hosted, Node-based, older admin UX
- **Medusa** — more commerce-focused but needs a separate backend process

**Decision:** Payload 3, embedded into the same Next.js app.

**Consequences:**
- Single deployment target (one Vercel project).
- Admin UI auto-generated from collection schemas.
- Auth shared between storefront and admin (one Users collection with a `role` field).
- No external CMS subscription cost.
- Must stay alert to Payload's peer-dep constraints on Next versions (see ADR-003).
- Admin UX needs heavy customization for a non-technical user (Hebrew labels, help text, hidden fields) — this is why we gave it a dedicated Phase E in the plan.
