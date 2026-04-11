# Brand — Copaia (קופאה)

The brand is defined in `src/brand.config.ts` (TypeScript constants) and `src/app/globals.css` (`@theme` block with matching CSS variables). These two files must stay in sync manually.

**2026-04-11 rename:** The project was renamed from "Shoresh" (שורש) to "Copaia" (קופאה) on this date. The tagline and watercolor brand vocabulary were intentionally kept — the new Copaia tree-and-roots wordmark continues the botanical/natural visual direction. Historical references to "Shoresh" in `docs/STATE.md`, `docs/DECISIONS.md`, and archived `NEXT-SESSION-PROMPT*.md` files are left in place as historical facts.

## Name

- **Hebrew:** קופאה (pronounced ko-PA-eh)
- **Latin:** Copaia
- **Previous name:** Shoresh / שורש (retired 2026-04-11)

## Tagline

- **Hebrew:** שורשים של בריאות
- **English:** Rooted in wellness

The Hebrew tagline literally says "roots of wellness" — it was originally a wordplay on the old brand name "Shoresh" (root). After the rename, the imagery still matches the new Copaia tree-and-roots logo, so it stays.

## Logo

Source: `public/brand/logo.jpg` (moved from the new Copaia source `LogoCopaiaSMALL.jpg` during the 2026-04-11 rename). Stylized tree illustration with:
- Green leafy canopy
- Brown trunk with visible root system under the wordmark
- "COPAIA" wordmark integrated into the base of the trunk
- Warm parchment background (part of the JPG, not a solid colour you can cleanly delete)

The logo is referenced by `Header`, `HeroMotion`, the Payload admin `BrandLogo` + `BrandIcon`, and the admin `meta.icons` entry in `payload.config.ts`. All use the same `/brand/logo.jpg` path.

## AI-generated assets (`public/brand/ai/`)

A full set of watercolor illustrations generated with AI image tools in Phase C. All match the logo's style (soft watercolor, sage/tan/parchment palette) and are the fallback imagery when Payload-uploaded media isn't available.

### Category tiles (5)
Used by `CategoryGrid` as the background of each category card when the Payload category has no image. The file name maps to the category slug:
- `cat-nutrition.jpg` — honey, herbs, amber drops
- `cat-skincare.jpg` — aloe leaves, cream jar, calendula
- `cat-aloe.jpg` — aloe vera plant close-up
- `cat-beauty.jpg` — pink flower petals, rose
- `cat-gifts.jpg` — kraft paper gift with eucalyptus

When Yarit uploads a real image to a category via the admin, that takes precedence over the AI fallback automatically.

### Trust bar icons (4)
Used by `TrustBar`. rembg-processed transparent PNGs that sit cleanly on the parchment page background:
- `icon-natural.png` — sage leaf with water drop
- `icon-certified.png` — olive wreath with checkmark
- `icon-shipping.png` — kraft paper package with twine
- `icon-personal.png` — two hands with small heart

Original JPGs are also in `public/brand/ai/` in case we want to re-process.

### Section backgrounds (2)
Absolutely positioned, low-opacity layers behind section content:
- `hero-bg-wash.jpg` — sage botanical wash for the homepage hero
- `newsletter-bg.jpg` — reserved for the Phase G newsletter CTA

### Utility assets (3)
- `about-hero.jpg` — hands with aloe seedling, for the /about page (Phase F)
- `empty-state.jpg` — empty woven basket with eucalyptus, for 404 and empty-cart
- `product-placeholder.jpg` — clay pot with sage sprig, shown by `ProductCard` when a product has no image

### Regenerating
If you want to regenerate any asset:
1. Use the prompts in the agent's conversation notes (or ask to regenerate them)
2. Save with the same filename in `public/brand/ai/`
3. For the 4 trust-bar icons, re-run rembg:
   ```bash
   python -c "from rembg import remove; ..."
   ```
   (see the inline command used in Phase C for the exact script)

### Two versions in use

| File | Source | Use |
|---|---|---|
| `public/brand/logo-parchment.jpg` | Original copy | Header, footer, anywhere the site background matches the parchment tone (the site's default cream `#F5EDD9` is tuned for this) |
| `public/brand/logo.png` | rembg-processed | Transparent PNG for overlays, dark backgrounds, email headers, favicons |

To generate the transparent version:
```bash
pip install rembg pillow
python scripts/process-logo.py
```

## Palette

All colors derived from the logo. Update both `brand.config.ts` AND `globals.css` @theme if you change any.

| Token | Hex | Source in logo | Use |
|---|---|---|---|
| `primary` | `#5B7342` | Leaves | Buttons, links, highlights |
| `primary-dark` | `#3D5240` | "Shoresh" letters | Hover, dark headings |
| `accent` | `#A67A4A` | Tree trunk | Tags, price, badges |
| `accent-deep` | `#7C4E2F` | Roots | Darker accent |
| `background` | `#F5EDD9` | Logo parchment | Page background |
| `surface` | `#FFFFFF` | — | Cards, modals |
| `foreground` | `#2A2A2A` | — | Primary text |
| `muted` | `#8B7A5C` | — | Secondary text |
| `border` | `#E6D9B8` | — | Subtle borders |

## Typography

- **Heebo** — primary family. Weights 400/500/700/800. Loaded via `next/font/google` with `subsets: ['hebrew', 'latin']`. Exposes the CSS variable `--font-heebo`.
- **Frank Ruhl Libre** — optional display serif for large premium headings. Loaded alongside Heebo. CSS variable `--font-frank-ruhl`.

Body text uses `var(--font-sans)` which falls through to Heebo. Headings that want the serif feel use `font-[var(--font-display)]`.

## Voice and tone

- Warm, rooted, trustworthy — not loud or clinical.
- Hebrew first. English reads as a secondary mirror, not a translation-by-committee.
- Speak to the customer like Yarit would: personal, knowledgeable, recommending products she actually uses.
- Never make clinical health claims ("cures", "treats"); wellness language only ("supports", "complements").

## What the brand is NOT

- Not orange/neon/vape — the smokify reference in `../smokify_se_20260409_201117/` was only consulted for structural UI patterns (grid, cards, sticky header), not for aesthetic.
- Not loud or gimmicky.
- Not aggressively discount-driven — premium natural positioning.
- Not anonymous — Yarit is the face of the shop; her name and story appear on the About page.
