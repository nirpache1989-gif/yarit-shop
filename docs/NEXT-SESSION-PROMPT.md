# Next session — Living Garden design overhaul

> **Purpose:** Yarit has commissioned a full storefront redesign under a new design direction called **"Living Garden"**. High-fidelity HTML prototypes + a design brief live in `/New/handoff/`. This session is the FIRST implementation session of the redesign.
>
> **Read first:** `CLAUDE.md`, then `docs/DESIGN-LIVING-GARDEN.md` (full design reference), then `docs/STATE.md`, then skim `/New/handoff/README.md` and open `/New/handoff/design/LivingGarden/index.html` in a browser.
>
> **Previous session prompt (dark mode disable) archived at** `docs/NEXT-SESSION-PROMPT-2026-04-18-dark-mode-disable.md`.

---

## Scope in 30 seconds

The storefront is being redesigned end-to-end. The design language is **"Living Garden"** — a warm, handmade, editorial apothecary aesthetic with signature "alive" interactions: leaves drift from the cursor, cards tilt on hover, a vine draws itself along the right edge as you scroll, a marquee banner runs between sections, and an ambient sound pill sits bottom-left.

**What changes:** every storefront page, the color palette, all four fonts, the brand name, the home page structure, the motion system, and one new page (Journal / blog).

**What stays:** Payload CMS admin panel, database schema (mostly — two fields + one new collection), i18n routing (next-intl), auth, middleware, cart logic, checkout flow, payment provider abstraction, API routes, SEO routes, build + deploy pipeline.

**Fidelity:** high. Colors, typography, spacing, radii, and animations are finalized. Reproduce pixel-perfectly once photography lands (photos are TBD — use plate placeholders for now).

---

## Priority 0 — Get user confirmation on three open questions

Before writing any code:

1. **Brand rename Copaia → Yarit°?**
   - The prototype uses `Yarit°` (with degree mark) + `— small apothecary` subtitle.
   - This would be the third rename (Shoresh → Copaia → Yarit°). Domain, emails, invoices, social, admin meta all flip.
   - Confirm with user. If yes, this drives an update to `src/brand.config.ts`, a migration on `SiteSettings` (`brand.name`, `brand.tagline`), and a rewrite of `src/messages/{he,en}.json` for navigational brand references.
   - If user wants to keep "Copaia" on brand, we skip the rename and only apply the visual redesign. The prototype's wordmark would be replaced with "Copaia" / "קופאה" but everything else stays.

2. **Parallel route vs. main replacement?**
   - **A — Main replacement (riskier, cleaner):** feature branch `feat/living-garden`, rebuild storefront in place, ship when every page ships green. Prod stays on current Copaia look until the merge.
   - **B — Parallel `/garden/*` routes (safer):** mount every new page at `/garden/shop`, `/garden/product/[slug]`, etc. — existing `/shop` keeps serving current prod. Flip the root routes to point at the new components once everything is verified. Good for incremental review with user.
   - Recommend **A** if the user wants a big-bang reveal; **B** if they want to iterate page-by-page with visibility.

3. **Motion system: reuse GSAP or port to vanilla?**
   - The codebase has significant GSAP investment (Tier-1 waves + Tier-S shipped, ScrollTrigger wired in `src/lib/motion/gsap.ts`).
   - The prototype's `alive.js` is deliberately vanilla for cursor/scroll high-frequency interactions.
   - Recommend **hybrid**: keep GSAP + ScrollTrigger for reveal-on-scroll (consistency with current work); implement cursor spotlight + leaf trail + card parallax + scroll vine in plain React + CSS custom properties (lower overhead, simpler to reason about).

---

## Priority 1 — Implementation plan (proposed, user can reorder)

Split the work into **four phases** so every phase ships a green build and the site stays functional throughout.

### Phase 1 — Foundation (1 session)

Goal: tokens, fonts, global layers, but NO visible page changes yet.

- [ ] Add Fraunces, Source Serif 4, Caveat, JetBrains Mono, Heebo via `next/font/google` in `src/app/(storefront)/[locale]/layout.tsx` (Heebo already present).
- [ ] Remove Bellefair (old display). Keep the CSS variable name as an alias pointing at Fraunces for backwards compat OR drop it — depends on whether any admin component reads it.
- [ ] Update `src/brand.config.ts`:
  - `name` → `{ he: '(Yarit°|קופאה)', en: 'Yarit°' }` per P0.1 outcome
  - `tagline` → new copy (see `DESIGN-LIVING-GARDEN.md` §1)
  - `description` → new copy
  - `colors` → Living Garden palette
  - `fonts.display` → `'Fraunces'`, add `body`, `accent`, `mono`
- [ ] Update `src/app/globals.css`:
  - Replace `@theme` color tokens with Living Garden values
  - Add `--g-*` custom properties matching the prototype (map 1:1)
  - Add `body::before` watercolor bokeh + `body::after` noise layer
  - Keep the existing GSAP-related keyframes
  - Delete dark-mode-specific rules that target the hero logo PNG (no longer relevant)
- [ ] Build new motion client component `src/components/living-garden/GardenAlive.tsx` — cursor spotlight + leaf trail + scroll vine + `prefers-reduced-motion` gate. Mount in `(storefront)/[locale]/layout.tsx` only (NOT in the Payload admin).
- [ ] Build `src/components/living-garden/RevealOnScroll.tsx` — wrapper component or class utility using existing GSAP ScrollTrigger for `.g-reveal`/`.g-reveal-delay-*` behavior.

Verify: `tsc`, `lint`, `build` all green. No visible page changes because no page is using the new tokens yet (the old pages still reference the old palette variables which should stay intact for this phase only — re-map the CSS variable names so the old pages still render).

### Phase 2 — Chrome (1 session)

Goal: nav, footer, banner marquee, sound pill. Every page picks them up automatically.

- [ ] `src/components/layout/Header.tsx` — rebuild in Living Garden style (sticky, 82% opacity, backdrop-blur, Fraunces wordmark with degree mark, 32px link gap, 40px circle icons, cart badge, lang pill).
- [ ] `src/components/layout/Footer.tsx` — 5-col grid with dark `--g-ink` background + paper text + newsletter pill + mono bottom strip. Must keep the existing `isPlaceholder` guards on contact fields.
- [ ] `src/components/layout/BannerMarquee.tsx` — new component, CSS marquee 32s linear between sections on home only.
- [ ] `src/components/layout/AmbientSoundPill.tsx` — new component. Visual-only for this phase; real audio deferred to Phase 4.
- [ ] Mobile nav drawer: update existing `MobileNav` to match the Living Garden pill/icon style but keep the focus-trap + scroll-lock logic.

Verify in prod preview: every existing page still works with the new chrome. Content inside `<main>` stays on old design for now.

### Phase 3 — Pages (3-5 sessions)

Rebuild page-by-page. Each page ships a green build before moving on.

| Order | Page | Est. complexity | Notes |
|---|---|---|---|
| 1 | Home `/` | High | Most components (hero, marquee, featured, category garden, story, ingredients, testimonials). Sets the template for everything else. |
| 2 | Shop `/shop` | Medium | Reuse product card. New: sidebar filters, pagination. |
| 3 | Product `/product/[slug]` | Medium | Reuse product card for related. New: gallery, variant pills, tabs, PDP meta grid. Requires Payload schema update (see Phase 3.5). |
| 4 | Cart `/cart` | Medium | Reuse product line-item pattern. New: gift-note block, promo code. |
| 5 | Checkout `/checkout` | Medium | Steps + 3 paper blocks + hand-wrap callout. Keep existing payment-provider integration. |
| 6 | About `/about` | Low | Mostly static content with timeline + values rail + dark CTA card. |
| 7 | Contact `/contact` | Low | Form + studio card + FAQ accordion. |
| 8 | Account `/account` + `/account/orders/[id]` | Low-Medium | Sidebar nav + Garden points card + orders rail. Reuse existing auth + order fetch logic. |
| 9 | Journal `/journal` + `/journal/[slug]` | Medium | **New Payload `Posts` collection required** — see Phase 3.5. Index is a 3-col letter-card grid. Detail page not in prototype — design as a long-form reading layout matching the rest. |

### Phase 3.5 — Payload schema updates (bundled in with Phase 3 where relevant)

- [ ] Add `plate` field to `Products` — `select` with options `'leaf'`, `'ember'`, `'cream'`, `''`. Default `''`. Used as colorway hint for placeholders/overlays.
- [ ] Add `specimen` field to `Products` — `text`, e.g. `001`-`999`. Can auto-generate from product ID if not set.
- [ ] Add `badge` field to `Products` — `select` with `'new'`, `'bestseller'`, or null.
- [ ] Add `Posts` collection — fields listed in `DESIGN-LIVING-GARDEN.md` §13. Include Hebrew + English localization on title/excerpt/body. Lexical richtext for body. Upload relation for cover image.
- [ ] Regenerate `importMap.js` manually after adding the `Posts` collection — **DO NOT run `npm run build` without committing current `importMap.js` first** (prior P0 regression lessons learned).
- [ ] Seed script (`POST /api/dev/seed`) — add 6 sample journal posts to match the prototype's `posts` array.

### Phase 4 — Motion polish + photography wiring + final QA (1 session)

- [ ] Replace plate placeholders with real `next/image` product photos as Yarit provides them. Keep the tag + specimen overlay system (absolute-positioned on top of the image).
- [ ] Hook up the ambient sound pill to a real audio file (~20s looping field recording). Crossfade on toggle. Respect `prefers-reduced-motion` AND a user-level "sounds off" toggle.
- [ ] Full responsive pass — viewport ≤ 900px falls back to 1-column grids (already coded in `styles.css` — verify in Preview MCP at 375×812 and 768×1024).
- [ ] RTL sanity check — Hebrew renders every page correctly, scroll vine flips to left edge, nav badge flips, marquee direction still works.
- [ ] Accessibility audit — focus rings on all interactive elements, aria-labels on icon buttons, reduced-motion branches, color contrast AA across the new palette.
- [ ] Full prod QA walkthrough — every route, both locales, both viewports, dark-mode not present (verified).

---

## Priority 2 — What NOT to touch

- `src/collections/*` — keep collection logic, just add fields per Phase 3.5.
- `src/payload.config.ts` — keep admin + plugins wiring. Only the `theme: 'light'` addition from the prior session stays.
- `src/app/(payload)/*` — Payload admin route group. Untouched.
- `src/components/admin/*` — admin components. Untouched.
- `src/middleware.ts` — locale + admin middleware. Untouched.
- `src/lib/payments/*` — payment provider abstraction. Untouched.
- `src/lib/email/*` — email provider abstraction. Untouched.
- `src/app/api/*` — API routes. Untouched.
- `src/app/(storefront)/[locale]/layout.tsx` — keep the shell (NextIntlClientProvider, DriftingLeaves wrapper if we're replacing it, SkipLink). Replace only the header/footer slot contents.

---

## Priority 3 — Reference docs (read them)

- `docs/DESIGN-LIVING-GARDEN.md` — **full design reference** (tokens, components, pages, motion, i18n, data model)
- `docs/CLAUDE.md` — project rules (no hardcoded strings, `await params`, etc.)
- `docs/ARCHITECTURE.md` — current system shape
- `docs/DECISIONS.md` — add **ADR-021** for this redesign

Raw design files:
- `/New/handoff/README.md` — client-facing design summary
- `/New/handoff/design/LivingGarden/index.html` — home
- `/New/handoff/design/LivingGarden/shop.html` — shop
- `/New/handoff/design/LivingGarden/product.html` — PDP
- `/New/handoff/design/LivingGarden/cart.html` — cart
- `/New/handoff/design/LivingGarden/checkout.html` — checkout
- `/New/handoff/design/LivingGarden/about.html` — about
- `/New/handoff/design/LivingGarden/journal.html` — journal (new)
- `/New/handoff/design/LivingGarden/contact.html` — contact
- `/New/handoff/design/LivingGarden/account.html` — account
- `/New/handoff/design/LivingGarden/styles.css` — 622-line source of truth for CSS
- `/New/handoff/design/LivingGarden/alive.js` — 136-line motion layer
- `/New/handoff/design/LivingGarden/shared.js` — 173-line nav/footer/card helpers
- `/New/handoff/design/LivingGarden/data.js` — 148-line catalog + COPY dictionary

---

## Non-negotiables (same every session)

1. **Never `git push origin main` without explicit user word** ("push")
2. **Never `npx vercel --prod --yes` without explicit user word** ("deploy")
3. **Motion is additive only** — never remove existing keyframes
4. **`setRequestLocale` + `await params` / `await searchParams`** in every server page/layout
5. **Never import `next/link` in storefront** — use `Link` from `@/lib/i18n/navigation`
6. **Single GSAP entry point** — `@/lib/motion/gsap`
7. **Brand data stays in `src/brand.config.ts`**
8. **Server → client props are serializable only** — no function props
9. **Hebrew + English strings through `src/messages/{he,en}.json`**
10. **Never re-add `generateStaticParams` returning only `{locale}`** — CI fails per ADR-018
11. **Every `gsap.from + scrollTrigger` gets `immediateRender: false + once: true + start: 'top bottom-=40'`** per CLAUDE.md rule #12
12. **Prod DB changes require explicit user approval**
13. **If you touch a Vercel env var, redeploy** — middleware bakes them at build time
14. **Don't push or deploy in a loop without confirming each one with the user**
15. **`importMap.js` regenerates when you run `npm run build`** — always check the diff and restore the `VercelBlobClientUploadHandler` entry if it's gone (prior P0 — see STATE.md "Latest" entry for the fix)

---

## Working directory + quality gates

```bash
cd "C:/AI/YaritShop/yarit-shop"
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0, 0 errors 0 warnings
npm run build           # must exit 0
# after build: check `git diff src/app/(payload)/admin/importMap.js` — restore Vercel Blob line if missing
```

**Prod:** `https://yarit-shop.vercel.app`
**Admin:** `https://yarit-shop.vercel.app/admin/login` (password `CopaiaTemp2026!`)

---

## Definition of done (whole redesign)

- [ ] Phase 1 — Foundation shipped (fonts, tokens, motion primitives, body ambient layers)
- [ ] Phase 2 — Chrome shipped (nav, footer, marquee, sound pill)
- [ ] Phase 3 — 9 pages rebuilt (home, shop, product, cart, checkout, about, journal, contact, account)
- [ ] Phase 3.5 — Payload schema updated (3 Product fields + Posts collection + seed)
- [ ] Phase 4 — Real photography wired, ambient sound wired, responsive + RTL + a11y verified
- [ ] All quality gates green on every phase
- [ ] Full prod QA walkthrough clean
- [ ] User has signed off on the look via Preview MCP screenshots at each phase
- [ ] `docs/STATE.md` updated with each phase's ship
- [ ] This prompt archived and a new one written for the next phase

---

## Suggested first-session scope

Don't try to do everything. A realistic first-session slice:

1. ~5 min: read `DESIGN-LIVING-GARDEN.md`, open the prototype HTML files in a browser.
2. ~15 min: get user confirmation on P0.1 (brand rename?), P0.2 (main vs. parallel?), P0.3 (motion strategy?).
3. ~90 min: Phase 1 (foundation).
4. ~45 min: Phase 2 (chrome) if time.
5. Document + ship.

Phases 3 + 3.5 + 4 are multi-session work. Don't rush.
