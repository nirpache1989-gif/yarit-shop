# Decision log (ADRs)

Every significant architectural or product decision is logged here with a date and rationale. Append new ADRs at the top.

---

## ADR-021 — Living Garden storefront redesign direction

**Date:** 2026-04-18
**Status:** Accepted — implementation pending user confirmation on 3 open questions (see `docs/NEXT-SESSION-PROMPT.md`)

**Context:** Yarit commissioned a full storefront redesign from an external designer. Deliverable: a high-fidelity HTML prototype + design brief at `/New/handoff/`. The direction — called **"Living Garden"** — is a warm, handmade, editorial apothecary aesthetic. The site literally grows as you scroll: leaves drift from the cursor, a vine draws itself along the right edge, cards tilt on hover, an ambient sound pill sits bottom-left, a marquee banner runs between sections.

The existing Copaia look (Night Apothecary palette + Bellefair/Heebo + GSAP Tier-1/Tier-S motion) is being replaced wholesale on the storefront. The Payload admin, database schema, i18n routing, auth, and all backend infrastructure stay.

**Decision:**

- **Adopt the Living Garden design direction** as the new visual identity for the storefront. Proceed with a phased implementation (Foundation → Chrome → Pages → Polish) documented in `docs/NEXT-SESSION-PROMPT.md`.

- **Full design reference lives at `docs/DESIGN-LIVING-GARDEN.md`** — single source of truth for tokens, typography, layout, components, motion, i18n, data model. All implementation sessions consult it first.

- **Preserve everything backend-side.** `src/collections/*`, `src/payload.config.ts`, `src/app/(payload)/*`, `src/components/admin/*`, `src/middleware.ts`, `src/lib/payments/*`, `src/lib/email/*`, `src/app/api/*` are out of scope. Only storefront presentation changes.

- **Schema additions (Phase 3.5):** add `plate` (`select`), `specimen` (`text`), `badge` (`select`) fields to `Products`. Add new `Posts` collection for the Journal page (slug, title, excerpt, body, tag, readTime, plate, coverImage, publishedAt — all localized where appropriate).

- **Motion: hybrid strategy.** Keep GSAP + ScrollTrigger for reveal-on-scroll (consistency with existing Tier-1 + Tier-S work). Implement cursor trail + spotlight + card parallax + scroll vine in vanilla React + CSS custom properties (lower overhead, simpler code, closer match to the prototype's `alive.js`).

- **Dark mode stays disabled.** The prior session's work (toggle returns null, bootstrap forces light, Payload `theme: 'light'`) holds. The new palette is light-only by design.

- **Brand name** — **open question awaiting user confirmation.** Prototype shows `Yarit°` (with degree mark + "— small apothecary" subtitle). This would be the third rename (Shoresh → Copaia → Yarit°). The domain, emails, invoices, social refs, admin meta all flip. User must decide whether to keep "Copaia" underneath a Living Garden visual, or rename.

- **Implementation path** — **open question awaiting user confirmation.** Either main-branch replacement on `feat/living-garden` (cleaner, bigger-bang reveal) or parallel `/garden/*` routes (safer, iterative user review). Recommendation in the prompt.

**Consequences:**

- Every storefront page gets rebuilt. Expect 3-5 implementation sessions across Phases 2-3.
- Brand config + globals.css + layout all get reworked in Phase 1.
- The current GSAP Tier-1 waves (MeetYarit converge, CategoryGrid expand, BranchDivider SVG draw-in, FeaturedProducts pin, etc.) get replaced with Living Garden equivalents. Reveal-on-scroll primitive carries forward.
- Existing dark-mode CSS stays in place but unused. Re-enabling dark mode in the new design would require separate work (new palette inversion on top of Living Garden, not the Warm Night palette).
- Photography is still TBD. Plate placeholders (gradient + botanical SVG overlay) ship first, real photos swap in during Phase 4.
- Email templates + PDF invoices + admin chrome continue using the Copaia (or Yarit°) brand string read from `brand.config.ts`. They do NOT inherit the Living Garden storefront look.

**Alternatives rejected:**

- **Incremental visual polish on current Copaia look** — rejected. The design brief is a full direction change, not a refinement. Partial adoption would produce an inconsistent middle state.
- **Abandon GSAP entirely and rebuild in plain CSS/vanilla** — rejected. The GSAP Tier-1 + Tier-S investment is real and the library is already tree-shaken. Hybrid is pragmatic.
- **Keep current i18n message keys and just translate the new Living Garden copy in place** — rejected. The messaging structure differs enough (new namespaces per page, shared brand namespace, ingredient vocabulary, handwritten accent strings) that a fresh message file per page reads more clearly than an edit-in-place.

---

## ADR-020 — Rename Shoresh → Copaia + wholesale catalog replacement

**Date:** 2026-04-11
**Status:** Accepted
**Context:** After ADR-019 (Forever removal) shipped, Yarit reviewed the live site one more time and decided the brand identity needed to change entirely. The word "Shoresh" (שורש, "root") was a placeholder picked in Phase A before she had a final name. Her chosen name is "Copaia" (קופאה, pronounced ko-PA-eh). At the same time, she delivered a new tree-with-roots logo illustration and a fresh set of 18 product photos covering 8 products — 4 of which are not in the current catalog.

The rename + catalog swap needed to ship together because:
1. The new product photos don't match the old 7 canonical slugs 1-for-1.
2. Some of the old slugs (`aloe-lip-balm`, `aloe-vera-gel`, `aloe-body-duo-gift-set`) have no corresponding new photos; they're being retired.
3. Leaving the code identity as "Shoresh" while the UI says "Copaia" would create a confusing dual-brand state in admin labels, email templates, i18n strings, and the Payload title suffix.

**Decision:**

- **Identity:** `brand.name.he = 'קופאה' / brand.name.en = 'Copaia'`. Tagline (`'שורשים של בריאות'` / `'Rooted in wellness'`) and description (`'Natural wellness shop — a curated personal selection from Yarit'`) are kept unchanged — the new tree-and-roots logo is literally a visual pun on "rooted" and the description is brand-agnostic. Only the etymology (the wordplay on שורש = root) is lost; the imagery-match actually improves.

- **Code rename scope:** every user-visible and technical reference to "Shoresh" / "שורש" outside historical docs is renamed. This covers 55 hits across i18n messages (he/en.json), email templates (Users.ts password-reset + adminTemplates.ts new-order alert), admin chrome (BrandLogo/BrandIcon refactored to read `brand.name.he` instead of hardcoding), Payload config (`titleSuffix`, email adapter rename `shoreshEmailAdapter → copaiaEmailAdapter`), product OG descriptions, `.env.example`, `.gitignore`, `scripts/reset-db.mjs`, the dev create-admin route, and the `globals.css:203` CSS selector `header img[alt="Shoresh"]` that would have silently broken dark-mode logo glow.

- **localStorage keys (`shoresh-theme`, `shoresh-cart`) are kept as-is.** Renaming them would reset theme + cart state for returning customers on the prod site. These are internal keys never surfaced in the UI — the mismatch between code name and LS key is acceptable in exchange for zero returning-user disruption.

- **SQLite dev filename renamed** `shoresh-dev.db → copaia-dev.db`. Both names are kept in `.gitignore` and `scripts/reset-db.mjs`'s cleanup list during a grace period so developers who pull the branch with an existing local DB don't get confused.

- **Logo asset:** the new Copaia JPG source is run through a PIL brightness-threshold color-key (brightness > 248 → fully transparent, 240–248 → linear fade) to produce a clean transparent PNG at `public/brand/copaia.png`. `rembg` was tried first but its AI segmentation mistook the cream leaf highlights for background and stripped the canopy — the explicit RGB threshold is more reliable for source images with a near-white background. File is renamed `logo.png → copaia.png` to force Turbopack's in-process Next Image cache to invalidate (clearing `.next/cache/images` alone was insufficient).

- **Catalog:** replaced wholesale with **8 products** (not the old 7):
  - **Dropped:** `aloe-lip-balm`, `aloe-vera-gel`, `aloe-body-duo-gift-set`
  - **Kept unchanged:** `aloe-toothgel`, `bee-propolis`, `daily-multivitamin`
  - **Renamed:** `aloe-soothing-spray → aloe-first-spray` (same Forever Aloe First product — the new name matches the supplier's marketing)
  - **New:** `aloe-drink` (Forever Aloe Peaches, 3 images), `aloe-heat-lotion`, `aloe-deodorant`, `bee-pollen`
  - SKUs for the 4 new products are left as `'TBD'` for Yarit to fill in from the admin (same pattern as the earlier `aloe-body-duo-gift-set`).
  - Featured slugs reshuffled to `aloe-drink` + `aloe-toothgel` + `daily-multivitamin` — the first two show off the new 3-image gallery.

- **`STATIC_IMAGE_OVERRIDES` removed entirely** from `src/lib/product-image.ts` + `src/lib/checkout.ts` + the product detail page. The map was both stale (it pointed at AI watercolor renderings of the old 7 slugs) and a structural blocker — it forced the detail page to render a single hardcoded image per slug, preventing the 3-image gallery from rendering even if the Media collection had multiple images. `resolveProductImage()` now falls through to `product.images[0].image.url` → `PRODUCT_PLACEHOLDER` fallback.

- **JSON-LD `Product.image`** on the product detail page now emits the full image array (was single-image only). Google Rich Results docs recommend an array for product schema.

**Consequences:**

- Every admin string, email subject, and OG title that a real human reads now says "Copaia" / "קופאה". No hybrid-brand leaks.
- Storefront is **not reseeded to prod** during this session — the dev DB was wiped and reseeded with the new 8-product catalog, but prod Neon still holds the old 7 Forever-era products. The next session's job is to either (a) have Yarit manually rebuild the catalog via the admin (21 image uploads, ~20 min of her time) or (b) write a one-off migration script (like the 2026-04-11 Remove-Forever migration) that uses Payload's local API to upload + swap the catalog atomically. Recommendation: option (a) — Yarit's eyes on every image is a feature, not a bug.
- Historical docs (`docs/STATE.md`, `docs/NEXT-SESSION-PROMPT*.md`, earlier ADRs) are **not rewritten**. Every existing entry still references "Shoresh" as the brand of record at the time the entry was written. The rename is current-state; historical facts stay historical.
- The 4 new products have draft descriptions based on the public Forever Living product line. Yarit can refine them via the admin after the prod swap.
- `public/brand/logo-parchment.jpg` and `public/brand/logo.png` (the Shoresh-era logo files) are deleted. `public/brand/ai/herobg3.jpg` is a new user-provided hero backdrop that replaces the previously-used `hero-bg-2.png` (not yet deleted — Track G can drop it in a follow-up).

---

## ADR-019 — Remove Forever terminology + collapse fulfillment workflow

**Date:** 2026-04-11
**Status:** Accepted
**Context:** After T2.9 shipped and the site went live, Yarit reviewed the admin panel and pushed back on the `Forever | Independent` product-type split plus the associated 2-extra-state fulfillment workflow. Her feedback: "Why does the system split orders between Forever and independent products when in practice I handle everything myself? When a customer orders, it should just show up as an order." The supplier-vs-stock distinction was a product-level reality she handled mentally by glancing at order line items — not something the system needed to enforce as a workflow state machine.

**Decision:** Collapse the fulfillment state machine from 6 states (`pending / awaiting_forever_purchase / forever_purchased / packed / shipped / delivered`) to 4 (`pending / packed / shipped / delivered`). Rename the product `type` enum from `forever | independent` to `sourced | stocked` to reflect the actual distinction — "do I inventory this at home" vs "do I order it from a supplier when someone buys". Remove the word "Forever" from every admin-visible label, schema, help text, asset filename, and i18n string. Drop the `foreverProductCode`, `foreverDistributorPrice` fields and the `SiteSettings.forever` distributor-metadata group entirely — they were dead code that nothing read at runtime.

**Consequences:**

- Yarit's per-order click count drops from 5 (for Forever orders) / 3 (for independent) to a uniform 3. The Fulfillment Dashboard renders 3 buckets instead of 5.
- The `Products.type` default changes from `forever` → `stocked` (a new product is most likely something she's bringing in-house, not outsourcing).
- **Prod DB migration required and shipped:** recreated 3 enum types (`enum_products_type`, `enum_orders_items_product_type`, `enum_orders_fulfillment_status`) in a transaction + dropped 4 deprecated columns. See `docs/STATE.md` 2026-04-11 night entry for the full migration SQL + verification. All 7 products landed in `sourced` (the seed had set them all to `forever`, which mapped to `sourced` under the new enum).
- The factual business relationship (Yarit sources some products from a specific supplier per-order) is unchanged — just no longer exposed in the schema.
- Backward compat: the Zustand cart store's persist-layer has a v1 → v2 migration for returning customers whose localStorage still holds `forever` / `independent` values.

---

## ADR-018 — No partial `generateStaticParams` on dynamic routes

**Date:** 2026-04-11
**Status:** Accepted
**Context:** On the 2026-04-11 close-out deploy of `e3a8a53` (GSAP Tier-1 finish + mobile audit fixes), every product detail page started returning 500 in production. Root cause turned out to be a latent bug shipping quietly since the Phase F.1 hardening sprint in early April: three dynamic routes (`[locale]/product/[slug]`, `[locale]/reset-password/[token]`, `[locale]/account/orders/[id]`) each declared a `generateStaticParams()` that returned only `{ locale }` — the second dynamic segment was never enumerated.

Next 16 treated each route as `●` SSG-eligible because *some* params were returned. At build time Next had no concrete slug to prerender and left the shell as "generate on first request, then cache". At runtime, the first request was rendered inside Next's static-generation context, which disallows `headers()`. next-intl's `setRequestLocale` reaches `headers()` via an `AsyncLocalStorage` fallback and throws `DYNAMIC_SERVER_USAGE` → the user sees a generic 500.

**Why it was latent:** `npm run dev` renders every route dynamically regardless of `generateStaticParams`, so the bug never appeared in dev. It only surfaces under `npm run build && next start` (or on Vercel prod). Every pre-push verification in `docs/STATE.md` cites `npm run dev` as the runtime — that's why this survived from Phase F.1 through the 2026-04-10 prod deploy.

**Decision:** Two-part rule:

1. **Either return full params from `generateStaticParams` or omit the function entirely.** For a two-segment route `[locale]/product/[slug]`, "full" means iterating every real `(locale, slug)` combination — i.e. querying Payload for every published product slug and emitting one entry per `locale`. Anything less is forbidden.

2. **Run a prod-mode smoke before pushing any storefront route change.** `npm run build && npx next start -p <free-port>`, then curl the 16 smoke-test routes from `docs/STATE.md`. Dev mode is insufficient because it hides the SSG classification entirely.

The fix in `4ea4d90` deleted `generateStaticParams` from all three affected routes and left a per-file comment explaining why the function is intentionally absent.

**Enforcement:**

- **`docs/CONVENTIONS.md`** § "generateStaticParams — all or nothing" — normative rule with rationale.
- **`.github/workflows/ci.yml`** — a CI step greps every storefront page for `generateStaticParams` returning only `{ locale }` and fails the build on a match. Prevents re-introduction.
- **Per-file comments** on the three fixed pages point future contributors at this ADR.

**Consequences:**

- Every storefront dynamic route is now classified `ƒ` Dynamic, not `●` SSG. Cold-start latency on the first request for a given slug is marginally higher than a prerendered page, but well within acceptable latency for a small shop and avoids an entire class of runtime 500s.
- If we later want true SSG for product pages (for SEO / perf), the migration requires iterating Payload in `generateStaticParams` and returning the full `(locale, slug)` matrix — the partial-params shortcut is off the table forever.
- The SSG incident post-mortem lives in `docs/STATE.md` under "Latest (2026-04-11 late)".

---

## ADR-017 — Centralize product image resolution in `lib/product-image.ts`

**Date:** 2026-04-10
**Status:** Accepted
**Context:** During the post-rebrand polish, `ProductCard.tsx` carried a private `STATIC_IMAGE_OVERRIDES` map that mapped product slugs to static photos in `public/brand/ai/`. The map exists because Vercel Blob isn't wired up yet (ADR-015 + Phase F gap), so the Media collection's `/api/media/file/…` URLs return 404 in production. The override let the shop grid bypass the broken Media URLs and ship real photos as part of the static Next.js build.

The bug: only the product grid used the override. `AddToCartButton` snapshotted the raw Media URL into the cart store, so the cart drawer + `/cart` page rendered a broken `/api/media/…` next/image src that returned HTTP 400 from the optimizer. Same issue on the product detail page (`/product/[slug]`) and on order line items snapshotted by `lib/checkout.ts`.

**Decision:** Extract the override map into `src/lib/product-image.ts` exporting:
- `STATIC_IMAGE_OVERRIDES` — the slug → URL map (the single source of truth)
- `PRODUCT_PLACEHOLDER` — the shipped fallback path
- `resolveProductImage(product)` — the helper everything calls

ProductCard, AddToCartButton, the product detail page, and the checkout snapshot all import from this module. Adding a new product photo is now a single-line edit in `lib/product-image.ts` plus dropping the file in `public/brand/ai/`.

**Consequences:**
- One place to flip when Vercel Blob comes online — delete the map and `resolveProductImage` falls through to Media URLs everywhere automatically
- Cart line items now snapshot a stable URL that survives Media record changes
- Order receipts (and the admin order view) render the right image even if the Media collection is wiped
- Coupling cost: every component that renders a product image now has a tiny dependency on this file. Acceptable — the alternative is duplicate maps that drift, which is exactly the bug this fixes

---

## ADR-016 — Cart drawer regression: globals.css `body > *` rule must be layered

**Date:** 2026-04-10
**Status:** Accepted
**Context:** Yarit reported the cart button was unclickable on production after the rebrand deploy. A Playwright probe revealed: the click event fired, the cart store updated (item correctly added to localStorage), and the dialog `<div>` was inserted into the DOM with `class="fixed inset-0 z-50"` and `role="dialog"`. But its bounding box was `{x:0, y:2649, width:1280, height:0}` — i.e., positioned at the bottom of the document with zero height, instead of covering the viewport.

Root cause: `src/app/globals.css` had an unlayered rule:

```css
body > * {
  position: relative;
  z-index: 2;
}
```

It exists to keep page content above the parchment grain pseudo-element on `body::before`. In Tailwind CSS v4, `@import "tailwindcss"` puts all utilities (including `.fixed`) inside `@layer utilities`. **Unlayered styles win against any layered styles**, regardless of selector specificity. So the drawer's `.fixed` utility (specificity `(0,1,0)`) was beaten by the unlayered `body > *` rule (specificity `(0,0,2)`). The drawer flipped to `position: relative` and laid out in document flow with no inherited height, becoming invisible.

**Decision:** Wrap the global body styles in `@layer base` and explicitly exclude `[role="dialog"]` from the `z-index: 2` rule for extra safety:

```css
@layer base {
  body::before { … }
  body > *:not([role="dialog"]) {
    position: relative;
    z-index: 2;
  }
}
```

Now Tailwind utilities (which sit in `@layer utilities`, a higher cascade priority than `@layer base`) win against the body rule, and the drawer renders as `position: fixed`.

**Consequences:**
- Cart drawer works on production
- Any future custom CSS in `globals.css` should default to being inside `@layer base` (or `components` / `utilities` as appropriate). Unlayered rules in a Tailwind v4 project are a footgun that silently overrides utilities
- Added `scripts/probe-cart.mjs` — Playwright probe that detects this class of regression by checking the actual rendered bounding box of the dialog after a click, not just whether the DOM node exists. Run with `node scripts/probe-cart.mjs https://yarit-shop.vercel.app`

---

## ADR-015 — Customer-facing rebrand: drop all Forever mentions

**Date:** 2026-04-10
**Status:** Accepted
**Context:** After the first production deploy went live, Yarit reviewed the site and sent explicit feedback: she doesn't want to publicly advertise her Forever Living distributor relationship. Verbatim (Hebrew): "Delete the whole distributor thing, I don't want to advertise the company at all, and as little as possible that I'm connected to the company. The word 'Forever' should be last."

The challenge: the architecture was built with Forever as a first-class concept — the `type: 'forever' | 'independent'` discriminator, the `ForeverSpotlight` homepage section, Forever badges on product cards, "Forever" nav links, filter chips, a rich `foreverProductCode` admin field, and 5 out of 10 seed products had Forever-branded titles ("פוראבר דיילי", "Forever Bright Toothgel", etc.).

**Decision:** Scrub every **customer-facing** reference to Forever while keeping the **internal** architecture 100% intact. Specifically:

**REMOVED (customer-facing):**
- `src/components/sections/ForeverSpotlight.tsx` — file deleted, section removed from homepage composition
- Header nav "Forever" link
- Shop page "Forever" filter chip (kept only category filter)
- ProductCard "Forever" badge (now only shows "New" when `isNew`)
- Product detail page "Forever Living" badge
- Footer "Forever Living" link
- Hero subheadline "Forever Living and a curated selection from Yarit" → "a curated personal selection from Yarit"
- TrustBar "authorized Forever distributor" label → "carefully curated"
- About page "an authorized Forever Living distributor" mention
- All i18n strings in he.json + en.json with Forever references
- Seed product titles: Hebrew "פוראבר ברייט", "פוראבר דיילי", "פוראבר בי" etc. → generic Hebrew names. English "Forever Bright Toothgel" etc. → generic English names.
- Seed product slugs: `forever-bright-toothgel` → `aloe-toothgel`, `forever-bee-propolis` → `bee-propolis`, `forever-daily` → `daily-multivitamin` (plus a few cleanup renames of other slugs)
- `brand.config.ts` `description` field

**KEPT (internal):**
- `Products.type: 'forever' | 'independent'` discriminator — drives routing
- `Products.foreverProductCode` admin-only field — Yarit's supplier SKU
- `Products.foreverDistributorPrice` admin-only field — margin tracking
- `Orders.fulfillmentStatus = 'awaiting_forever_purchase'` state
- `/fulfillment` admin dashboard's "לטיפול דחוף — להזמין מפוראבר" queue
- Admin new-order email's ⚠️ Forever warning banner to Yarit
- `src/lib/seed.ts` internal variable name `FOREVER_PRODUCTS` (just a code identifier)
- `SiteSettings.forever` admin group (distributorName, distributorId — admin-only config)
- Comments in code explaining the distinction

**Tooling added:**
- `?wipe=1` option on `POST /api/dev/seed` that deletes products/categories/tags/orders/media/non-admin-users before re-seeding. Lets us idempotently re-seed against Neon without re-provisioning the database.

**Consequences:**
- The customer experience now reads as "Yarit's curated natural wellness shop" instead of "Yarit's Forever Living distributor shop". The products still happen to come from Forever but that's invisible to the customer.
- Yarit's internal workflow (sourcing from Forever per-order, the fulfillment state machine, the admin queue) is completely unchanged.
- If Yarit later signs up to sell other brands' products (independent of Forever), the `type` discriminator still works — she'd just pick `independent` and manage stock herself, and both types render identically to customers.
- Follow-up bug fixed: the rebrand renamed slugs, but the seed's `isFeatured` check still referenced the old slug names, so the Featured Products section rendered empty on the first rebrand deploy. Fixed in a follow-up commit.

---

## ADR-014 — Production deploy infrastructure: Neon + Vercel + Blob

**Date:** 2026-04-10
**Status:** Accepted
**Context:** First production deploy for the Phase A–E + design polish build. Decisions on DB, media storage, deploy platform, and the env-branching strategy.

**Decisions:**

1. **DB: Neon Postgres (EU Central / Frankfurt)** — free tier, 0.5 GB storage, auto-suspend. Frankfurt is the closest region to Israel on the free tier (~60ms). Connection string lives in Vercel env vars only — never committed.

2. **DB adapter selection by env var format** — `src/payload.config.ts` picks the Payload DB adapter based on `DATABASE_URI` shape: `postgres://` or `postgresql://` → `postgresAdapter` (production); anything else (including `file:./...`) → `sqliteAdapter` (local dev). This keeps local dev zero-config while production runs on a real database, with no `if (NODE_ENV === 'production')` branching anywhere.

3. **Postgres `push: true`** — the adapter is configured with `push: true` so Drizzle syncs the schema on boot without committed migration files. This is suitable for MVP and early deploys (no schema history, fast iteration) but should be swapped for real migrations via `payload generate:migration` + `payload migrate` before the site sees real traffic or before we make breaking schema changes.

4. **Media: Vercel Blob via `@payloadcms/storage-vercel-blob` plugin, conditionally** — the plugin is added to Payload's `plugins` array only when `BLOB_READ_WRITE_TOKEN` is set. Local dev stores uploads in `./media/` (gitignored); production stores them in Vercel Blob. Vercel auto-injects the token when a Blob store is linked to the project — no manual copy-paste.

5. **Deploy platform: Vercel** — native Next.js integration, same company. Free "Hobby" tier is enough for the first year at Shoresh's expected volume.

6. **`vercel.json` with explicit `framework: nextjs`** — the first deploy failed because Vercel auto-detected the framework as "Other" (probably because the `vercel link` call happened while my CWD was momentarily at the parent directory which had a rogue package.json). Committing `vercel.json` to the repo locks the framework preset regardless of where `vercel link` is run from. This is the recommended pattern for any Next.js project and prevents future confusion.

7. **Repo: public** — `github.com/nirpache1989-gif/yarit-shop` is public. The brand name "Shoresh" is a placeholder — when the final name is picked, the rename is a one-file change (`src/brand.config.ts`) because Phase A enforced brand-data centralization.

**Consequences:**
- Local dev still works offline with zero external credentials (SQLite).
- Production DB + media are fully managed, auto-scaling, and auto-suspending.
- Swapping to a different hosting platform later (Fly.io, Railway, self-hosted) requires: (a) new DB URL, (b) new media storage plugin (or `@payloadcms/storage-s3` with R2), (c) new build target. Nothing architectural changes.
- The free-tier constraints (Neon 0.5 GB, Vercel Blob 1 GB, Vercel Hobby no custom build machines) are MORE than enough for MVP.
- Phase F still needs to land the `/account` page, full responsive QA, SEO metadata, and the image fix (see `docs/NEXT-SESSION.md`).

---

## ADR-013 — Git history rewrite to fix commit author

**Date:** 2026-04-10
**Status:** Accepted
**Context:** After pushing the initial commit to GitHub, the client noticed that both commits (the create-next-app scaffold AND the Phase A–E feature commit) were authored by **Albert Shovtyuk <wazahaka@gmail.com>** instead of the client's own identity **Nir Pace <nirpache1989@gmail.com>**. The global git config was ALREADY set to Nir Pace correctly; no local config, no environment variables, no hooks overriding. Root cause unclear — likely a cached credential from a Git Credential Manager / Windows identity broker that injected a different identity at commit time, bypassing the config files.

**Decision:** Rewrite the git history via an **orphan branch** approach:
1. Create `fresh-main` as an orphan (no parent)
2. Stage all files from the working tree
3. Commit with explicit `GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL` / `GIT_COMMITTER_*` env vars forcing the Nir Pace identity
4. Delete the original `main` branch
5. Rename `fresh-main` → `main`
6. Force-push with `--force-with-lease` (safer than `--force` — fails if someone else pushed in the meantime)

The repo was 1 day old, public, with zero forks or external clones, so rewriting history was safe — no one lost anything.

**Consequences:**
- `github.com/nirpache1989-gif/yarit-shop` now shows ONE clean commit authored by Nir Pace with the full Phase A–E message.
- The create-next-app scaffold commit (with Albert's name) is permanently gone from history.
- LOCAL git config (`git config --local user.name "Nir Pace"`) was also set explicitly inside the yarit-shop repo to guarantee future commits don't regress.
- Global git config already had Nir Pace set — the mystery of WHY the first commits used Albert's name remains unresolved but doesn't matter because local+explicit env var setting now prevents recurrence.
- If the issue recurs on a future commit in this repo, the fix is to pass `GIT_AUTHOR_NAME`/`GIT_AUTHOR_EMAIL` explicitly inline: `GIT_AUTHOR_NAME="Nir Pace" GIT_AUTHOR_EMAIL="nirpache1989@gmail.com" git commit ...`

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
