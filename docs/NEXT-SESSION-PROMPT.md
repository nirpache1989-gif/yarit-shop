# Next session — P0 admin fix, then QA + design + GSAP polish

> **Purpose:** The Copaia launch is complete on prod for customers (homepage, shop, product detail, cart, checkout all working), but **the admin panel is broken on prod**. Everything else is ready for polish. This session is: fix the admin first, then walk through a careful QA pass on the live site, then ship a small batch of design refinements + additional GSAP motion polish if budget allows.
>
> **Read first:** `CLAUDE.md`, then the top entry of `docs/STATE.md` ("Latest (2026-04-11 very late)"), then `docs/NIR-HANDOFF.md`. Then come back here.
>
> Previous ready-prompts are archived at `docs/NEXT-SESSION-PROMPT-2026-04-11-*.md`. Historical context only.

---

## Status inherited from previous session

### Production (LIVE for customers, BROKEN for admin)

- **URL:** `https://yarit-shop.vercel.app`
- **Latest deployment:** `https://yarit-shop-8heain3i0-nirpache1989-gifs-projects.vercel.app` running code from commit **`3cd2bb4`** on `main`. This was an auto-deploy from the `.gitignore` commit push. The earlier `dpl_6k3dhFSBrCnCF3ixJY9Utcg2QUkr` is the one that fixed the Blob media serving.
- **Customer-facing:** ✅ All 5 storefront routes return 200 and render correctly. Copaia brand is live, hero + categories + featured + testimonials + footer all serving. 8-product catalog on prod Neon, 18 media images on Vercel Blob, `/api/media/file/*` proxy returns 200 + correct image bytes.
- **Admin:** ❌ **BROKEN.** `/admin/login` returns a completely blank cream page. See the P0 section below for diagnosis.

### Local dev

- `npm run dev` → `http://localhost:3000`
- SQLite at `./copaia-dev.db` (or `shoresh-dev.db` fallback for anyone with a stale DB)
- Dev DB has the same 8 products as prod; `POST /api/dev/seed?wipe=1` resets + re-seeds
- **Admin works locally.** The bug is prod-only.
- Local admin dev credentials: `admin@copaia.example / admin1234` via `POST /api/dev/create-admin`

### External inputs still pending (all deferred)

- 💳 **Meshulam payment credentials** — 5 env vars + 2 `TODO(meshulam)` hotspots at `src/lib/payments/meshulam.ts` lines ~123 + ~193
- 📧 **Resend API key** — 4 env vars + redeploy; adapter at `src/lib/email/resend.ts` is paste-in-ready
- 📄 **Legal markdown** — 8 files at `content/legal/{privacy,returns,shipping,terms}/{he,en}.md`; re-enable the 4 footer links in `src/components/layout/Footer.tsx` after content lands
- 🌐 **Custom domain** — add in Vercel dashboard, configure DNS, wait for SSL, update `NEXT_PUBLIC_SITE_URL`, redeploy, update `CLAUDE.md`

---

## 🛟 SAFETY NET

**Last known-good commit is `3cd2bb4`** on `main`, the current prod code. Prod is serving the Copaia brand correctly for customers. **The prod admin was never verified working after the Track B admin UX changes landed this session** — the bug has been live since the first Copaia deploy.

**Before starting ANY work:**

```bash
cd C:/AI/YaritShop/yarit-shop
git fetch origin
git status
git checkout -b feat/admin-fix-and-qa
```

Work on `feat/admin-fix-and-qa`. `main` stays at `3cd2bb4` until explicit user word ("push"). Prod stays at the current deployment until explicit user word ("deploy"). Same rule every session.

---

## 🚨 TRACK 0 — P0: fix the broken prod admin (BLOCKING)

**Do this first. Nothing else matters until the admin works.**

### Symptom

1. Navigate to `https://yarit-shop.vercel.app/admin` or `/admin/login`
2. HTTP 200, page title is "התחברות — ניהול קופאה" (correct, Hebrew Copaia admin)
3. `<body>` renders **a blank cream parchment background** — no login form, no BrandLogo, no button, no text content
4. No console errors (verified via Chrome MCP console read)
5. JS + CSS chunks all return 200
6. **Local dev `/admin/login` works perfectly** — bug is prod-only

### Diagnostic evidence collected this session

Run in a headless browser against `https://yarit-shop.vercel.app/admin/login` — the body has 28 children but they're all framework-level (scripts, dnd-kit announcer, react-hot-toast container, Payload's `drifting-leaves` ambient decorative wrapper, empty `#portal` div, empty `.payload__modal-container`). There is **zero actual admin content** — no `<main>`, no `<form>`, no buttons.

```js
// Diagnostic snippet — run in DevTools on prod /admin/login
Array.from(document.body.children).map((c, i) => ({
  i, tag: c.tagName, id: c.id,
  className: c.className?.toString?.().slice(0, 40),
  childCount: c.children.length,
  textLen: (c.textContent || '').length,
}))
// Expected: 28 children, all framework-level, zero admin content
```

The title is set (via Payload's `admin.meta.titleSuffix: '— ניהול קופאה'` in `payload.config.ts`), so the Payload admin's ROUTE is being matched. But the admin's React tree is rendering empty. This is consistent with a **silent SSR error caught by an internal React error boundary** that renders `null` as a fallback.

### Most likely root cause

The bug appeared after **Track B (commit `fe8b97d`)** landed admin customizations. Four things changed in that commit:

1. **`ProductThumbnailCell`** (new server cell component, `src/components/admin/payload/ProductThumbnailCell.tsx`) — async component that calls `await props.payload.findByID(...)` as a depth fallback. Registered via `admin.components.Cell` on the Products `images` field.
2. **`StockQuickAdjust`** (new client field component, `src/components/admin/payload/StockQuickAdjust.tsx`) — wraps `@payloadcms/ui`'s `NumberField` + `useField<number>`. Registered via `admin.components.Field` on the Products `stock` field.
3. **Dashboard recent-orders section** — extended `YaritDashboard.tsx` with `payload.find({ collection: 'orders', sort: '-createdAt', limit: 3, depth: 1 })` + a new `.yarit-recent*` section.
4. **Payload built-in Live Preview** — added `admin.livePreview.url` + `admin.livePreview.breakpoints` on the Products collection in `src/collections/Products.ts`.

**Top hypothesis:** one of these components is throwing at **import time** inside the prod RSC bundle. Payload's admin loads `src/app/(payload)/admin/importMap.js` eagerly — that file has entries for all registered custom components. If ANY of those components fails to import in the prod bundle (e.g. because of a missing export, a CJS/ESM interop issue, or an env var read during module init), the entire admin React tree fails to hydrate and renders empty.

The fact that the bug affects **every admin route**, including `/admin/login` (which doesn't even use `ProductThumbnailCell` or `StockQuickAdjust` — those are only referenced from the Products collection's list + edit views), supports this: eager import failure = whole-admin-dead.

### Debugging playbook (in order)

**Step 1: Reproduce locally with a prod build.**

```bash
cd C:/AI/YaritShop/yarit-shop
rm -rf .next
npm run build
npx next start -p 3009
# Open http://localhost:3009/admin/login in a browser
```

If the bug reproduces locally with `next start`, it's a build-time issue and you can debug without touching prod. If it doesn't reproduce, the issue is prod-env specific (Vercel serverless runtime, NODE_ENV difference, missing env var at build time, etc.).

**Step 2: Check the Vercel build logs for warnings.**

```bash
npx vercel inspect https://yarit-shop.vercel.app/admin/login
# OR look at the Vercel dashboard → project → Deployments → <latest> → Build Logs
```

Look for warnings about module resolution, CJS/ESM interop, or missing exports from `@payloadcms/ui` / `payload` packages.

**Step 3: Check the Vercel runtime logs for serverless function errors.**

```bash
npx vercel logs https://yarit-shop.vercel.app
# Then in another terminal: curl https://yarit-shop.vercel.app/admin/login
# Watch the logs stream for an error stack trace
```

Payload's admin is a server component, so any SSR error lands in the function log. Look for anything mentioning `ProductThumbnailCell`, `StockQuickAdjust`, `importMap`, or a generic "cannot read property of undefined" during admin render.

**Step 4: Binary-search the Track B changes.**

If steps 1-3 don't give a clear answer, comment out the registered custom components one at a time in `src/collections/Products.ts` + regenerate `importMap.js`, then do a local prod build + `next start` after each change:

```tsx
// Round 1: comment out the Cell registration for `images`
// admin.components.Cell on images field → comment the `components` block
// Then: rm -rf .next && npm run build && npx next start -p 3009
// Test /admin/login. If it works → ProductThumbnailCell is the culprit.
```

Repeat for `StockQuickAdjust`, `livePreview`, and the dashboard changes. The first one that makes the admin render is the bug. Fix or revert it.

**Step 5: Once identified, write the fix + regenerate `importMap.js`.**

Payload auto-regenerates `src/app/(payload)/admin/importMap.js` during dev. If you change `admin.components.*` configs, run the dev server once so the importMap rewrites itself, then commit the updated file alongside the fix.

**Step 6: Deploy + verify.**

```bash
git commit -m "fix(admin): <diagnosis> — restore admin panel on prod"
# Wait for user "push" + "deploy"
# After deploy: hit /admin/login in a real browser + verify the login form renders
```

### Fallback: full revert of Track B

If debugging eats more than ~40% of the session budget, revert commit `fe8b97d` (Track B) entirely. This gives you back working admin at the cost of losing the 4 admin UX picks from that commit (thumbnail column, stock +/-, recent orders, live preview). The revert can be re-applied selectively in a later session after finding the specific broken piece.

```bash
git revert fe8b97d --no-edit
# This creates a new commit reverting Track B
# Verify locally via prod build, then push + deploy
```

**Do NOT revert blind without first trying to reproduce locally** — you'll lose useful admin UX for a bug that might be a one-line fix.

---

## Track 1 — Full prod QA walkthrough (only AFTER Track 0 is fixed)

**Budget ~40% of the remaining session** (after the admin fix lands). Walk the live site with a careful eye. Use `preview_start("yarit-shop-prod")` for motion-accurate testing, or hit `https://yarit-shop.vercel.app` directly with curl/Chrome MCP.

### 1.1 Storefront LTR English

- [ ] `/en` (homepage)
  - [ ] Hero: Copaia logo clean, herobg3.jpg backdrop @ 85%, tree doesn't clash with botanical frame
  - [ ] Hero entrance motion (logo fade-up, headline word cascade, subtitle, CTAs)
  - [ ] Hero exit parallax scrubs as you scroll
  - [ ] TrustBar 4 icons bloom in on enter
  - [ ] MeetYarit 2-column converge + body word cascade
  - [ ] CategoryGrid desktop heading pin
  - [ ] FeaturedProducts: recommendedBG.jpg @ 14% visible, heading pins, Ken Burns on cards
  - [ ] Testimonials RTL-aware slide-in
  - [ ] BranchDividers draw in sync
  - [ ] Footer with Copaia brand
- [ ] `/en/shop` — 8 cards STATIC on first paint (no staggered drop-in), filter chips work, Flip morph on category change, Ken Burns on each card, hover tilt
- [ ] `/en/product/aloe-drink` — 3-image gallery, thumb click Flip morph, hover zoom, JSON-LD has 3 URLs
- [ ] `/en/product/aloe-toothgel` — second 3-image gallery
- [ ] At least one 2-image product — verify thumb row shows exactly 2
- [ ] `/en/cart` — empty state, add flow, quantity adjust, remove
- [ ] `/en/checkout` — form renders, mock payment banner
- [ ] `/en/about` — long-form reveals
- [ ] `/en/contact` — ContactBG1.jpg @ 55%, contact cards
- [ ] `/en/login` + `/en/forgot-password` + `/en/reset-password/<fake-token>`
- [ ] `/en/account` after login
- [ ] `/en/legal/<slug>` — expect graceful 404 (legal markdown not yet populated)

### 1.2 Storefront RTL Hebrew (default locale)

Same list on the Hebrew side. Key checks: `dir="rtl"`, `lang="he"`, Hebrew titles everywhere, MeetYarit word cascade right-to-left, testimonials from the RTL start edge, cart/checkout/account all RTL.

### 1.3 Mobile (375×812)

- [ ] No horizontal scroll
- [ ] Hero logo size works
- [ ] Desktop nav hidden, hamburger visible
- [ ] **MobileNav opens full-viewport slide-in drawer** (portal fix from this session — double-check it still works on prod)
- [ ] Drawer has close X, brand name, 4 nav links, account link, language switcher, theme toggle
- [ ] CategoryGrid + FeaturedProducts heading pins do NOT fire
- [ ] Cart drawer doesn't block checkout button
- [ ] Shop grid is 2 columns, product detail gallery is touchable

### 1.4 Tablet (768×1024) + Reduced motion + Dark mode + Admin + Hygiene

Same checklist structure as the previous prompt — use the archived `docs/NEXT-SESSION-PROMPT-2026-04-11-post-launch-catalog-sync.md` §1.4-§1.10 for the full checklist if needed.

**Key admin checks (once Track 0 is fixed):**
- Login with real prod credentials → dashboard
- Products list — thumbnail column (Track B.1)
- Product edit with `type=stocked` — stock +/- buttons (Track B.2)
- Dashboard recent-orders empty state (Track B.3)
- Live Preview button on product edit (Track B.4)
- HelpButton popover
- Language switcher pill

**Hygiene:** 0 console errors, 0 500s, 0 404 images, `tsc + lint + build` green.

---

## Track 2 — Design refinement (only after Track 0 + 1 stable)

**Budget ~20% of the session.** Pick 2-4 of:

1. Logo sizing on mobile — verify `h-72/md:h-[28rem]` + `mt-6/md:mt-10` feels right on 375×812
2. Hero vignette intensity at dark + light
3. Product card hover state with the new Forever Living photography
4. Footer conditional rendering when SiteSettings fields are unset
5. Testimonials sprig SVG clipping on narrow viewports
6. Dark-mode product detail contrast (`--color-muted` variant)
7. Admin chrome warmth consistency (pull raw colors through theme tokens)
8. Category tile image crop focal points at multiple widths
9. Favicon refresh (generate from Copaia tree logo, drop at `src/app/icon.png` + `apple-icon.png`)
10. OG / social share card for the Copaia URL

---

## Track 3 — GSAP motion polish

**Budget ~20% of the session.** Pick 2-3 of:

1. Cart drawer item stagger on enter (40ms stagger, 12px y-offset)
2. 404 page GSAP intro (headline cascade + illustration drift)
3. Checkout success page confetti via existing `fireConfetti('celebration')`
4. Dashboard stat CountUp verification (the Track B.3 recent-orders section was added below stats — check CountUp still fires)
5. Product gallery thumb hover feedback (scale 1 → 1.04)
6. Category tile T2.8 magnetic tilt verification on prod
7. Newsletter submit button press bounce (same pattern as add-to-cart)
8. Hero headline exit rotationX tilt (0 → -4° on scroll-away)

**Non-negotiables for every new motion addition** (CLAUDE.md rule #12):
- `immediateRender: false + once: true + start: 'top bottom-=40'` on every `gsap.from + scrollTrigger`
- Single GSAP entry: `import { gsap } from '@/lib/motion/gsap'`
- `prefers-reduced-motion: reduce` snaps to final state
- Touch devices get a sensible fallback
- Additive only — don't remove existing keyframes

---

## Non-negotiables (same every session)

1. **Never push to main without explicit user word** — `git push origin main` + `npx vercel --prod --yes` require "push" / "deploy".
2. **Motion is additive only** — don't touch motion primitives except to add new variants.
3. **`setRequestLocale` + `getTranslations`** in every server page/layout.
4. **`cookies()`, `headers()`, `draftMode()` are async** — Next 16 breaking change.
5. **Never import `next/link` in storefront** — use `Link` from `@/lib/i18n/navigation`.
6. **Single GSAP entry point** — `@/lib/motion/gsap`.
7. **Brand data stays in `src/brand.config.ts`** — never hardcode the brand name in a component.
8. **Server → client props are serializable only** — no function props.
9. **Hebrew + English strings always go through `src/messages/{he,en}.json`.**
10. **Never re-add `generateStaticParams` returning only `{locale}`** — CI fails. See ADR-018.
11. **Every `gsap.from + scrollTrigger` needs `immediateRender: false + once: true + start: 'top bottom-=40'`** — CLAUDE.md rule #12.
12. **Prod DB changes require explicit user approval** — see the 2026-04-11 very-late STATE.md entry for the catalog sync pattern.
13. **If you touch an env var on Vercel, redeploy.** `payload.config.ts` reads `BLOB_READ_WRITE_TOKEN` at build time — adding an env var after a deploy without rebuilding means the running deployment won't see it.
14. **If you register a new custom admin component, verify it builds to prod** — don't assume local dev success means prod will work. This session's P0 bug is a direct example.

---

## Working directory + quality gates

```bash
cd C:/AI/YaritShop/yarit-shop
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0, 0 errors 0 warnings
npm run build           # must exit 0, all 40 routes ƒ/○, zero SSG
```

**Dev server:** `npm run dev` → http://localhost:3000. Hits `copaia-dev.db`.

**Prod-mode local preview** (for accurate motion timing):
```bash
rm -rf .next
npm run build
npx next start -p 3009
# Or use preview_start("yarit-shop-prod") from the Preview MCP
```

---

## Definition of done

- [ ] **Track 0 — admin fix shipped**, prod `/admin/login` renders the login form, Yarit can log in
- [ ] **Track 1 QA** — every checkbox in §1.1 through §1.4 either ✓ or has a fix commit
- [ ] **Track 2 design** — 2-4 refinements shipped, each verified on prod preview
- [ ] **Track 3 motion** — 2-3 GSAP additions shipped under the bug-fix pattern
- [ ] All quality gates green
- [ ] `git push origin main` only after explicit user word
- [ ] `npx vercel --prod --yes` only after explicit user word
- [ ] `docs/STATE.md` has a new "Latest" entry describing this session's work
- [ ] If all tasks ship: archive this prompt → `docs/NEXT-SESSION-PROMPT-<date>-admin-fix.md` and write a short successor

---

## Quick-start cheatsheet

First 5 minutes:

```bash
# 1. Confirm baseline
git log -1 --oneline            # should show 3cd2bb4
git checkout -b feat/admin-fix-and-qa

# 2. Reproduce the admin bug locally with a prod build
rm -rf .next
npm run build
npx next start -p 3009
# In browser: http://localhost:3009/admin/login
# If blank → bug is reproducible locally, proceed with debugging
# If the form renders → bug is prod-env specific, check Vercel build/runtime logs

# 3. Quick prod customer-facing health check (should all be 200)
curl -sS -o /dev/null -w "home=%{http_code}\n" "https://yarit-shop.vercel.app/en"
curl -sS -o /dev/null -w "shop=%{http_code}\n" "https://yarit-shop.vercel.app/en/shop"
curl -sS -o /dev/null -w "product=%{http_code}\n" "https://yarit-shop.vercel.app/en/product/aloe-drink"
curl -sS "https://yarit-shop.vercel.app/api/products?limit=20&depth=0" | python -c "import json,sys; d=json.load(sys.stdin); print(d.get('totalDocs'),'products')"
```

Expected: `3cd2bb4`, new branch, local prod-mode running on 3009, `200/200/200`, `8 products`. If the admin bug reproduces at step 2, you have a local repro and can debug without touching prod.

**The customer-facing Copaia site is live and working. The admin panel needs a focused fix before anything else. Restraint over flash. Slow over fast. Additive over replacement.**
