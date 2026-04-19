# Session 20 — Living Garden Phase 3: Home page rebuild

> **Branch:** `feat/living-garden` (12+ commits ahead of `main`, branch-local only).
> **Prod:** unchanged at `d7a68bf` on `main`.
> **Read first (in this order):** `CLAUDE.md` → `docs/AI-COLLABORATION.md` → `docs/NEXT-SESSION.md` → `docs/DESIGN-LIVING-GARDEN.md` → `docs/CODEMAP.md`. Then skim the prior session: [`docs/sessions/session-19-living-garden-phase-1-remainder-phase-2-chrome.md`](sessions/session-19-living-garden-phase-1-remainder-phase-2-chrome.md).
>
> **Preview first.** Open `New/handoff/design/LivingGarden/index.html` in a browser before touching any code. Pay attention to the hero rhythm, the marquee → featured grid handoff, the category garden, the story strip with the drop cap, and the ingredients rail. This is the template the rest of the pages will follow.

---

## Where we are

Living Garden Phase 1 + Phase 2 shipped. Every storefront page now wears the new chrome (header, footer, marquee banner, ambient sound pill) but the `<main>` content inside each page still renders the **old Night Apothecary design**. We're in a transition state — finished chrome, unfinished bodies.

The motion layer is live end-to-end:
- `GardenAlive` — cursor spotlight, leaf trail, scroll vine, card parallax (vanilla React + CSS custom props, respects `prefers-reduced-motion`).
- `RevealOnScroll` — GSAP ScrollTrigger adapter for `.g-reveal` elements.
- `DriftingLeaves` — existing 5-leaf background layer (kept; coexists).
- Body ambient layers — bokeh + fractal noise via `body::before` / `body::after`.

The design tokens are loaded but largely unused (only chrome consumes them). Every Phase 3 page rebuild swaps its content from `--color-*` legacy to `--g-*` Living Garden tokens as it ships.

---

## Scope for session 20

**Build:** the Home page `/` rebuilt end-to-end in the Living Garden style.

**Do NOT touch** in this session:
- Any page other than Home (`/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/about`, `/contact`, `/account`, `/legal/*`) — those are sessions 21–27.
- Payload collections or admin — schema updates for Phase 3.5 (Posts collection + Product fields) bundle with the pages that need them.
- Middleware, API routes, payment / email abstractions.
- Any existing motion primitive (`GardenAlive`, `RevealOnScroll`, `FooterMotion`, `DriftingLeaves`, `HeroMotion` scrubs) — additive composition only.

### Home page sections (from `New/handoff/design/LivingGarden/index.html`)

1. **Hero** — `.g-hero` with `.g-hero-grid` 1.3fr/1fr. Left: kicker + Copaia° wordmark H1 with mixed upright + italic + underlined word, lead copy, CTA row, dashed meta strip with 3 stats (17 years, 34 living formulas, 7,000 customers). Right: 4/5 aspect `.g-hero-visual` with radius `260px 260px 24px 24px`, ember + leaf `.g-float-badge` floaters, handwritten `.g-hero-note`.
2. **Marquee banner** — *already shipped* via `MarqueeBanner` mounted in layout. No work here.
3. **Featured grid** — `.g-kicker` eyebrow + `.g-h2` heading, 4-col `.g-grid-4` of `.g-card` product cards with plate placeholder + `.g-card-bloom` glyph + mono category + Fraunces name + short desc + price row with `.g-btn-ember` "+ Add". Cards participate in `GardenAlive`'s parallax via the `.g-card` class.
4. **Category garden** — 5-tile `.g-cats` grid with `№ 0X items` mono count + Fraunces name + single-glyph icon in leaf color.
5. **Story strip** — `.g-story-grid` 1fr/1.3fr with image left, Fraunces drop cap on first paragraph (`::first-letter` 72px ember), Caveat-rotated `.g-note` floating accent, "Read the full story →" link.
6. **Ingredients rail** — 4-col `.g-ing-rail` of `.g-ing` cards, each with `.g-ing-mark` (46px Fraunces italic single letter), `.g-ing-name`, `.g-ing-desc`. Hover: `translateY(-6px) rotate(-1deg)`.
7. **Testimonials** — 3-col grid of `.g-quote` cards with oversized `::before` 96px Fraunces opening quote, 22px italic quote text, 44px `.g-quote-avatar` leaf circle + name + city.

**Data:**
- Featured + Category + Story + Ingredients + Testimonials copy pulls from `src/messages/{he,en}.json` — add a new `home` namespace (or extend the existing one — check what's already there and keep it additive).
- Product data for the featured grid loads via the existing `fetchFeaturedProducts` (or equivalent — see the current `HeroMotion` / `FeaturedProducts` imports).
- Category tiles map from the existing `Categories` collection — 5 categories already seeded.
- Ingredient + testimonial cards are hard data — live in i18n messages for now; no Payload schema change this session.

### Approach — bite-sized slices

Because Home is big, split into commits:

1. **Slice A — Hero.** Replace `HeroMotion.tsx` body (or create a new `HeroLivingGarden.tsx` client component — preserve the existing Hero entry timeline for reference; pick one based on reuse potential). Wire `.g-hero` + `.g-hero-grid` + `.g-float-badge` + `.g-hero-note`. Keep the GSAP entrance timeline pattern (logo → words stagger → subhead → CTAs) but re-target it at the new DOM.
2. **Slice B — Featured grid.** New `FeaturedProductsLivingGarden.tsx`. Reuse existing `<ProductCard>` data shape but render as `.g-card` with plate placeholder + bloom glyph. Verify `GardenAlive` card parallax picks up the CSS custom props on hover.
3. **Slice C — Categories.** New `CategoryGardenLivingGarden.tsx` rendering the 5-tile `.g-cats` grid.
4. **Slice D — Story strip.** New `StoryStripLivingGarden.tsx` with the drop cap + `.g-note` accent.
5. **Slice E — Ingredients rail.** New `IngredientsRailLivingGarden.tsx`.
6. **Slice F — Testimonials.** New `TestimonialsLivingGarden.tsx`.
7. **Slice G — Page wire-up.** Update `src/app/(storefront)/[locale]/page.tsx` to render the new sections in order. Remove the old Hero / FeaturedProducts / CategoryGrid / MeetYarit / Testimonials imports.
8. **Slice H — Add `.g-reveal` targets.** Sprinkle `.g-reveal` / `.g-reveal-delay-{1,2,3}` classes on the sections so `RevealOnScroll` animates them in.
9. **Verification + STATE update.**

Each slice ends with tsc + lint + build green + a commit. The site stays functional throughout — if a slice isn't ready, the old component stays rendered.

### Non-negotiables (inherited from prior sessions)

1. Every string through `src/messages/{he,en}.json` (CLAUDE.md rule #1).
2. `Link` / `usePathname` / `useRouter` from `@/lib/i18n/navigation`, never `next/link`.
3. Every server page: `setRequestLocale(locale)` at the top + `await params`.
4. `cookies()`, `headers()`, `draftMode()` are async in Next 16.
5. Single GSAP entry: `@/lib/motion/gsap`.
6. Every `gsap.from + scrollTrigger` gets `immediateRender: false + once: true + start: 'top bottom-=40'` (CLAUDE.md rule #12).
7. `useGsapScope` from `@/components/motion/GsapScope` for every GSAP client component — auto cleanup + reduced-motion gate built in.
8. After every `npm run build`, check `git diff src/app/(payload)/admin/importMap.js` and restore the `VercelBlobClientUploadHandler` line if wiped.
9. Never push or deploy without explicit user word (`push`, `deploy`).
10. RTL first-class: the hero grid should feel balanced in Hebrew too. Flip visual-on-the-right → visual-on-the-left naturally via `direction-aware` Tailwind (`ms-*` / `me-*` / `end-*` / `start-*`), NOT `left-*` / `right-*`.

### Design file references

- Raw home page: `New/handoff/design/LivingGarden/index.html`
- Styles: `New/handoff/design/LivingGarden/styles.css` (already partially ported into `src/app/globals.css`; any home-specific selectors still live in the prototype)
- Data dictionary: `New/handoff/design/LivingGarden/data.js` (`COPY.en` / `COPY.he` — source of truth for i18n strings)
- Full design reference: `docs/DESIGN-LIVING-GARDEN.md`

---

## Working directory + quality gates

```bash
cd "C:/AI/YaritShop/yarit-shop"
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0, 0 errors 0 warnings (2 pre-existing warnings in prototype handoff files are OK)
npm run build           # must exit 0
# after build:
git diff "src/app/(payload)/admin/importMap.js"     # expect empty; if not, restore from HEAD
```

Dev server auto-picks a free port via `.claude/launch.json` `autoPort: true`. Preview MCP uses the `yarit-shop dev` entry.

---

## What comes after session 20

Session-by-session forecast (rough — adjust based on how slices go):

| # | Page | Notes |
|---|---|---|
| 21 | `/shop` | 3-col grid + sidebar filters + pagination. Reuse `ProductCard` from session 20. |
| 22 | `/product/[slug]` | Gallery + variant pills + tabs + PDP meta grid. **Phase 3.5: adds `plate`/`specimen`/`badge` fields to Products.** |
| 23 | `/cart` | 2-col grid + gift-note block + promo code. Reuse line-item pattern. |
| 24 | `/checkout` | Step pills + 3 paper blocks + hand-wrap callout. Keep payment-provider integration. |
| 25 | `/about` | Page-title + hero visual + timeline + values rail + CTA. |
| 26 | `/contact` + `/account` | Short pages bundled. |
| 27 | `/journal` + `/journal/[slug]` | **Phase 3.5: new Payload `Posts` collection.** Index grid + detail layout. |
| 28 | Phase 4 polish | Real audio file, real photography, full responsive + RTL + a11y audit. |

Expect some slippage — Home alone may slip into session 21 if the hero + featured grid eat the budget.

---

## Definition of done for session 20

- [ ] All 7 home sections render in Living Garden style.
- [ ] `src/app/(storefront)/[locale]/page.tsx` imports the new sections only; old ones removed.
- [ ] `.g-reveal` classes sprinkled; `RevealOnScroll` animates sections as they enter the viewport.
- [ ] `GardenAlive` card parallax verified on the featured product cards (cursor over card → tilt).
- [ ] Both locales render correctly (LTR + RTL), mobile breakpoint collapses to 1-col cleanly.
- [ ] `npx tsc --noEmit && npm run lint && npm run build` green.
- [ ] `importMap.js` diff empty.
- [ ] Preview MCP screenshots captured and mentioned in STATE update.
- [ ] `docs/STATE.md` updated with session 20 changelog entry.
- [ ] `docs/NEXT-SESSION-PROMPT.md` rewritten for session 21 (or the Home page is split and session 21 finishes it).
- [ ] This prompt archived to `docs/sessions/session-20-home-page.md`.
