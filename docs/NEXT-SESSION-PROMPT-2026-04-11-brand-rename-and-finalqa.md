# Next session — brand rename + 3-image product galleries + admin UX + final QA

> **Purpose:** This session covers the remaining work to fully finish Shoresh for Yarit. It's
> the **broadest single session** we've planned, so pace yourself and don't try to do
> everything in one sitting if the brand rename or the 21 product images alone eat the
> budget. The work splits cleanly into 7 tracks (A–G below); you can ship them in any order,
> but the brand rename (A) must come first because everything else references the brand
> constants.
>
> **Read this file top to bottom, then `CLAUDE.md`, then the top entry in `docs/STATE.md`
> ("2026-04-11 night — Remove Forever terminology + collapse fulfillment workflow"). Only
> then start working.** The previous ready-prompts are archived at
> `docs/NEXT-SESSION-PROMPT-2026-04-11-final-qa-polish.md` (written by the previous session,
> superseded by this one), `docs/NEXT-SESSION-PROMPT-2026-04-11-t2.9-homepage-orchestration.md`,
> `docs/NEXT-SESSION-PROMPT-2026-04-11-cleanup-and-tier2-lite.md`, and
> `docs/NEXT-SESSION-PROMPT-2026-04-11-close-out.md`. Historical; don't read unless you want
> context.

---

## 🛟 SAFETY NET

**Last known-good commit is `4855824`** (docs update on top of `8d50bd4`, the "Remove
Forever terminology + collapse fulfillment workflow" ship). `main` and `origin/main` both
point there. Prod (`yarit-shop.vercel.app`) is live at `dpl_EFBBXQ1ZKxrDe2T7ZJTcQTBsJzui`
running code from `8d50bd4`, and the Neon DB has been migrated in-place to match (7 products
at `type='sourced'`, enum types recreated, deprecated Forever columns dropped).

**Before you start Track A (brand rename), cut a feature branch:**

```bash
cd C:/AI/YaritShop/yarit-shop
git fetch origin
git checkout origin/main
git checkout -b feat/brand-rename             # or feat/admin-ux, per track
```

Work on the feature branch. `main` stays on `4855824` until the user says "push". Prod
stays live on `dpl_EFBBXQ1ZKxrDe2T7ZJTcQTBsJzui` until `npx vercel --prod --yes`. **Never
push to main and never deploy without explicit user approval.**

Track-by-track commits on the feature branch are fine — the branch can hold 10+ commits
across multiple tracks if you're working through them sequentially. Fast-forward merge to
main at the end of the session once the user says "push".

**Prod DB note:** the brand rename (Track A) does NOT require a DB migration — `brand.name`
is a compile-time config constant, not a DB column. But Track C (legal markdown) DOES touch
`content/legal/*` which is file-system, not DB. No migration needed for any of this session's
work.

---

## Status inherited from previous session

### Production

- **LIVE at `https://yarit-shop.vercel.app`** at `8d50bd4` via `dpl_EFBBXQ1ZKxrDe2T7ZJTcQTBsJzui`
- Neon DB migrated: 7 products at `type='sourced'`, enum types
  `enum_products_type` / `enum_orders_items_product_type` / `enum_orders_fulfillment_status`
  all recreated with new values only. Deprecated columns
  (`forever_product_code`, `forever_distributor_price`, `forever_distributor_name`,
  `forever_distributor_id`) dropped.
- 40 routes build cleanly, zero `●` SSG, tsc + lint + build all green
- Bug-fix regression test (2026-04-11 `immediateRender: false` blank-cards pattern) still
  passes on prod

### Motion layer

- T1 + Tier-2 lite + T2.9 all shipped:
  - Hero exit parallax tightening, TrustBar scale reveal, MeetYarit word cascade,
    CategoryGrid desktop header pin, Testimonials horizontal cascade, BranchDivider→next-
    section coordination, admin HelpButton mini-guide popover, Forever terminology removal
    + fulfillment workflow collapse

### Docs

- `docs/STATE.md` — top entry describes the Remove-Forever ship (what you should read first)
- `docs/YARIT-ADMIN-GUIDE.md` — long-form admin guide, likely needs a spot-check after the
  Forever removal (possibly a few stale lines)
- `CLAUDE.md` business-model section was rewritten to describe `sourced`/`stocked` without
  Forever terminology; rule #6 updated to match
- Legal markdown folders (`content/legal/{privacy,returns,shipping,terms}/`) are EMPTY — still
  waiting on Yarit + her lawyer

### Still deferred or follow-up

- `docs/DECISIONS.md` ADR-019 entry hasn't been written yet (the code references ADR-019 from
  multiple comments). Needs ~30 lines in the standard ADR format.
- `docs/FULFILLMENT.md` still describes the old 6-state workflow — needs a short update to
  the 4-state flow (`pending → packed → shipped → delivered`).
- `docs/YARIT-ADMIN-GUIDE.md` spot-check for stale wording about product-type split.
- Unused devDependency cleanup: `@swc-node/register` + `@swc/core` (trivial `npm uninstall`).
- Track A handoff items that Yarit is providing this session or already has: see Tracks A
  (brand assets) and C (external inputs) below.

---

# The 7 tracks

Each track is independent enough to commit and verify separately. **Recommended order:
A → D → B → F → C → E → G**, but any order that lets you batch visual verification works.

---

## Track A — Brand rename + logo + 3-image product galleries

**This is the biggest single track. Budget ~40% of the session for it.** Split into 3
sub-tracks:

### A.1 — Brand name + tagline rename

The user is changing the shop's brand identity. The current identity is:

```ts
// src/brand.config.ts
name: { he: 'שורש', en: 'Shoresh' }
tagline: { he: 'שורשים של בריאות', en: 'Rooted in wellness' }
description: { he: 'חנות מוצרי טבע ובריאות — מבחר אישי של ירית',
               en: 'Natural wellness shop — a curated personal selection from Yarit' }
```

**⚠ BLOCKER AT SESSION START:** you do not yet know the new brand name. **Ask the user for
the new `name.he`, `name.en`, `tagline.he`, `tagline.en`, and (if different) `description`
BEFORE touching any file.** Use `AskUserQuestion` with a single 4-option multi-select or a
free-form prompt. Don't guess. A brand name is identity — get it right on the first pass.

Once you have the new name, the rename is mostly a single-file change to `src/brand.config.ts`
and then a hunt for any place that hardcodes "שורש" / "Shoresh" outside that config. Known
hotspots to check:

- `src/messages/he.json` + `src/messages/en.json` — many i18n strings reference the brand
  name. Grep for `שורש|Shoresh` and audit every hit. Some (headline, footer attributions,
  email subject lines) need to be updated; others (product descriptions, category names) are
  legitimately independent and must stay.
- `src/lib/email/*` — the customer-facing order confirmation and the admin new-order alert
  both render "שורש — ..." in the subject and the template header. Templates read from
  `brand.config.ts` for most things but there may be inline string literals.
- `src/app/(storefront)/[locale]/page.tsx` + layout files — look for SEO metadata, titles,
  descriptions, OpenGraph data.
- `src/globals/SiteSettings.ts` — uses brand constants for defaults but may hardcode the
  name in the global label.
- `src/collections/Users.ts` + `Products.ts` + `Orders.ts` + etc — Payload collection
  `labels.singular` and `labels.plural` — shouldn't reference brand name, but check.
- `docs/STATE.md`, `docs/ARCHITECTURE.md`, `docs/BRAND.md`, `CLAUDE.md` — the docs
  unavoidably reference the current brand. Update the "what Shoresh is" intro in each. **Do
  not** do a global find-replace on "Shoresh" in docs — historical entries in STATE.md that
  reference "Shoresh commit `<hash>`" should stay as-is because they're historical facts
  about that ship.
- `public/manifest.json` / favicon metadata — if the PWA manifest hardcodes a name, update it
- OpenGraph / Twitter card metadata in `src/app/layout.tsx` or per-route metadata
- Any hardcoded `alt` attributes on the logo `<Image>` tags (some use `brand.name.en` via
  props, others may hardcode)

**Workflow:**
1. `git grep -n "שורש\|Shoresh"` — get the full hit list (should be ~60-80 hits)
2. Update `src/brand.config.ts` first
3. Walk the grep hits file by file, updating only the ones that truly reference the brand
4. Re-grep until only historical / intentional hits remain (STATE.md entries, git commit
   messages, archived docs)
5. `tsc + lint + build` green
6. Smoke test: homepage title bar, footer, email preview

### A.2 — Logo swap

Current logo file: `public/brand/logo.png` (500x750 PNG). Also referenced as
`public/brand/logo-parchment.jpg` which is a watercolor-over-parchment variant.

When the user provides the new logo file(s):

1. Ask the user to drop the file at `public/brand/logo-new.png` (or whatever filename makes
   sense — ask which filename to use). The file should be a high-res PNG with transparent
   background, ideally ≥1024px on the longest edge so the `width={500} height={750}` render
   in `HeroMotion.tsx` doesn't blur.
2. If the new logo replaces the old one wholesale (recommended, simplest): `git mv
   public/brand/logo.png public/brand/logo-old.png` + rename the new file to `logo.png`. All
   existing `<Image src="/brand/logo.png">` calls pick it up automatically. Delete
   `logo-old.png` after the smoke test.
3. If the user wants to keep both side-by-side for a transition period: give the new file a
   distinct name like `public/brand/logo-v2.png` and update the 3-4 places that reference
   `/brand/logo.png` (HeroMotion, Header, admin-brand.css background references, Footer if
   any).
4. Check `public/brand/logo-parchment.jpg` — if it still matches the brand, leave it; if the
   new brand doesn't use the parchment variant, delete it and update the ~1 place that
   references it (Header fallback).
5. **Favicon + PWA icons**: the favicon is generated from the logo. If Next.js auto-generates
   it from `public/favicon.ico` or the app-folder convention, drop a new `favicon.ico` +
   `apple-touch-icon.png` + `icon.png` / `icon.svg` as needed. Check `src/app/favicon.ico`
   and `src/app/icon.*` for the current setup.
6. **Social card / OG image**: the `/opengraph-image.*` convention generates the social share
   card. If there's a hand-crafted `public/og-image.jpg` or similar, update it; otherwise
   Next regenerates at build time.

**Smoke test for A.1 + A.2 combined:**
- Homepage hero shows new logo + new headline
- Header shows new logo
- Footer shows new brand name
- `<head>` has new `<title>` + OG tags (inspect via `preview_eval(document.title + document.querySelector('meta[property="og:title"]').content)`)
- Customer order-confirmation email preview (hit `/api/checkout` in mock mode → the mock
  email provider logs to console; inspect the rendered text)

### A.3 — 3-image product galleries

Today, each of the 7 canonical products has 1 (occasionally 2) photo from the
2026-04-09 WhatsApp screenshot session. The product detail page
(`src/app/(storefront)/[locale]/product/[slug]/page.tsx`) renders a `<ProductGallery>`
component (via `ProductGalleryMotion.tsx` — the T1.7 Flip animation) that supports multiple
images. The `<ProductCard>` on the homepage / shop shows only the first image. The
`STATIC_IMAGE_OVERRIDES` map in `src/lib/product-image.ts` maps each slug to a single static
URL as a fallback.

**The user is generating 21 new product images as we speak** (3 per product × 7 products).
When they land:

1. **Ask the user where the new images are.** A likely location is `assets/` (the
   project-root drop folder the seed script already uses), or a new subfolder like
   `assets/product-v2/<slug>/{hero,detail-1,detail-2}.jpg`. Ask for the convention before
   creating folders.
2. **Decide the naming convention.** Options:
   - **Flat, slug-prefixed**: `aloe-lip-balm-1.jpg`, `aloe-lip-balm-2.jpg`,
     `aloe-lip-balm-3.jpg`. Simplest, works with a tiny glob.
   - **Slug folders**: `assets/products/aloe-lip-balm/1.jpg`, `.../2.jpg`, `.../3.jpg`.
     Cleaner if we add more products later.
   - Recommend the folder convention — the seed script can just iterate each slug's folder.
3. **Put them where they're actually served.** There are two paths:
   - **Via Payload Media** (recommended for the long term): the seed script already handles
     uploading files via `payload.create({ collection: 'media', filePath, ... })`. The
     uploaded media lives in `public/media/` (via Payload's static adapter) and is referenced
     by the `images` array on each product (which is an array of `{ image: mediaId }`
     objects). Updating the seed to iterate the new folder is ~20 lines.
   - **Via `STATIC_IMAGE_OVERRIDES`** (the current override path): for each slug, map to the
     first image as the card override. This is the simple path the current code takes to
     sidestep Vercel Blob quirks.
   - **Both**: push through Payload Media so the product detail gallery renders all 3, AND
     update `STATIC_IMAGE_OVERRIDES` so the card shows the new first image. This is what we
     want.
4. **Update `src/lib/seed.ts`:**
   - Change each `SOURCED_PRODUCTS` entry's `files: ['WhatsApp Image ...']` to the new
     filenames (3 each).
   - Verify the upload loop handles 3 media rows per product (it already does — the loop
     just iterates `p.files`).
   - Update `STATIC_IMAGE_OVERRIDES` in `src/lib/product-image.ts` to point at the new first
     image.
5. **Rewipe + reseed the dev DB**: the cleanest way to replace existing product images is to
   wipe the `products` + `media` rows and re-run the seed. Use
   `curl -X POST 'http://localhost:3000/api/dev/seed?wipe=1'` (dev endpoint, gated on
   `NODE_ENV !== 'production'`).
6. **Prod DB update**: same approach won't work on prod (endpoint is disabled in production).
   Options:
   - **Option 1 — Manual upload via admin**: Yarit clicks into each of the 7 products,
     deletes the old image(s), drags in the new 3, saves. 7 × 3 = 21 manual uploads. The
     admin already handles image upload nicely. This is the safest option because Yarit's
     eyes are on every image. ETA ~20 min of her time.
   - **Option 2 — Pulled env + direct DB + Payload Media upload script**: write a one-off
     Node script (like the Remove-Forever migration) that uses Payload's local API to upload
     the 21 new media files to the prod Media collection and update each product's `images`
     array. Needs DATABASE_URI from Vercel + Payload Blob storage access. ~80 lines of code,
     riskier but zero manual work.
   - **Option 3 — Vercel Blob**: if prod is configured to use Vercel Blob for media (check
     `payload.config.ts` upload adapter config), uploads flow through a different path.
   - **Recommendation**: Option 1. Yarit is going to want to see every image as it goes in,
     and this is a visual task that benefits from a human in the loop. The next-session
     Claude agent can sit with Yarit while she does it, take screenshots, and verify the
     shop displays each one correctly.
7. **Verify the ProductGallery renders all 3.** Open `/en/product/aloe-lip-balm` (or
   whichever product has 3 new images) and confirm:
   - Main image shows image #1
   - Thumbnail strip has 3 thumbnails (verify the count)
   - Clicking thumbnail #2 flips the main image to #2 via the T1.7 Flip animation
   - Keyboard arrow keys work to navigate (accessibility)
   - On mobile (375×812), the gallery layout doesn't break
8. **SEO/OpenGraph per-product**: the product detail page renders a `schema.org/Product`
   JSON-LD with an `image` array. Currently it only picks the first image. Verify the
   JSON-LD includes all 3 after the change (or update if not).

### A.4 — Hero background / watercolor assets

Some of the `public/brand/ai/*.jpg` watercolor backgrounds may still feel "Forever-branded"
(they were generated with the old identity in mind — aloe, sage, honey motifs). Audit:

- `public/brand/ai/hero-bg-*.jpg` — the homepage hero botanical wash
- `public/brand/ai/about-hero.jpg` — MeetYarit image column
- `public/brand/ai/cat-*.jpg` — the 5 AI category tile fallbacks
- `public/brand/ai/icon-*.png` — TrustBar icons (4 transparent PNGs)
- `public/brand/ai/empty-*.jpg` — empty-state illustrations

If the new brand keeps the same natural / botanical vocabulary (likely), these assets stay.
If the new brand is a hard visual pivot (e.g., a clean minimal aesthetic instead of
watercolor), the user will need to generate replacements. **Ask** before assuming either way.

---

## Track B — Admin panel UX improvements

**Budget ~15% of the session.** Yarit will be the daily user of the admin; any small
friction compounds over months. Focus on the 1-5 highest-leverage improvements. The session
doesn't need to ship every idea — pick the 3-4 that feel like the biggest wins.

### Candidate improvements (pick 3-4 to ship)

1. **Inline image preview on the product list.** The current `/admin/collections/products`
   list shows columns `title, type, price, category, status`. Add a thumbnail column so
   Yarit can visually scan the catalog. Payload supports custom list-view columns via
   `admin.components.views.list.columns`. ~30 lines + 1 cell component.

2. **Quick stock adjustment buttons** (for `type: 'stocked'` products). On the product edit
   form, next to the `stock` number field, add two tiny buttons: `+1` and `-1`. Quality of
   life for Yarit's "I just received 6 more, let me bump stock" workflow. Needs a custom
   field component via `admin.components`.

3. **Order status shortcuts on the order list.** In `/admin/collections/orders`, add a
   "Mark as packed" / "Mark as shipped" inline action button per row so Yarit doesn't have
   to click into each order to advance its state. The FulfillmentView already does this but
   the raw collection list doesn't. ~60 lines custom list-row component.

4. **Category image uploads.** Categories currently have a `title + slug + order` field set
   (check `src/collections/Categories.ts`). Consider adding an `image` field (upload, media
   relation) so category pages can render a hero instead of falling back to the
   `AI_CATEGORY_TILES` static map in `CategoryGrid.tsx`. Low priority but high visual payoff.

5. **Dashboard "recent orders" tile.** `YaritDashboard.tsx` currently shows 5 stats + 8 task
   tiles. Add a "Recent orders" tile (or section) showing the 3 most recent paid orders with
   quick links. Pulls from `loadFulfillment()` with `limit: 3`.

6. **"Preview as customer" button on product edit.** Next to the "Save" button, a link that
   opens `/product/<slug>` in a new tab so Yarit can instantly see how her edit looks. The
   "Live Preview" feature in Payload 3 may already cover this — check
   `admin.livePreview` config.

7. **Product edit → "duplicate" action.** When Yarit adds a new product that's very similar
   to an existing one (different flavor of the same line), "duplicate" saves typing. Payload
   may have this built in via a collection admin option.

8. **Bigger + friendlier image drop zone.** The current `upload` field renders a small drop
   zone. Custom wrapper that renders a larger visual + a one-line Hebrew hint ("גררי תמונה
   לכאן או לחצי לבחור"). Pure styling.

9. **Fulfillment dashboard + simplified collection list cross-link.** When Yarit clicks into
   the Orders collection list from the dashboard, link to the FulfillmentView instead
   (because that's what she wants 90% of the time). Add a top-banner notice on the Orders
   collection list saying "💡 לטיפול שוטף, השתמשי בלוח ההזמנות →" linking to
   `/admin/fulfillment`.

10. **Admin mobile-friendliness audit.** Yarit may open the admin on her phone. Payload's
    admin is responsive but probably not optimized for 375px widths. Walk through the
    collections on mobile, note anything broken, fix the obvious ones (sidebar navigation,
    button target sizes, table horizontal scroll).

**Whatever you pick, the pattern is:**
1. Add the custom component or field config
2. Register in `payload.config.ts` under the appropriate collection's
   `admin.components` key
3. Verify it renders in both Hebrew and English admin modes
4. Quality gates (tsc + lint + build)
5. Visual smoke test via `preview_eval` after login

**Do NOT break existing admin surfaces.** The previous sessions rewrote `HelpButton.tsx`
and dropped the Forever product-type split cleanly; use those as a pattern for additive
changes that don't touch the Payload chrome itself.

---

## Track C — External inputs (unblock the Track A handoff items)

**Budget ~10% of the session (if the inputs actually land during the session — otherwise 0%).**
These are all "paste a value into the right place and redeploy" tasks. Don't start any of
them without the actual credential value — no placeholders.

### C.1 — Resend email credentials

4 env vars + a redeploy:
- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY=<user provides>`
- `EMAIL_FROM="שורש <noreply@<domain>>"` — needs real domain (Track C.4)
- `EMAIL_REPLY_TO=<contact email>`

Paste into Vercel env UI → redeploy → verify via `/api/checkout` mock flow that an email
actually lands in the configured inbox. The existing `src/lib/email/resend.ts` adapter is
already paste-in-ready (verified in a previous session). The `getEmailProvider()` factory
picks it up automatically if `EMAIL_PROVIDER=resend` and the API key is set.

### C.2 — Meshulam payment credentials

5 env vars + a redeploy + an E2E sandbox test + a live-flip. The existing
`src/lib/payments/meshulam.ts` adapter has 2 `TODO(meshulam)` hotspots (lines 123 + 193)
that need reconciling against Yarit's actual Meshulam PDF spec — don't skip that step,
guessing a field name will cost a day of debugging.

Workflow:
1. User provides the Meshulam integration PDF
2. Reconcile the 2 TODO hotspots (~30 min of reading + editing)
3. Set env vars in Vercel: `PAYMENT_PROVIDER=meshulam`, `MESHULAM_USER_ID`,
   `MESHULAM_PAGE_CODE`, `MESHULAM_API_KEY`, `MESHULAM_WEBHOOK_SECRET` (names are
   placeholders — actual names in the adapter)
4. Deploy
5. Run a ₪1 E2E sandbox test: place a real order on `yarit-shop.vercel.app` with a Meshulam
   sandbox credit card, verify the redirect loop works, verify the webhook fires, verify the
   order flips to `paymentStatus: 'paid'` in the admin
6. Live-flip: update webhook URL in Meshulam dashboard to prod, swap sandbox → live API key
   in Vercel, place a real ₪10 test order on a live card, refund it immediately

### C.3 — Legal markdown

The 4 folders `content/legal/{privacy,returns,shipping,terms}/` are currently EMPTY. When
Yarit's lawyer delivers the final text:

1. Drop files at `content/legal/<slug>/he.md` and `content/legal/<slug>/en.md` (8 files
   total)
2. Re-enable the 4 footer links in `src/components/layout/Footer.tsx` — look for the
   comment blocks around lines ~51-55 and ~74-77 (marked as "TODO: re-add when legal
   content lands")
3. Smoke test each of the 8 locale variants at `/he/legal/privacy`, `/en/legal/privacy`,
   etc, verify they render without crashing
4. Verify the 404 fallback still works for slugs that aren't present (if shipping.he.md is
   missing but the others are there, `/he/legal/shipping` should 404 gracefully)

### C.4 — Custom domain

Yarit has presumably bought a domain (or will). Once she provides the domain name:

1. Add the domain in Vercel dashboard (Domains → Add)
2. Configure DNS (A or CNAME records — follow Vercel's instructions)
3. Wait for SSL cert provisioning (usually 2-5 minutes)
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel env to the new domain
5. Redeploy
6. Verify: hitting the domain serves the shop, the old `yarit-shop.vercel.app` alias still
   redirects or serves (Vercel's choice), `sitemap.xml` references the new domain, OG tags
   reference the new domain
7. Update `docs/STATE.md` + `CLAUDE.md` to mention the new domain

---

## Track D — Extra GSAP polish

**Budget ~15% of the session.** Same candidates as the previous prompt, pick 2-3 to ship.
Non-negotiables from previous sessions apply (see the end of this prompt).

1. **Sticky-header compression on scroll.** Scroll-scrubbed shrink of the nav from full
   height to ~52px past the hero, with a subtle background blur on the nav bar.
2. **Product card image Ken Burns on scroll-into-view.** One-shot Ken Burns drift on each
   product card's image the first time it enters the viewport.
3. **Shop grid bloom-in on first page load.** T1.2-style card blooming entrance on the
   `/shop` grid's first render (complements the existing T1.6 Flip for filter transitions).
4. **Add to cart button press feedback.** `0.96 → 1` scale bounce + a check-icon fade-swap
   on click, paired with the CartDrawer open animation.
5. **Cart drawer item stagger.** When items appear in the drawer (e.g., after add-to-cart),
   stagger their entrance.
6. **404 page polish.** `src/app/not-found.tsx` gets a GSAP intro (headline + illustration
   drift).
7. **Hero headline rotateX tightening.** The existing T1.1 entrance uses `rotateX: -8°` on
   each word — try tightening to `-12°`.

**Recommended picks for this session:** #1 (sticky header) + #2 (card Ken Burns) + #4 (add
to cart feedback). Those 3 cover the customer's main scroll path and deliver visible polish
without structural rework. Skip #7 — restraint over flash.

Verification workflow (same as T2.9):
1. Cut `feat/final-gsap-polish` branch (or use the brand-rename branch if you're on it)
2. After each pick, run `tsc + lint + build`
3. Local prod smoke test via `preview_start("yarit-shop-prod")` + `preview_eval`
4. Commit per pick
5. Quality gates green before the final push

---

## Track E — Full QA pass

**Budget ~15% of the session.** This is the checkboxed walkthrough the previous prompt
outlined, still applies. Walk through it methodically. Every red X is a bug to fix before
the final push.

### Storefront (LTR English)

- [ ] `/en` — hero parallax scrubs smoothly, TrustBar icons bloom, MeetYarit body cascades
  word by word, CategoryGrid heading pins on desktop + unpins at section bottom,
  Testimonials slide in from the left (LTR start edge), BranchDividers draw in sync with
  the next section
- [ ] `/en/shop` — 7 products render, `?category=aloe` narrows the list
- [ ] `/en/product/<slug>` — at least 3 slugs (test one with 3 new images from Track A.3 to
  verify gallery works)
- [ ] `/en/cart` — empty state + add-to-cart round trip via `preview_click`
- [ ] `/en/checkout` — form renders, no "test checkout" disclaimer leaking (prod uses
  mock provider until Track C.2 lands — confirm via `isMockPaymentProvider()`)
- [ ] `/en/about` — long-form page, reveal-on-scroll still works
- [ ] `/en/contact` — form renders, contact info pulled from SiteSettings
- [ ] `/en/login` + `/en/forgot-password` + `/en/reset-password/<token>` — auth flow
- [ ] `/en/account` — after login, orders list + profile + addresses
- [ ] `/en/legal/<slug>` — only if Track C.3 landed; otherwise verify 404 path is graceful

### Storefront (RTL Hebrew, default locale)

- [ ] `/` = `/he` — dir=rtl, Hebrew copy everywhere, hero headline = new tagline from
  Track A.1, all 5 category tiles with Hebrew titles, Testimonials slide in from the right
- [ ] Run through the same checklist on the Hebrew side

### Mobile (375×812)

- [ ] No horizontal scroll on any page
- [ ] CategoryGrid heading pin DOES NOT fire (`position: static`)
- [ ] Hero min-height and drifting leaves still look right
- [ ] MobileNav opens from the right edge in RTL / left edge in LTR
- [ ] Cart drawer doesn't block the checkout button (the 2026-04-11 P1 fix)
- [ ] Admin panel is usable at 375px (Track B.10 check)

### Tablet (768×1024)

- [ ] Just barely desktop — verify the CategoryGrid pin fires at the 768px breakpoint
- [ ] Product grid collapses to 3 columns on tablet, 4 on desktop

### Reduced motion

- [ ] DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" → reload
- [ ] Every animation snaps to final state (no movement, no fades)
- [ ] `[data-category-card]`, `[data-featured-card]`, `[data-meet-text-block]`,
  `[data-testimonial-card]` all at `opacity: 1` with identity transforms

### Admin panel

- [ ] Login as `admin@shoresh.example` / Yarit's real prod password (not the dev default)
- [ ] Dashboard loads with correct counts (7 products, 0 or N orders, N customers)
- [ ] `/admin/collections/products` — 7 rows, thumbnails render (if Track B.1 shipped),
  image dropdown shows new enum labels
- [ ] `/admin/collections/products/<id>` — edit form loads, Hebrew + English title tabs
  work, `סוג מוצר` dropdown has both options
- [ ] `/admin/collections/categories` — 5 rows, drag-reorder works
- [ ] `/admin/collections/orders` — orders list (may be empty on prod), no "Forever" refs
- [ ] `/admin/globals/site-settings` — loads, all fields labeled in Hebrew, the `forever`
  group is gone
- [ ] `/admin/fulfillment` — only the 3 buckets (`להכין ולשלוח`, `בדרך ללקוח`, `נמסר`)
- [ ] HelpButton popover — opens in both he and en, 7 task cards, Escape/outside-click
  closes, no WhatsApp/mailto refs
- [ ] Language pill (`עברית · EN`) — clicking flips the emphasis

### Hygiene

- [ ] Zero console errors on every page visited
- [ ] Zero network 500s
- [ ] No missing images (404s on `/brand/ai/*.jpg`, `/brand/logo.png`, etc)
- [ ] No hydration warnings
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npm run build` → 40 routes, all `ƒ`/`○`, zero `●` SSG

### Accessibility + SEO

- [ ] Keyboard navigation works on all 10+ main routes (tab through, submit with Enter)
- [ ] `aria-label` / `aria-describedby` on every button without visible text
- [ ] Skip link lands on `#main` correctly
- [ ] `<title>` + meta description unique per route
- [ ] JSON-LD schema.org/Product on product pages (with 3-image array if Track A.3 shipped)
- [ ] `sitemap.xml` lists all 40 routes (or at least the 14 public ones)
- [ ] `robots.txt` blocks `/admin/*` and `/api/dev/*`

### Performance (optional but nice)

- [ ] Lighthouse on `/en` desktop: ≥90 perf, ≥95 a11y, ≥95 SEO, ≥95 best-practices
- [ ] Lighthouse on `/en` mobile: ≥80 perf (motion-heavy)
- [ ] First product detail page: ≥90 perf desktop

---

## Track F — Docs + final handoff

**Budget ~5% of the session.** Cleanup + the stuff Yarit will actually read.

### F.1 — ADR-019 formal entry

Add a new section to `docs/DECISIONS.md`:

```md
## ADR-019 — Remove Forever terminology + collapse fulfillment workflow

**Date:** 2026-04-11
**Status:** Accepted
**Context:** After T2.9 shipped, Yarit reviewed the admin and pushed back on the
`Forever | Independent` product type split and the associated 2-extra-state
fulfillment workflow. Her mental model is "a customer ordered, I ship it" — the
supplier-vs-stock distinction is a product-level concern she handles by eyeballing
the order items, not a workflow state machine the system needs to enforce.

**Decision:** Collapse the fulfillment state machine from 6 states
(`pending / awaiting_forever_purchase / forever_purchased / packed / shipped /
delivered`) to 4 (`pending / packed / shipped / delivered`). Rename the product
type enum from `forever | independent` to `sourced | stocked` to reflect the
actual distinction (do I inventory this at home or do I order it from a supplier
when someone buys). Remove the word "Forever" from every admin-visible label,
schema, help text, asset filename, and i18n string. Drop the
`foreverProductCode`, `foreverDistributorPrice` fields and the `SiteSettings.forever`
group entirely — they were dead code.

**Consequences:**
- Yarit's per-order click count drops from 5 (for Forever orders) / 3 (for
  independent) to a uniform 3
- The Fulfillment Dashboard renders 3 buckets instead of 5
- The `type` field default changes from `forever` → `stocked`
- Prod DB migration required: recreated 3 enum types in a transaction + dropped
  4 deprecated columns (see 2026-04-11 night entry in STATE.md)
- The factual business relationship (Yarit sources some products from a specific
  supplier per-order) is unchanged — just no longer exposed in the schema
- Backward compat: the Zustand cart store persist-layer has a v1→v2 migration
  for returning customers with stale localStorage
```

### F.2 — Update `docs/FULFILLMENT.md`

The doc describes the old 6-state workflow. Rewrite the state-machine section
to describe `pending → packed → shipped → delivered`. Drop any references to
"awaiting Forever purchase" / "Forever purchased". Keep the rest of the doc
(how Yarit physically handles orders, packaging, labels) as-is.

### F.3 — `docs/YARIT-ADMIN-GUIDE.md` spot-check

Grep the guide for `forever|פוראבר|Forever|independent` and audit every hit.
Most of it is product-agnostic so likely only 2-3 lines need updating.

### F.4 — Hebrew welcome letter for Yarit

Write a single short (~20 lines) Hebrew-only message that Nir can copy-paste into
WhatsApp when he hands the shop over to Yarit. Content:
- Welcome + congratulations
- The URL to bookmark (the new custom domain from Track C.4 if landed, otherwise
  `yarit-shop.vercel.app`)
- How to log into the admin (`/admin`, her email, her password — Nir sets these,
  NOT the Claude agent)
- The 3 most common tasks (add product, mark order shipped, update site details)
  — keyed to the same 3 HelpButton guide entries
- What's still external (Meshulam credentials → need the PDF, legal text → need
  her lawyer)
- Contact Nir if anything feels stuck
- A short "thank you" closer

Save to `docs/YARIT-WELCOME-LETTER.md`. Header: `# Yarit welcome letter (Hebrew,
ready to send via WhatsApp)`. Followed by a horizontal rule and the Hebrew text
on its own, no English translation, ready to copy-paste.

### F.5 — `docs/NEXT-SESSION.md` TL;DR refresh

The `docs/NEXT-SESSION.md` file (not to be confused with
`docs/NEXT-SESSION-PROMPT.md`) is the one-screen "cold-start this project" note.
Walk the top section and make sure it reflects the current state:
- Shop is live at `<new custom domain or yarit-shop.vercel.app>`
- Yarit is using the admin actively
- Remaining work is external inputs (Meshulam if still pending, legal if still
  pending)

### F.6 — STATE.md walk + archive

`docs/STATE.md` has grown across 10+ session entries. If it's past ~800 lines,
cut everything before "2026-04-11 — Remove Forever terminology" into a new
`docs/STATE-ARCHIVE.md` with a header explaining it's historical and a link from
the main STATE.md pointing at the archive.

### F.7 — Nir handoff note

A short note (~10 lines) for Nir — not Yarit — that summarizes:
- Branch state, commit hashes, what's on prod, what's on the feature branch if
  anything
- What Yarit should do first (bookmark the URL, log in, try one edit)
- What's still waiting on external inputs and how to tell when they've landed
  (Meshulam PDF, Resend API key, legal docs, custom domain)
- A short contact-me-if-stuck paragraph

Save to `docs/NIR-HANDOFF.md` or stash in a top-of-STATE.md banner.

### F.8 — Archive this NEXT-SESSION-PROMPT.md

If all 7 tracks ship cleanly this session, archive this file as
`docs/NEXT-SESSION-PROMPT-2026-04-11-brand-rename-and-finalqa.md` and write a
shorter follow-up as `docs/NEXT-SESSION-PROMPT.md` describing only residual
maintenance (bug fixes if they surface, quarterly dep updates, etc). If the
session runs out of budget partway through, update this file in place — mark
the finished tracks as "shipped" and the rest as "still open" — and don't
archive it yet.

---

## Track G — Misc cleanup

**Budget ~5% of the session.** Small wins that don't fit elsewhere.

### G.1 — Drop unused devDeps

`@swc-node/register` + `@swc/core` are dead weight. A one-liner:

```bash
npm uninstall @swc-node/register @swc/core
```

Then `tsc + lint + build` to verify nothing broke, commit as its own small
commit.

### G.2 — Update the safety-net reference

The safety net in this file (and in the previous session's prompt) references
commit hashes that will be stale. After this session's final push, update the
NEXT-SESSION-PROMPT for the session AFTER this one to point at the new
last-known-good hash.

### G.3 — Dev DB reseed

After Track A.3 lands the new product images, the local `shoresh-dev.db` will
reference old images. Wipe + reseed via `curl -X POST
'http://localhost:3000/api/dev/seed?wipe=1'`. Verifies the seed changes work
end-to-end.

### G.4 — `tmp/` folder review

The `yarit-shop/tmp/` folder has accumulated old QA screenshots, HTML dumps,
and server logs from previous sessions. It's not in git (or shouldn't be) but
it's worth skimming to see if there's anything Yarit might care about (real
order samples, real email logs) before a session-end sweep. Safe default:
leave tmp/ alone unless you find a smoking gun.

---

## Non-negotiables (same every session)

1. **Never push to main without explicit user word.** `git push origin main` + `npx
   vercel --prod --yes` both require the user saying "push" / "deploy".
2. **No admin panel aesthetic changes** unless Yarit explicitly asks. Track B
   is user-authorized from this prompt.
3. **Motion is additive only.** Don't remove existing keyframes, don't touch the
   motion primitives (except to add new additive direction/variant values),
   don't break the editorial-botanical vocabulary.
4. **`setRequestLocale` + `getTranslations` in every server page/layout.**
5. **`cookies()`, `headers()`, `draftMode()` are async.**
6. **Never import `next/link` in storefront code.** Use `Link` from
   `@/lib/i18n/navigation`.
7. **Single GSAP entry point** — `@/lib/motion/gsap`.
8. **Server→client props are serializable only.** No function props.
9. **No Tailwind arbitrary-value classes in JSX comments or markdown files.**
10. **Hebrew + English bilingual strings always go through
    `src/messages/{he,en}.json`.**
11. **Never re-add `generateStaticParams` returning only `{locale}` to a
    TWO-segment dynamic route** — CI will fail.
12. **Every new `gsap.from` + scrollTrigger MUST include `immediateRender: false
    + once: true + start: 'top bottom-=40'`** — the 2026-04-11 bug-fix pattern.
13. **Brand rename must go through `src/brand.config.ts` first.** Never
    hardcode the new brand name in a component — always import from the config.
    Same rule as #10 for strings, but brand-specific.
14. **Prod DB changes require explicit user approval AND a backup plan.** When
    you touch Neon, always: (a) inspect read-only first, (b) wrap writes in a
    transaction, (c) have rollback criteria ready. See the 2026-04-11 night
    entry in STATE.md for the Remove-Forever migration as the reference pattern.

---

## Working directory + quality gates

```bash
cd C:/AI/YaritShop/yarit-shop
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0, 0 errors 0 warnings
npm run build           # must exit 0, all 40 routes ƒ/○, zero SSG
```

**Dev server** → `npm run dev` → http://localhost:3000. Warning: `npm run dev`
does NOT exercise SSG behavior and has looser GSAP timing than prod builds. For
production-only motion issues, use `npm run build && npx next start -p <port>`
instead, or `preview_start("yarit-shop-prod")` from the Preview MCP.

**Preview MCP** reads from `C:/AI/YaritShop/.claude/launch.json` (the PROJECT
ROOT launch.json, NOT `yarit-shop/.claude/launch.json`). The `yarit-shop-prod`
config runs `npm --prefix yarit-shop run start -- -p 3009`, which expects a
prior `npm run build`. Preview MCP quirks documented in the previous prompt
still apply:

- Programmatic `window.scrollTo` sometimes doesn't stick without a
  `requestAnimationFrame` chain. Use
  `document.documentElement.scrollTop = <y>` inside an rAF, then dispatch
  `new Event('scroll')` manually, then sample after `setTimeout(..., 1500)`.
- `preview_click` on buttons that use React `onClick` handlers sometimes doesn't
  propagate. Use
  `btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))`
  via `preview_eval` as a fallback.

---

## Definition of done for this session

The session is done when:

- [ ] **Track A (brand)** — new brand name + logo + 21 product images all shipped, dev DB
  reseeded, prod DB updated (either via Yarit's manual admin upload or via a one-off
  script), homepage + shop + product detail all visually reflect the new brand
- [ ] **Track B (admin UX)** — 3-4 improvements shipped, each verified in the admin shell
- [ ] **Track C (external)** — unblock as many of the 4 items as Yarit has provided inputs
  for. Skip any where the input hasn't landed; those roll to the next session.
- [ ] **Track D (GSAP polish)** — 2-3 polish items shipped, each verified locally
- [ ] **Track E (QA)** — every checkbox above either ✓ or fixed + ✓
- [ ] **Track F (docs + handoff)** — ADR-019 written, FULFILLMENT.md updated, admin guide
  spot-checked, Hebrew welcome letter written, STATE.md walked + archived if needed,
  this NEXT-SESSION-PROMPT.md archived
- [ ] **Track G (cleanup)** — `@swc*` devDeps dropped, dev DB reseeded, tmp/ skimmed
- [ ] All quality gates green after every track
- [ ] `git push origin main` only after explicit user word
- [ ] `npx vercel --prod --yes` only after explicit user word
- [ ] `docs/STATE.md` has a new "Latest" entry describing this session's work
- [ ] Prod smoke test passes on the final deployed state

**This is most likely the last major session for Shoresh.** The site is in
great shape; what's left is polish, external inputs, and a final handoff to
Yarit. Restraint over flash. Slow over fast. Additive over replacement.
