# Design reference — Living Garden

> **Source of truth for the full design overhaul. Created 2026-04-18 based on `/New/handoff/design/LivingGarden/`.**
>
> This doc catalogs every token, component, and interaction in the new "Living Garden" design direction so that any session can implement a slice without re-reading the raw HTML references each time. The raw HTML prototypes live in `New/handoff/design/LivingGarden/` — open them in a browser to verify any detail.
>
> **All classnames in this doc use the `g-` prefix from the prototypes for precise reference. When implementing in the real codebase we use Tailwind utilities + React components — `g-` classnames are NOT shipped.**

---

## 1. Brand shift

| | Before (Copaia, current prod) | After (Living Garden) |
|---|---|---|
| Wordmark | `קופאה` / `Copaia` | `Yarit°` (degree mark) |
| Brand subtitle | — | `— small apothecary` (italic, mute) |
| Tagline | `שורשים של בריאות` / `Rooted in wellness` | `בריאות שצומחת אִתָּךְ` / `Wellness that grows with you.` |
| Long description | `חנות מוצרי טבע ובריאות — מבחר אישי של ירית` | `Small-batch aloe, bee, and botanical formulas. Hand-selected by Yarit since 2009, shipped across Israel in tissue-wrapped packages.` |
| Persona | "Natural wellness shop" | "Small apothecary, grown slowly" — handmade, editorial, seasonal-harvest vocabulary |

**Year references:** Yarit founded the shop in 2009. 17 years tending, 34 living formulas, 7,000 returning customers — use these numbers in hero stats + about timeline.

**User must confirm** before the rename lands: "Yarit°" is a brand rename — the third since this project started (Shoresh → Copaia → Yarit°). The domain would also eventually move from `yarit-shop.vercel.app` to something like `yarit.co.il`.

---

## 2. Design tokens

```css
/* Palette */
--g-bg:        #EFE6D1;  /* page background (parchment) */
--g-bg-2:      #E8DCC0;  /* cream deeper shade */
--g-ink:       #2A2416;  /* primary text, buttons */
--g-paper:     #FFF8E6;  /* card/surface */
--g-rule:      #D4C299;  /* hairline/shadow */
--g-rule-soft: #E3D5AA;
--g-leaf:      #6B8E4E;  /* accent — living green */
--g-leaf-deep: #4A6836;  /* CTAs, deep brand */
--g-ember:     #C46B3A;  /* warm accent, italics, highlights */
--g-ember-deep:#9A4E26;
--g-mute:      #8A7B58;  /* secondary text */
```

**Mapping to Tailwind v4 `@theme` block in `globals.css`:**
- `--color-background: var(--g-bg)`
- `--color-surface-warm: var(--g-paper)`
- `--color-primary: var(--g-leaf)`
- `--color-primary-dark: var(--g-leaf-deep)`
- `--color-accent: var(--g-ember)`
- `--color-accent-deep: var(--g-ember-deep)`
- `--color-foreground: var(--g-ink)`
- `--color-muted: var(--g-mute)`
- `--color-border-brand: var(--g-rule)`

Keep legacy admin palette unchanged in `admin-brand.css` — the admin keeps its Night Apothecary look.

---

## 3. Typography

Four fonts, loaded via `next/font/google`:

| Role | Font | Weight / style | CSS var |
|---|---|---|---|
| Display | `Fraunces` | 400 regular + 400 italic + 500 | `--g-display` (also `--font-fraunces`) |
| Body | `Source Serif 4` | 400, 400 italic, 600 | `--g-body` (also `--font-source-serif`) |
| Handwritten accent | `Caveat` | 400, 700 | `--g-accent` (also `--font-caveat`) |
| Mono kicker | `JetBrains Mono` | 400, 500 | `--g-mono` (also `--font-jetbrains`) |
| Hebrew fallback | `Heebo` | kept from current project | `--font-heebo` |

**Size scale:**

| Class | Purpose | Size | Notes |
|---|---|---|---|
| `.g-h1` | Hero | `clamp(56px, 9vw, 144px)` / `line-height: 0.92` / `letter-spacing: -0.03em` | `<em>` renders in `--g-ember`, italic. |
| `.g-h2` | Section head | `clamp(40px, 5vw, 72px)` / `line-height: 1.0` / `letter-spacing: -0.02em` | `<em>` renders in `--g-leaf-deep`, italic. |
| `.g-h3` | Subhead | `32px` / `line-height: 1.1` | |
| `.g-page-title h1` | Page title | `clamp(56px, 8vw, 112px)` | Centered on most inner pages. |
| Body | 17px / 1.55, color `--g-ink` |
| `.g-note` | Handwritten | 28px Caveat, `--g-ember`, `transform: rotate(-2deg)` |
| `.g-kicker` | Mono eyebrow | 11px, `letter-spacing: 0.25em`, uppercase, `--g-leaf-deep`. Has 24px 1px hairlines before + after (`::before` + `::after` pseudo-elements). `.g-kicker.left-only` hides the trailing one. |

**Headline rhythm convention:** Almost every heading mixes upright, italic, and a highlighted word — e.g. `The whole garden` or `Wellness that *grows* with you.` The italic span is `<em>`; the highlighted span wraps in `<span class="g-under">…</span>` which draws a 0.35em skewed ember rectangle behind it via `::after`.

---

## 4. Layout primitives

- **Wrap:** `.g-wrap` — `max-width: 1360px; margin: 0 auto; padding: 0 48px; position: relative;`
- **Section:** `.g-section` — `padding: 100px 0` standard, `.g-section-tight` is `64px`.
- **Paper surface:** `.g-section-paper` — `background: var(--g-paper); border-radius: 24px; padding: 64px 56px; box-shadow: 0 2px 0 var(--g-rule);`
- **Spacing:** 8px grid throughout.
- **Radii:** organic + asymmetric. Cards `16px 16px 28px 28px`, hero visual `260px 260px 24px 24px`, PDP main `280px 280px 20px 20px`, buttons `999px`.
- **Shadows:** double-layer convention. Hairline offset `0 2px 0 var(--g-rule)` as the "printed paper" shadow + soft bloom `0 36px 56px -24px rgba(107,142,78,0.4)` on hover.
- **Grids:** `.g-grid-2` (1fr 1fr, 48px gap), `.g-grid-3` (3 cols, 32px gap), `.g-grid-4` (4 cols, 24px gap).

---

## 5. Body ambient layers

Two full-viewport layers behind all content, painted via body pseudo-elements:

```css
body::before {
  /* watercolor bokeh — 3 overlapping radial gradients */
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(800px 600px at 15% 10%, rgba(196, 107, 58, 0.10), transparent 60%),
    radial-gradient(900px 700px at 85% 30%, rgba(107, 142, 78, 0.12), transparent 65%),
    radial-gradient(700px 500px at 50% 80%, rgba(212, 194, 153, 0.18), transparent 60%);
}
body::after {
  /* SVG fractal noise, mix-blend-mode: multiply, opacity: 0.35 */
  /* see styles.css line 42 for the exact feTurbulence inline SVG */
}
main, header, footer { position: relative; z-index: 2; }
```

---

## 6. Nav chrome (`.g-nav`)

Sticky, `top: 0`, `z-index: 40`.

```
┌─ Yarit° — small apothecary  ────  Home  Shop  Journal  Our story  Contact  ───  [עב]  👤  🛒·3 ─┐
└──────────────────── 82% opacity parchment + 10px backdrop-blur + 1px rule bottom ───────────────┘
```

- Brand: Fraunces 26px + `<sup>°</sup>` in Caveat `--g-ember`.
- Links: 14px body font, 32px gap. Active link has ember underline via `::after` with `transform: skewX(-8deg)`.
- Right cluster: 40×40 circle icon buttons with 1px rule border, parchment fill, `translateY(-2px)` on hover, flip to leaf fill + paper color.
- Cart badge: `.g-nav-badge` — absolute top-right ember pill with mono numeric count.
- Language pill: `.g-lang-pill` — mono 11px text inside a 1px-outline rounded-full pill. Two-letter glyph toggles `עב ↔ EN`.
- **Mobile:** the `.g-nav-links` row is hidden < 900px — needs a hamburger drawer (not prototyped, reuse current project's `MobileNav` pattern).

**NO theme toggle.** Dark mode is disabled (from the prior session).

---

## 7. Buttons

| Class | Look |
|---|---|
| `.g-btn` | Pill, `background: var(--g-ink)`, paper text, 16px 28px padding, 16px body font 600-weight. `translateY(-2px)` on hover with a warm ink shadow. |
| `.g-btn-leaf` | Same as base but `background: var(--g-leaf-deep)`. |
| `.g-btn-ember` | Same as base but `background: var(--g-ember)`. Used for primary CTAs (Add to basket, Place order). |
| `.g-btn-ghost` | Transparent background, `color: var(--g-ink)`, `border: 1.5px solid var(--g-ink)`. |
| `.g-btn-block` | Width 100%, centered, 20px padding, 17px font. |

Icon buttons (wishlist, nav icons): circular 40×40 or 36×36, 1px rule border, parchment fill.

---

## 8. Product card `.g-card`

```
┌──── parchment, radius 16 16 28 28, 2px-rule hairline shadow ────┐
│  ┌── 4/5 aspect plate image (placeholder in prototypes) ──┐      │
│  │  [SIGNATURE · 2026]        ❀ bloom corner glyph       │      │
│  │                                                        │      │
│  │                            № 001                       │      │
│  └────────────────────────────────────────────────────────┘      │
│  NUTRITION (mono cat)                                           │
│  Product name (Fraunces 22px)                                   │
│  Short description (13px mute)                                  │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ (dashed rule)     │
│  ₪155                                        [ + Add ] pill    │
└─────────────────────────────────────────────────────────────────┘
```

**Interactions (via CSS custom properties set by `alive.js` on pointermove):**
- `::before` radial glow at `var(--mx) var(--my)` fades in on hover.
- Card itself: `transform: translateY(-10px) perspective(900px) rotateX(var(--tx)) rotateY(var(--ty));` — max ±6°.
- Bloom glyph (`❀`) starts static, spins infinite on hover (`g-bloom-spin` keyframes).
- Hover shadow adds soft leaf bloom `0 36px 56px -24px rgba(107,142,78,0.4)` on top of hairline.

**Plates** (`.g-plate`, `.g-plate-leaf`, `.g-plate-ember`, `.g-plate-cream`, `.g-plate` bare):
- Placeholder radial-gradient + linear-gradient backgrounds.
- `::before` paints a botanical line-art SVG inset at 10% opacity 0.65.
- `.g-plate-tag` — top-left mono pill (blur-backdrop) for badge text like `SIGNATURE · 2026`.
- `.g-plate-specimen` — bottom-right Caveat label "№ 001".
- **When wiring real photos:** replace the gradient background with `<Image>` but keep the tag + specimen overlay system. The plate-kind becomes a colorway hint for overlay accents.

---

## 9. Signature "alive" layer

Global, mounted in root layout. Implemented in vanilla JS in `alive.js` — needs to be ported to a React client component (see §14).

1. **Leaf trail (`pointermove` throttled 80ms).** On every mouse movement spawn one of `❦ ❀ ✿ ❧ ✾ ❣` at cursor. Animate 2.4s: fade in at 15%, drift ±140px horizontal + 200px down + random ±80° rotation. Size 14–32px. Color alternates `--g-leaf` / `--g-ember`. 2500ms timeout then DOM-remove.
2. **Cursor spotlight (`.g-cursor-spot`).** Fixed 360×360 radial gradient (ember center → leaf mid → transparent), `z-index: 9998`, `mix-blend-mode: multiply`, follows cursor.
3. **Scroll vine (`.g-scroll-vine`).** Fixed right edge (`left` in RTL), 18px from edge, 48px wide, full viewport height. SVG with a sinusoidal path built once (48 segments, amplitude 18, period ~`0.5 × i`). `stroke-dashoffset` interpolated from viewport-scroll progress × 1.5. 18 leaf glyphs along the path fade in once `prog × 2400 > threshold + 40`.
4. **Card parallax + glow.** On pointermove over `.g-card`, compute cursor-relative px/py and set `--mx`, `--my` (radial glow) + `--tx`, `--ty` (perspective tilt, ±6°) as CSS custom properties. Card's hover transform picks them up.
5. **Reveal on scroll.** Elements with `.g-reveal` (+ optional `.g-reveal-delay-{1,2,3}`) fade + slide up 40px → 0 when `getBoundingClientRect().top < innerHeight - 80`. Class `.is-in` added to freeze final state.
6. **Ambient sound pill (`.g-sound-toggle`).** Bottom-left fixed pill, visual-only in prototype. Production: load a looping 20s field recording (birds/garden), crossfade on toggle. Caveat label "ambient sound" / "ambience on".
7. **Marquee banner (`.g-banner`).** Horizontal infinite scroll between hero and featured section. Leaf-deep background, paper text, mono uppercase 13px with 0.3em letter-spacing. 32s linear animation on `.g-banner-track`. `bannerLine` copy: `Free shipping over ₪200 · 30-day returns · Hand-wrapped orders · Ships within 2 days`.

**All interactions MUST respect `prefers-reduced-motion`:**
- Leaf trail + cursor spotlight disabled entirely.
- Scroll vine static (path fully drawn, no animation).
- Card parallax snaps to final state on hover.
- Reveals snap instantly to `.is-in`.

---

## 10. Shared section components

- `.g-kicker` — mono eyebrow with hairline rules on each side.
- `.g-note` — handwritten Caveat rotated −2°.
- `.g-float-badge` — floating pill (hero uses two — "100% natural" with leaf dot, "small-batch" with ember dot).
- `.g-banner` + `.g-banner-track` — marquee.
- `.g-story-grid` (1fr 1.3fr with image-left). `.g-story-body p:first-of-type::first-letter` — 72px Fraunces drop cap in ember.
- `.g-ing-rail` — 4-col grid. `.g-ing` card has `.g-ing-mark` (46px Fraunces italic single letter), `.g-ing-name`, `.g-ing-desc`. On hover: `translateY(-6px) rotate(-1deg)`.
- `.g-quote` — testimonial card with oversized 96px Fraunces opening quote via `::before`. Quote text Fraunces 22px italic. `.g-quote-avatar` 44px circle filled with leaf.
- `.g-cats` — 5-column category grid. Each `.g-cat` tile shows `№ 01 items` mono count + category name + a single-glyph icon in leaf color.

---

## 11. Pages — what to build

All 9 pages come from the prototypes at `New/handoff/design/LivingGarden/*.html`. Read them in a browser before implementing.

| Page | Route | Main sections | Notes |
|---|---|---|---|
| Home | `/` | Hero + marquee + featured grid (4-col) + category garden + story strip + ingredients rail + testimonials | Hero has 1.3fr/1fr grid — copy left, 4/5 visual right with `260px 260px 24px 24px` radius. |
| Shop | `/shop` | Page-title block + `[240px sidebar filters / 3-col product grid + pagination]` | Filters: category, price range, concern, stock. Sort dropdown in grid header. |
| Product (PDP) | `/product/[slug]` | Breadcrumb + `[80px thumbs / 1.1fr media + 1fr details]` + tabs (Story / Ingredients / How to use / Reviews) + related (4-col) | Media radius `280px 280px 20px 20px`. Variant pills `.g-pdp-opt`, quantity stepper `.g-pdp-qty`, wishlist circle icon. 2×2 meta grid with iconic bullets (Ships in 2 days / 30-day guarantee / Batch / 100% natural). |
| Cart | `/cart` | Page-title + `[1.5fr list / 1fr sticky summary]` | Line items: 140px thumb / details / line total. Gift-note card with dashed-underline Caveat textarea in ember. Summary: promo code, subtotal, shipping, VAT, total, ember CTA block. |
| Checkout | `/checkout` | Step pills (1-2-3) + 3 paper blocks (Contact / Deliver to / Payment) + sticky order summary with hand-wrap callout | Form fields: label (mono uppercase) + input (paper bg, 1.5px rule, 12px radius, focus = ember border). Payment options grid `[Card / Bit / PayPal]`. |
| About / Our story | `/about` | Page-title + hero visual + long story (3 paragraphs with drop cap) + 5-col timeline + 4 values rail + dark "Visit the shop" CTA card | Timeline years in Caveat ember 32px. |
| Journal | `/journal` | Page-title + 3-col post grid with letter-format cards (tag badge on plate, title, mono read-time, ember "read →") | **New Payload collection: `Posts`.** |
| Contact | `/contact` | Page-title + `[Send a note form / [Visit studio + FAQ accordion]]` | FAQ uses native `<details>` in paper cards. |
| Account | `/account` | Page-title + `[240px sidebar nav / content]` | Content: leaf-deep Garden points card with 72px number, recent orders rail (thumb / №ID + date / status pill / total / details →), wishlist 3-grid. Status pills: delivered/shipping/processing in semi-transparent tints. |

---

## 12. i18n

Every string in the prototype is bilingual via `data.js` `COPY.en` / `COPY.he` parallel dictionaries. The full dictionary spans ~60 keys across hero / featured / categories / story / ingredients / testimonials / PDP meta / cart / checkout / account / footer.

**Port to the existing `src/messages/{he,en}.json`:** add a new namespace per page (e.g. `home`, `shop`, `product`, `cart`, `checkout`, `about`, `journal`, `contact`, `account`) and a shared `brand` namespace for hero kickers + footer copy. Reuse the next-intl `useTranslations(namespace)` pattern already established.

RTL: Hebrew sets `<html dir="rtl">`. Logical padding already in use. The existing `routing.ts` from next-intl handles locale detection — keep it.

---

## 13. Data

**Catalog structure** (from `data.js`) maps cleanly to the existing Payload `products` and `categories` collections. 5 categories (`nutrition`, `skincare`, `aloe`, `beauty`, `gifts`), 8 products — identical slugs to what's currently seeded except one of the 8 is new (`bee-pollen` exists; the `badge: 'new' | 'bestseller'` field is new). New fields needed on `Product`:
- `plate` — enum `'leaf' | 'ember' | 'cream' | ''` (colorway hint)
- `specimen` — string (e.g. `001` through `008`)
- `badge` — optional enum `'new' | 'bestseller'`

**New Payload collection: `Posts`** for the Journal:
- `slug` — required unique
- `title` — localized (he/en)
- `excerpt` — localized
- `body` — rich text (Lexical), localized
- `tag` — enum like `'from-the-kitchen' | 'formulas' | 'field-notes' | 'gifting' | 'life'`
- `readTime` — number (minutes)
- `plate` — enum same as Product
- `coverImage` — upload relation
- `publishedAt` — date

---

## 14. Motion implementation strategy

The prototype's `alive.js` is vanilla DOM/JS. For the real codebase, **replace with a single React client component** mounted once in the root layout:

```tsx
// src/components/living-garden/GardenAlive.tsx
'use client'
export function GardenAlive() {
  // useEffect: mount spotlight + leaves + vine DOM once.
  // useEffect: add pointermove + scroll listeners (passive).
  // Clean up on unmount.
  // Gate everything behind useReducedMotion (from existing src/lib/motion/*).
}
```

**GSAP vs. vanilla decision (for the next session to settle):**
- The current project has heavy GSAP investment (Tier-1 + Tier-S shipped, ScrollTrigger in use).
- The prototype's alive.js is deliberately lightweight vanilla for the "alive" interactions — they're cursor-driven, high-frequency, and don't need a timeline abstraction.
- **Recommended:** keep scroll-triggered reveals on GSAP's ScrollTrigger for consistency with the rest of the codebase. Implement the cursor trail + spotlight + card parallax in plain JS/React (CSS custom properties + pointermove). The vine SVG is a small bespoke component with its own rAF loop.

---

## 15. Fonts loading

In `src/app/(storefront)/[locale]/layout.tsx`, add:

```ts
import { Fraunces, Source_Serif_4, Caveat, JetBrains_Mono, Heebo } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], weight: ['400', '500'], variable: '--font-fraunces', display: 'swap' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], style: ['normal', 'italic'], weight: ['400', '600'], variable: '--font-source-serif', display: 'swap' })
const caveat = Caveat({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-caveat', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains', display: 'swap' })
const heebo = Heebo({ subsets: ['hebrew', 'latin'], weight: ['400', '500', '700'], variable: '--font-heebo', display: 'swap' })

// on <body>: className={`${fraunces.variable} ${sourceSerif.variable} ...`}
```

Remove `Bellefair` (old display). `Heebo` stays for Hebrew letter shapes.

---

## 16. Files to read before implementing

Anyone implementing any slice of this design MUST read:

1. `/New/handoff/README.md` — client-facing design handoff summary
2. `/New/handoff/design/LivingGarden/styles.css` — 622-line single stylesheet with every token + component
3. `/New/handoff/design/LivingGarden/alive.js` — 136-line motion layer
4. `/New/handoff/design/LivingGarden/shared.js` — 173-line nav/footer/card/i18n helpers
5. `/New/handoff/design/LivingGarden/data.js` — 148-line catalog + COPY dictionaries
6. The specific page HTML you're implementing (9 files, ~100-200 lines each)

The HTML files run in any browser — open them to interact with the design.
