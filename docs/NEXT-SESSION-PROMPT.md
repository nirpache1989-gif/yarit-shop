# Next session — post-launch QA + design/GSAP polish

> **Purpose:** The Copaia launch is complete. Brand, catalog, prod Neon, Vercel Blob — everything shipped and verified on 2026-04-11. This session is **testing-first**: walk every surface of the live prod site with a careful eye, fix anything that regressed during the brand rename / catalog swap, then (with time budget permitting) ship a small batch of design refinements + additional GSAP motion polish.
>
> **Read first:** `CLAUDE.md`, then the top entry of `docs/STATE.md` ("Latest (2026-04-11 very late)"), then `docs/NIR-HANDOFF.md` for a terse operational overview. Only then start on the tasks below.
>
> Previous ready-prompts are archived at `docs/NEXT-SESSION-PROMPT-2026-04-11-*.md`. Historical context only — don't read them unless a specific detail is needed.

---

## Status inherited from previous session

### Production (LIVE)

- **URL:** `https://yarit-shop.vercel.app` (custom domain still pending)
- **Deployment:** `dpl_6k3dhFSBrCnCF3ixJY9Utcg2QUkr` running code from commit `3cd2bb4` on `main`
- **Catalog:** 8 products, 18 source images on Vercel Blob (54 total with the 240/480/960 resize variants), 5 categories, site-settings populated. Featured: `aloe-drink ⭐ · aloe-toothgel ⭐ · daily-multivitamin ⭐`
- **Payload admin:** `/admin` chrome is fully Copaia-branded, admin-language toggle works, HelpButton popover rewritten in the 2026-04-11 session, Fulfillment Dashboard at `/admin/fulfillment` shows the 3-bucket 4-state workflow

### Local dev

- `npm run dev` → `http://localhost:3000` (SQLite at `./copaia-dev.db`, fall back to `./shoresh-dev.db` for anyone pulling a stale branch)
- `.env.local` is a local-dev file pointed at SQLite. Do NOT modify it to point at prod Neon unless you have a specific migration to run — and if you do, back it up as `.env.local.bak` first.
- Dev DB has the same 8 products as prod; run `POST /api/dev/seed?wipe=1` to reset + re-seed if you corrupt it.
- Admin dev credentials (local only): `admin@copaia.example / admin1234` via `POST /api/dev/create-admin`

### External inputs still pending (all deferred to future sessions)

- 💳 **Meshulam payment credentials** — 5 env vars + the 2 `TODO(meshulam)` hotspots in `src/lib/payments/meshulam.ts` lines ~123 + ~193
- 📧 **Resend API key** — 4 env vars + a redeploy; adapter at `src/lib/email/resend.ts` is paste-in-ready
- 📄 **Legal markdown** — 8 files at `content/legal/{privacy,returns,shipping,terms}/{he,en}.md`; re-enable the 4 footer links in `src/components/layout/Footer.tsx` after content lands
- 🌐 **Custom domain** — add in Vercel dashboard, configure DNS, wait for SSL, update `NEXT_PUBLIC_SITE_URL`, redeploy, update `CLAUDE.md`

If any of these land during the session, work them. If not, leave them alone — each one triggers a deploy and you don't want to disturb the live prod state without a good reason.

---

## 🛟 SAFETY NET

**Last known-good commit is `3cd2bb4`** on `main`, serving prod via `dpl_6k3dhFSBrCnCF3ixJY9Utcg2QUkr`. `main` and `origin/main` both point there. No feature branch is outstanding — everything from the previous session fast-forward-merged cleanly.

**Before you start ANY code change:**

```bash
cd C:/AI/YaritShop/yarit-shop
git fetch origin
git status                                      # verify clean
git checkout -b feat/qa-and-polish              # cut a fresh branch for this session
```

Work on `feat/qa-and-polish` (or whatever name fits the actual work). `main` stays at `3cd2bb4` until the user says "push". Prod stays at `dpl_6k3dhFSBrCnCF3ixJY9Utcg2QUkr` until the user says "deploy". **Never push to main and never deploy without explicit user word** — same rule as every prior session.

---

## Track 1 — Full prod QA walkthrough (the primary task)

**Budget ~50-60% of the session.** The brand rename + catalog swap touched 96 files across Track A/D/B/F/G. Most surfaces were verified in isolation during that session, but this is the first time all of them are on prod together with the new catalog. Walk through every surface carefully with a 5-minute attention span and note everything that looks off.

Use `preview_start("yarit-shop-prod")` for local prod-mode motion testing (a dev `npm run dev` has looser GSAP timing — don't rely on it for motion QA). Or curl against `https://yarit-shop.vercel.app` directly for anything that only needs HTTP-level verification.

### 1.1 Storefront LTR English

- [ ] `/en` (homepage)
  - [ ] Hero: Copaia logo renders clean (no parchment rectangle), `herobg3.jpg` backdrop visible at 85% opacity, tree image doesn't clash with the surrounding botanical frame
  - [ ] Hero entrance motion fires smoothly (logo y fade-up, headline words staggered reveal, subtitle fade, CTAs fade)
  - [ ] Hero exit parallax scrubs as you scroll past (botanical frame drifts up, cream vignette fades)
  - [ ] TrustBar 4 icons bloom in as the section enters the viewport
  - [ ] MeetYarit text column converges from the start edge, body paragraph cascades word-by-word, image column converges from the end edge
  - [ ] CategoryGrid heading pins to the top at desktop as you scroll past the 5 tiles
  - [ ] FeaturedProducts section: recommendedBG.jpg backdrop visible at 14% opacity behind the 3 featured cards, heading pins on desktop, each card Ken Burns scales from 1.08 → 1 on scroll-into-view
  - [ ] Testimonials 3 cards slide in from the start edge with stagger
  - [ ] BranchDividers draw in sync with the next section's reveal
  - [ ] Footer renders with Copaia brand + contact info from SiteSettings
- [ ] `/en/shop`
  - [ ] 8 product cards render STATICALLY on first paint (no staggered drop-in — that was the Track E fix)
  - [ ] Filter chips at the top, 5 categories + "All"
  - [ ] Click a category chip → Flip animation morphs the grid smoothly
  - [ ] Click "All" → morphs back
  - [ ] Each card's `ProductCardMotion` tilt fires on hover
  - [ ] Each card's Ken Burns fires on scroll-into-view (each card independently)
- [ ] `/en/product/aloe-drink` — the biggest 3-image gallery
  - [ ] Main image + 3 thumbnails
  - [ ] Click thumb 2 → T1.7 Flip morph to AloeDrink1
  - [ ] Click thumb 3 → Flip morph to AloeDrink2
  - [ ] Hover zoom on main image
  - [ ] Price + Add to cart visible
  - [ ] Full description renders with paragraph breaks
  - [ ] JSON-LD `image` array has 3 absolute URLs (check with `preview_eval`)
- [ ] `/en/product/aloe-toothgel` — second 3-image gallery
- [ ] At least one 2-image product (e.g. `/en/product/bee-propolis`) — verify thumb row shows exactly 2 thumbs, not 3 or 1
- [ ] `/en/cart`
  - [ ] Empty state renders a friendly empty-cart illustration + "continue shopping" CTA
  - [ ] Add a product via the shop grid, cart drawer opens briefly, badge increments, cart page shows the item
  - [ ] Quantity increment/decrement works
  - [ ] Remove item works
- [ ] `/en/checkout`
  - [ ] Form renders: shipping address, contact info
  - [ ] "Mock payment" banner (because prod still uses mock provider — Meshulam not wired)
  - [ ] Submit flow round-trips to `/checkout/success`
- [ ] `/en/about` — long-form page with scroll-triggered reveals
- [ ] `/en/contact`
  - [ ] ContactBG1.jpg backdrop visible at 55% opacity (eucalyptus framing)
  - [ ] 2 or 3 contact cards (WhatsApp / email / phone) — only those with real values in SiteSettings
- [ ] `/en/login` + `/en/forgot-password` + `/en/reset-password/<token>` (with a fake token — should 404 or show invalid-token state gracefully)
- [ ] `/en/account` (after login) — orders list + profile + saved addresses
- [ ] `/en/legal/<slug>` — expect 404s for all 4 slugs until Track C.3 lands; verify the 404 is graceful, not a crash

### 1.2 Storefront RTL Hebrew (default locale)

Walk the same list on the Hebrew side. Key checks:

- [ ] `/` = Hebrew (no locale prefix for default); `dir="rtl"`, `lang="he"`
- [ ] Hero headline = "שורשים של בריאות", header logo alt = "קופאה"
- [ ] All 5 category tiles have Hebrew titles
- [ ] MeetYarit body reads right-to-left with correct word cascade direction
- [ ] Testimonials slide in from the RTL start edge (right, not left)
- [ ] Product detail pages show Hebrew titles + descriptions (the seed stores both locales)
- [ ] Cart drawer + checkout form + account pages all render RTL correctly
- [ ] MobileNav slide-in panel comes from the RTL start edge (right)

### 1.3 Mobile (375×812)

Use `preview_resize` or a real device for this. The 2026-04-11 session shipped a MobileNav portal fix that was *specifically* addressing a Header `backdrop-filter` containing-block bug — give this extra attention.

- [ ] No horizontal scroll on any page (`body.scrollWidth === window.innerWidth`)
- [ ] Hero logo size + position work at 375 width
- [ ] Desktop nav hidden, hamburger visible top-right
- [ ] **Hamburger opens a full-viewport slide-in drawer from the RTL start edge** (the 2026-04-11 fix — dialog is portaled to `document.body`)
- [ ] Drawer has: close X, brand name top-right, 4 nav links, account link, language switcher, theme toggle — all visible
- [ ] Clicking the backdrop or the X closes the drawer
- [ ] CategoryGrid heading does NOT pin on mobile (`position: static`)
- [ ] FeaturedProducts heading does NOT pin on mobile either
- [ ] Cart drawer at bottom doesn't block the checkout button (the 2026-04-11 P1 fix)
- [ ] Shop grid is 2 columns on mobile, product images aren't stretched
- [ ] Product detail gallery thumbs are touchable (min 44×44 hit target)

### 1.4 Tablet (768×1024)

- [ ] Just barely desktop — CategoryGrid pin fires, FeaturedProducts pin fires
- [ ] Product grid collapses to 3 columns (was 4 on desktop)
- [ ] MobileNav hamburger hidden, desktop nav visible

### 1.5 Reduced motion

- [ ] DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" → reload
- [ ] Every GSAP animation snaps to its final state (no scrub, no stagger, no Ken Burns, no press bounce)
- [ ] CSS keyframe animations (Reveal, StaggeredReveal, leaf-breathe, pulse-added) all skip
- [ ] `[data-category-card]`, `[data-featured-card]`, `[data-meet-text-block]`, `[data-testimonial-card]` all at `opacity: 1` with identity transforms from first paint
- [ ] Sticky header scrub falls back to the binary on/off snap per the reduced-motion CSS block in `globals.css`

### 1.6 Dark mode

- [ ] Click the ☾ theme toggle → every section re-skins to Warm Night (`#1E1609` background, warm molasses palette)
- [ ] Hero logo dark-mode halo still visible (the `globals.css:203` CSS selector was updated from `img[alt="Shoresh"]` to `img[alt="Copaia"]` — verify it matches)
- [ ] Logo halo radial gradient behind the tree
- [ ] Product cards + admin chrome + cart drawer all legible in dark mode
- [ ] Logo image (JPG with parchment bg) doesn't look wrong against the dark page — this was a concern during the logo swap, verify the final transparent PNG renders cleanly

### 1.7 Admin panel

- [ ] Login at `/admin/login` with Nir-set credentials → redirects to `/admin`
- [ ] Dashboard loads with correct counts: 8 products, 0 orders (unless test orders have landed), some number of customers
- [ ] Greeting time-sensitive ("בוקר טוב ירית" / "צהריים טובים ירית" / "ערב טוב ירית" / "לילה טוב ירית")
- [ ] Recent orders section shows empty-state ("כשהזמנות יתחילו להיכנס, שלושת האחרונות יופיעו כאן.") or real rows if any have landed
- [ ] 8 tile grid links all navigate correctly
- [ ] `/admin/collections/products` — 8 rows, **thumbnail column renders real product photos** (the Track B.1 fix), Hebrew column headers, edit modal works
- [ ] Click into a product → edit form loads
  - [ ] Hebrew + English title localization tabs work
  - [ ] `סוג מוצר` dropdown: "קיים במלאי" / "לפי הזמנה מהספק"
  - [ ] If you flip to "קיים במלאי" (stocked) — stock field shows with **`+1 / −1` buttons** (Track B.2)
  - [ ] Click `+1`, verify stock increments + Save button becomes enabled
  - [ ] **Live Preview** button visible on the edit form (Track B.4). Click it → iframe renders the real storefront product page with 3 device breakpoints.
  - [ ] Revert the stock change before saving if you flipped a product just for testing
- [ ] `/admin/collections/categories` — 5 rows, drag-to-reorder works, each category's title + slug + order visible
- [ ] `/admin/collections/orders` — empty (prod has 0 orders), no "Forever" references in the chrome, "Add new order" works
- [ ] `/admin/globals/site-settings` — loads without error, all fields labeled in Hebrew, no `forever` group (it was dropped in ADR-019)
- [ ] `/admin/fulfillment` — renders 3 buckets: "להכין ולשלוח" / "בדרך ללקוחה" / "נמסר"; empty state if no orders
- [ ] HelpButton (? icon top-right) opens as a popover, 7 task cards, closes on Escape or outside-click
- [ ] AdminLangSwitcher (`🌐 עב / EN`) flips language one-click, Payload chrome labels all re-translate

### 1.8 Hygiene

- [ ] **Zero console errors** on every page visited (pre-existing React dev-mode warnings about inline `<script>` tags for `themeBootstrap` + JSON-LD are acceptable — they're known, valid React 19 patterns)
- [ ] **Zero network 500s** on any page visited
- [ ] **Zero missing images** — spot-check via `preview_network` → filter `failed`
- [ ] **Zero hydration warnings** — watch for `Text content did not match server-rendered HTML` / `Hydration failed because the server rendered HTML didn't match the client`
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npm run build` → 40 routes, all `ƒ`/`○`, zero `●` SSG

### 1.9 SEO + accessibility

- [ ] Every page has a unique `<title>` (check via `document.title` on each route)
- [ ] Every page has a unique meta description
- [ ] `/en/product/<slug>` has JSON-LD `schema.org/Product` with `image` array containing all product images (not just the first — Track A.6)
- [ ] `/robots.txt` blocks `/admin/*` and `/api/dev/*`
- [ ] `/sitemap.xml` lists all 14 public routes (8 products + home + shop + about + contact + login + account)
- [ ] Keyboard nav works on every interactive element — tab through the homepage, shop, product detail, cart, checkout
- [ ] Skip link lands on `#main` correctly
- [ ] `aria-label` / `aria-describedby` on every icon-only button
- [ ] Color contrast passes WCAG AA on all text (check in Chrome DevTools → Accessibility pane)

### 1.10 Performance (nice-to-have, not required)

- [ ] Lighthouse `/en` desktop: ≥90 perf, ≥95 a11y, ≥95 SEO, ≥95 best practices
- [ ] Lighthouse `/en` mobile: ≥80 perf (motion-heavy, this is the tolerance)
- [ ] First product detail page: ≥90 perf desktop
- [ ] Largest Contentful Paint < 2.5s on prod

Every red X in the checklist becomes a bug to fix before the session's final push.

---

## Track 2 — Design refinement (budget ~20% of the session)

The design has been through multiple rounds (Design Round 3 — "Night Apothecary" palette, Editorial Botanical vocabulary, per-page reveal waves, GSAP Tier 1 + Tier 2, T2.9 homepage scroll-linked storytelling). The foundation is strong. This session's design work is **refinement**, not redesign. Pick 2-4 of these if time allows:

1. **Logo sizing on mobile** — the desktop version was tuned during the rename session (`h-72/md:h-[28rem]` + `mt-6/md:mt-10`). Double-check the mobile rendering at 375×812. If the tree logo feels too small OR too big relative to the botanical frame on mobile, adjust `h-72` and the `mt-6` margin.

2. **Hero vignette intensity** — the cream radial gradient behind the logo + headline area is currently tuned for light mode. On dark mode it renders via a stronger 14-stop gradient in `.logo-halo::before`. Walk through dark + light at multiple widths and verify the vignette doesn't feel muddy or overpowering.

3. **Product card border + hover state refinement** — the `.product-card` hover currently gets a `translateY(-3px)` + box-shadow lift + border-color shift. With the new Forever Living photography on prod, see if the lift feels too subtle or if the shadow needs tuning. The card backdrop is `--color-surface-warm` (light parchment) which the product photos now sit on — verify the contrast isn't washing out the white/marble product-photo backgrounds.

4. **Footer polish** — Yarit's footer pulls from `SiteSettings.contact.*`. If some contact fields are unset on prod, the footer may have empty holes. Check the conditional rendering — an unset WhatsApp should hide the WhatsApp pill entirely, not render an empty link.

5. **Testimonials card backgrounds** — the 3 testimonial cards on the homepage have a subtle sprig SVG top-left. Verify the SVG isn't clipping on narrow viewports.

6. **Dark-mode product detail page** — the cream-on-dark contrast for product descriptions. If any copy reads too muted, adjust the `--color-muted` override in the `[data-theme="dark"]` block OR use a slightly brighter variant.

7. **Admin chrome warmth consistency** — the admin uses `var(--theme-elevation-*)` Payload tokens but some custom components (YaritDashboard, Recent orders section) use raw sage colors. If anything feels inconsistent in warmth, pull the raw colors through theme tokens.

8. **Category tile image crops** — the 5 `cat-*.jpg` images may crop differently at different viewport widths due to `object-fit: cover`. Verify the focal point of each image is visible at 375px, 768px, 1280px.

9. **Favicon refresh** — the current `src/app/favicon.ico` is the legacy Shoresh favicon. If it's still visible in the browser tab on the live site, generate a new favicon from the Copaia tree logo (favicon.io or similar) and drop it at `src/app/favicon.ico` + `src/app/icon.png` + `src/app/apple-icon.png`.

10. **OG / social share card** — the brand rename may have left the old `/opengraph-image.*` convention serving a Shoresh-era image. Verify the actual OG image served when a Copaia URL is pasted into WhatsApp / Facebook / Twitter.

---

## Track 3 — GSAP motion polish (budget ~20% of the session)

The motion layer is MATURE. Tier 1 (all 7 waves), Tier 2 lite, T2.9 homepage storytelling, and Track D from 2026-04-11 (scroll-scrubbed sticky header, product card Ken Burns on scroll-into-view, add-to-cart press bounce) are all shipped. Don't refactor what's working.

Pick 2-3 additive items from this list:

1. **Cart drawer item stagger on enter.** When items appear in the cart drawer (e.g., after add-to-cart opens the drawer), their rows currently hard-cut in. Add a 40ms stagger fade + 12px y-offset entrance so they feel like they "fall into place" in order.

2. **404 page polish.** `src/app/not-found.tsx` has a static illustration + message. Add a GSAP intro timeline: headline word cascade + illustration drift from below + CTA button scale-in. ~30 lines.

3. **Checkout success page confetti.** The `/checkout/success` page should fire the existing `ConfettiTrigger` (`brand` palette, `celebration` profile) once on mount. Already available via `import { fireConfetti } from '@/components/motion/ConfettiTrigger'`. ~5 lines inside a client component.

4. **Admin Dashboard stat number count-up** — currently uses `CountUp` which animates from 0 to the final value. Verify it's still working on prod after the Track B.3 recent-orders section was added below the stats row. If the CountUp no longer fires because of a re-render order issue, fix it.

5. **Product gallery thumb hover preview.** When hovering a thumbnail in the ProductGalleryMotion, show a tiny tooltip near the cursor with a light preview of which image it is. OR: show a subtle scale-up on the thumb itself (1 → 1.04) so it's clearer which one is active. The second option is safer and more in the current vocabulary.

6. **Category tile magnetic hover** — currently T2.8 shipped a magnetic tilt on category tiles. Verify it's still firing on prod. If the tilt feels too strong or too weak, tune the `MAX_TILT_DEG` constant in the relevant file.

7. **Newsletter signup CTA** — if the footer newsletter form has a submit button, add a press bounce (same pattern as add-to-cart: `scale 1 → 0.96 → 1 with back.out(1.8)`).

8. **Hero headline exit parallax** — the T2.9 wave added a hero exit parallax where the botanical frame drifts up as you scroll away. The headline itself currently scrolls away normally. A small additional scrub that ALSO tilts the headline's rotationX slightly (0 → -4°) as it exits the top would add subtle depth.

**Non-negotiables for EVERY new motion addition** (from CLAUDE.md rule #12):

- Every new `gsap.from + scrollTrigger` MUST include `immediateRender: false + once: true + start: 'top bottom-=40'`. This is the 2026-04-11 bug-fix pattern that prevents blank-card hydration races.
- Single GSAP entry point: `import { gsap } from '@/lib/motion/gsap'`. Never import `gsap` directly from the package.
- `prefers-reduced-motion: reduce` must snap the animation to its final state — no partial movement, no fades.
- Touch devices should get a sensible fallback (skip pointer-based tilts, keep scroll-based reveals).
- Don't remove or replace any existing keyframes. Additive only.

---

## Non-negotiables (same every session)

1. **Never push to main without explicit user word.** `git push origin main` + `npx vercel --prod --yes` both require the user saying "push" / "deploy".
2. **Motion is additive only** — don't remove existing keyframes, don't touch the motion primitives (except to add new additive direction/variant values).
3. **`setRequestLocale` + `getTranslations` in every server page/layout** that uses translations.
4. **`cookies()`, `headers()`, `draftMode()` are async** — Next 16 breaking change.
5. **Never import `next/link` in storefront code.** Use `Link` from `@/lib/i18n/navigation`.
6. **Single GSAP entry point** — `@/lib/motion/gsap`.
7. **Brand data stays in `src/brand.config.ts`.** Never hardcode the brand name in a component.
8. **Server → client props are serializable only.** No function props.
9. **Hebrew + English bilingual strings always go through `src/messages/{he,en}.json`.**
10. **Never re-add `generateStaticParams` returning only `{locale}` to a two-segment dynamic route** — CI will fail. See ADR-018.
11. **Every new `gsap.from + scrollTrigger` MUST include `immediateRender: false + once: true + start: 'top bottom-=40'`** — CLAUDE.md rule #12.
12. **Prod DB changes require explicit user approval AND a backup plan.** When you touch Neon, always: (a) inspect read-only first, (b) wrap writes in a transaction OR use `/api/dev/seed?wipe=1` against a fresh local dev server, (c) have rollback criteria ready. See the 2026-04-11 very-late entry in `docs/STATE.md` for the Copaia catalog sync as the reference pattern.
13. **If you touch an env var on Vercel, redeploy.** `payload.config.ts` reads `BLOB_READ_WRITE_TOKEN` at build time — adding a new env var after a deploy without rebuilding means the running deployment won't see it. This bit us in the previous session.

---

## Working directory + quality gates

```bash
cd C:/AI/YaritShop/yarit-shop
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0, 0 errors 0 warnings
npm run build           # must exit 0, all 40 routes ƒ/○, zero SSG
```

**Dev server** — `npm run dev` → http://localhost:3000. Hits `./copaia-dev.db` (SQLite) by default.

**Prod-mode local preview** — `preview_start("yarit-shop-prod")` from the Preview MCP, which runs `npm --prefix yarit-shop run start -- -p 3009` after a prior build. Use this for accurate GSAP timing and to verify prod-only SSG behavior. `npm run dev` has looser animation timing and may hide motion bugs.

**Preview MCP quirks that still apply** (from previous sessions):
- `window.scrollTo(y)` sometimes doesn't stick without a rAF chain. Use `document.documentElement.scrollTop = y` inside `requestAnimationFrame`, then dispatch `new Event('scroll')` manually, then sample after `setTimeout(..., 1500)` for scroll-scrubbed motion.
- `preview_click` on React-handled buttons sometimes doesn't propagate. Fallback: `btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))` via `preview_eval`.
- Dark-mode emulation only via `preview_resize({ colorScheme: 'dark' })` — it doesn't set the `data-theme` attribute directly. Click the ☾ theme toggle instead for accurate dark-mode testing.

---

## Definition of done for this session

- [ ] **Track 1 QA** — every checkbox in §1.1 through §1.9 either ✓ or has a corresponding fix commit. §1.10 perf is nice-to-have.
- [ ] **Track 2 design** — 2-4 refinements shipped, each verified on prod preview (`preview_start("yarit-shop-prod")`) before commit
- [ ] **Track 3 motion** — 2-3 GSAP additions shipped, each with the 2026-04-11 bug-fix pattern applied
- [ ] All quality gates green after every track
- [ ] `git push origin main` only after explicit user word
- [ ] `npx vercel --prod --yes` only after explicit user word
- [ ] `docs/STATE.md` has a new "Latest" entry describing this session's work
- [ ] Prod smoke test passes on the final deployed state (after any deploy)
- [ ] If any external inputs landed during the session (Meshulam / Resend / legal / domain), they're wired up and `docs/TASKS.md` + `docs/NIR-HANDOFF.md` reflect the change
- [ ] Archive THIS prompt → `docs/NEXT-SESSION-PROMPT-<date>-qa-and-design.md` and write a new short successor if all tasks ship. Otherwise update this prompt in place to reflect what's still outstanding.

---

## Quick-start QA cheatsheet

The first 5 minutes of the session should be:

```bash
# 1. Confirm you're on clean main at 3cd2bb4
git log -1 --oneline

# 2. Cut a fresh feature branch
git checkout -b feat/qa-and-polish

# 3. Run quality gates to establish baseline
npx tsc --noEmit
npm run lint
npm run build

# 4. Start the prod-mode preview for motion-accurate smoke testing
# (via the Preview MCP, not Bash)

# 5. Quick prod health check
curl -sS -o /dev/null -w "home=%{http_code}\n" "https://yarit-shop.vercel.app/en"
curl -sS -o /dev/null -w "shop=%{http_code}\n" "https://yarit-shop.vercel.app/en/shop"
curl -sS -o /dev/null -w "product=%{http_code}\n" "https://yarit-shop.vercel.app/en/product/aloe-drink"
curl -sS "https://yarit-shop.vercel.app/api/products?limit=20&depth=0" | python -c "import json,sys; d=json.load(sys.stdin); print(d.get('totalDocs'),'products')"
```

Expected: `3cd2bb4`, `tsc/lint/build green`, `200/200/200`, `8 products`. If anything deviates, investigate BEFORE starting Track 1.

**The Copaia launch is complete. This session is polish on top of a working foundation.** Restraint over flash. Slow over fast. Additive over replacement.
