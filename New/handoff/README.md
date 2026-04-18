# Handoff: YaritShop — Living Garden Redesign

## Overview
Complete redesign of **yaritshop.com**, a boutique Israeli wellness shop (aloe, bee & botanical products, est. 2009).
The new direction — *Living Garden* — is a warm, handmade, editorial commerce experience with a signature "alive" feel: the site literally grows as you scroll, leaves drift from the cursor, and product cards breathe.

## About the Design Files
The files in `design/` are **design references created in HTML** — prototypes showing intended look and behavior, **not production code to copy directly**.
Your task is to **recreate these designs in the target codebase's existing environment** (the live yaritshop.com stack — likely Next.js / React + Tailwind or similar), using that project's established routing, component patterns, and data layer. If no environment exists yet, pick the best fit (Next.js 14 App Router + Tailwind + Framer Motion is recommended).

## Fidelity
**High-fidelity.** All colors, typography, spacing, radii, and animations are finalized. Reproduce pixel-perfectly, then swap placeholders for real product imagery.

## Pages included
All files live in `design/LivingGarden/`:

| File | Page | Purpose |
|---|---|---|
| `index.html` | Home | Hero, featured harvest, categories, story, ingredients, voices |
| `shop.html` | Shop | Filters + full product grid + pagination |
| `product.html` | PDP | Gallery, variants, CTA, meta, tabs, related |
| `cart.html` | Cart | Line items, gift note, summary |
| `checkout.html` | Checkout | 3-step form, payment, hand-wrapped callout |
| `about.html` | Our story | Long narrative, values, timeline, visit-us CTA |
| `journal.html` | Journal | Blog index with letter-format cards |
| `contact.html` | Contact | Message form, studio card, FAQ accordion |
| `account.html` | Account | Sidebar nav, points, orders, wishlist |

All pages are **bilingual (EN / HE, with RTL)** — toggle with the עב/EN pill in the nav.

## Design tokens

```css
--g-bg:        #EFE6D1;  /* page background (parchment) */
--g-bg-2:      #E8DCC0;
--g-ink:       #2A2416;  /* primary text */
--g-paper:     #FFF8E6;  /* card/surface */
--g-rule:      #D4C299;  /* hairline/shadow */
--g-rule-soft: #E3D5AA;
--g-leaf:      #6B8E4E;  /* accent — living green */
--g-leaf-deep: #4A6836;  /* CTAs, deep brand */
--g-ember:     #C46B3A;  /* warm accent, italics, highlights */
--g-ember-deep:#9A4E26;
--g-mute:      #8A7B58;  /* secondary text */
```

**Type scale**
- Display: `Fraunces` (400 / 400 italic / 500) — hero H1 `clamp(56px, 9vw, 144px)`, H2 `clamp(40px, 5vw, 72px)`, H3 `32px`. Letter-spacing −0.02em to −0.03em.
- Body: `Source Serif 4` — 17px / 1.55.
- Handwritten accent: `Caveat` — for notes, pricing labels, "from the kitchen" one-liners. 18–32px, rotated −2° to −4°.
- Mono kicker: `JetBrains Mono` — 11px, 0.25em letter-spacing, uppercase, with 24px hairline before/after.

**Spacing** — 8px grid. Section padding 100px vertical, 48px horizontal within 1360px wrap.
**Radii** — organic/asymmetric: cards `16px 16px 28px 28px`, hero visual `260px 260px 24px 24px`, buttons `999px`.
**Shadows** — double-layer: hairline offset `0 2px 0 var(--g-rule)` + soft bloom `0 28px 44px -20px rgba(107,142,78,0.35)` on hover.

## Alive moments (signature)
All live in `alive.js` + `styles.css`. A developer should implement equivalent behavior with their framework's animation primitives (Framer Motion, CSS, etc.).

1. **Leaf trail** — on `pointermove`, throttled every ~80ms, spawn a random glyph (`❦ ❀ ✿ ❧ ✾ ❣`) at cursor pos. Animate 2.4s: fade in (15%), drift ±140px horizontal + 200px down, fade out. Random rotation & size 14–32px. Color alternates leaf / ember.
2. **Cursor spotlight** — 360px radial gradient (ember center → leaf mid → transparent) follows cursor at z-index 9998, `mix-blend-mode: multiply`.
3. **Scroll vine** — fixed right edge (left in RTL). SVG path of a sinuous vine whose `stroke-dashoffset` maps to scroll progress. 18 leaf glyphs along the path fade in as the vine grows past them.
4. **Card parallax + glow** — on pointermove over `.g-card`, set `--mx/--my` (for radial glow) and `--tx/--ty` (for perspective tilt, ±6°). `.g-card-bloom` (the ❀) spins on hover.
5. **Reveal on scroll** — elements with `.g-reveal` fade+slide up when they enter viewport. `.g-reveal-delay-{1,2,3}` staggers.
6. **Ambient sound pill** — bottom-left toggle. Currently visual-only. Production: load a looping field-recording (birds/garden) ~20s, crossfade on toggle.
7. **Marquee banner** — horizontal infinite scroll between sections (`bannerLine` copy, 32s linear).

## Component inventory

All classnames prefixed `g-`. Key components:

- `.g-nav` — sticky, 82% opacity backdrop-blur. Brand + links + lang pill + account + cart (with badge).
- `.g-btn`, `.g-btn-leaf`, `.g-btn-ember`, `.g-btn-ghost`, `.g-btn-block` — pill buttons with translateY hover.
- `.g-card` — product card (4/5 aspect img + body). Includes bloom corner glyph, dashed divider, pill "+ Add" CTA.
- `.g-plate`, `.g-plate-leaf`, `.g-plate-ember`, `.g-plate-cream` — placeholder image plates (radial gradients + botanical SVG line-art at 10% inset, + tag pill + specimen scribble). **Replace with real product photos** — keep tag/specimen overlay system.
- `.g-kicker` — mono eyebrow with hairline rules.
- `.g-h1`, `.g-h2`, `.g-h3` — fluid display type. Always mix upright + italic (`<em>`) + underline (`.g-under`, skewed ember highlight behind) for editorial rhythm.
- `.g-note` — Caveat handwritten label, rotated −2°.
- `.g-quote` — testimonial card with oversized opening quote mark.
- `.g-ing` — ingredient tile with single-letter display-italic mark.
- `.g-cart-row`, `.g-summary`, `.g-pdp-*`, `.g-form`, `.g-field`, `.g-pay`, `.g-steps`, `.g-order-row`, `.g-account-card` — see `styles.css`.

## Data

`data.js` mirrors the real catalog (from the existing yaritshop codebase):
- 5 categories (Nutrition, Skincare, Aloe, Beauty, Gifts)
- 8 products with slug / HE+EN name / short desc / price / cat / specimen / plate kind

Product image plates are keyed by `p.plate` (`leaf` | `ember` | `cream` | `''`). When wiring real photos, keep the plate-kind as a colorway/tag hint for overlays.

## i18n
`data.js` `COPY.en` and `COPY.he` are parallel keyed dictionaries covering every string. RTL is toggled on `<html dir="rtl">`; CSS uses logical paddings where needed (`[dir="rtl"] .x` selectors handle the rest).

## Implementation notes for Claude Code
1. Use App Router. One route per page file above.
2. Pull tokens into `tailwind.config.js` (custom colors, fontFamily, borderRadius). Or CSS vars + utility classes — either works.
3. The "alive" layer is a single client component mounted in the root layout. Use `useEffect` to add `pointermove` + `scroll` listeners. Respect `prefers-reduced-motion` — disable leaf trail and parallax.
4. Card parallax: use CSS custom properties (as done here) — cheaper than Framer per-card.
5. The vine SVG can be a reusable client component with the path built once; `stroke-dashoffset` updated via `requestAnimationFrame`.
6. Lang toggle: use Next.js i18n or a simple cookie-driven provider.
7. Replace all `.g-plate*` placeholders with `next/image` + real photography. The organic radii and the tag/specimen overlays stay.
8. Keep Fraunces + Caveat + JetBrains Mono via `next/font/google`.

## Assets
**None shipped.** All imagery is CSS-gradient + SVG line-art placeholders. The client will provide product photography for final implementation.

## Files in this bundle
```
design/LivingGarden/
  index.html
  shop.html
  product.html
  cart.html
  checkout.html
  about.html
  journal.html
  contact.html
  account.html
  styles.css      ← single stylesheet, all tokens & components
  data.js         ← catalog + bilingual COPY dictionary
  shared.js       ← nav / footer / product card / i18n helpers
  alive.js        ← cursor FX, scroll vine, reveal-on-scroll
README.md         ← this file
```

Open any HTML in a browser to explore. The nav lang pill toggles EN / עברית (full RTL).
