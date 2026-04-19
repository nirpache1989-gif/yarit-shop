# Next session — GSAP effects + Fix dark mode logo + project close-out

> **Purpose:** The site is functionally complete and deployed. This session has two priorities: (1) GSAP Tier S visual effects, (2) fix the dark mode logo rectangle issue. Only external dependencies remain after that (Meshulam, Resend, legal, domain).
>
> **Read first:** `CLAUDE.md`, then `docs/STATE.md`, then come back here.

---

## Priority 1 — GSAP Tier S visual effects

### What to build (zero risk, purely additive)
- **S1:** Footer garland fade-in reveal on scroll → create `FooterMotion.tsx`
- **S3:** About page section-by-section scroll reveals → create `AboutMotion.tsx`
- **S4:** Contact card stagger + icon glow animation → create `ContactMotion.tsx`

### Pattern to follow (server→client split)
Same as `MeetYarit.tsx` / `MeetYaritMotion.tsx`:
- Server shell fetches translations + settings, passes all strings as props
- Client wrapper (`'use client'`) renders JSX + uses `useGsapScope`
- Replace `<Reveal>` / `<StaggeredReveal>` wrappers with GSAP ScrollTrigger

### Non-negotiables
- `immediateRender: false + once: true + start: 'top bottom-=40'` on every `gsap.from + scrollTrigger`
- Single GSAP entry point: `import { gsap } from '@/lib/motion/gsap'`
- Every GSAP component must use `useGsapScope`
- Reduced motion must always be handled
- Additive only — never remove existing keyframes

### What's already shipped (don't re-do)
- BranchDivider, DriftingLeaves, Cart drawer, Hero, Product cards, FeaturedProducts, CategoryGrid, MeetYarit, Testimonials, Product gallery, Checkout

---

## Priority 2 — Fix dark mode logo rectangle

### The problem
In dark mode, there's a visible white/lighter rectangle around the hero logo. The root causes are:

1. **The hero logo PNG (`public/brand/copaia.png`)** was originally a JPG with a white background. It was processed with sharp to remove white pixels (67% cleared), but residual near-white pixels and the `<img>` compositing boundary still create a visible rectangle.

2. **The hero background (`herobg3.jpg`)** has a naturally lighter open center where the botanical frame thins out. In dark mode the surrounding page is dark, making this lighter center contrast more visibly.

3. **`.logo-halo` container** has `isolation: isolate` + `padding: 1.75rem 2.75rem` creating a separate compositing layer that renders differently from the background.

### What was tried and failed
- PNG white removal (threshold 240, then 210, then 170) — not aggressive enough, or too aggressive (destroys logo)
- `mix-blend-mode: multiply` on the img — blocked by `isolation: isolate` on parent
- `mix-blend-mode: multiply` on `.logo-halo` — worked but still showed faint rectangle
- `isolation: auto !important` override — CSS specificity issues with Tailwind v4 layers
- `filter: none !important` on the img — drop-shadow wasn't the cause
- `mask-image: radial-gradient(...)` — feathered edges but rectangle still visible
- New hero background `herobg4.jpg` — different center composition but same issue
- `unoptimized` prop on Image — bypasses Next.js WebP conversion but rectangle persists

### What to try next
The fundamental issue is that the hero logo PNG has a rectangular compositing boundary that doesn't blend seamlessly with the textured hero background in dark mode. Possible approaches:

1. **Get a logo with TRUE transparent background** from a proper design tool (Illustrator/Figma export, not JPG→PNG conversion). The user has `media/LogoNEWx.jpg` — a new logo generated with transparency in mind, but it was a JPG so the checkerboard got baked in.

2. **Remove the `.logo-halo` container entirely** in dark mode — strip padding, isolation, and ::before pseudo-element so the img renders directly against the hero bg with no intermediate compositing layer.

3. **Use CSS `background-image` instead of `<img>`** for the hero logo — eliminates the rectangular compositing layer entirely. Would need to refactor the GSAP animation that targets the img.

4. **Consider removing dark mode** if the logo issue can't be fixed — the user was open to this. The Warm Night dark palette has extensive CSS in globals.css (~16 rule blocks) and admin-brand.css (~5 blocks), plus ThemeToggle.tsx, AdminThemeInit.tsx, and the theme bootstrap script in layout.tsx.

### KEY FINDING: Changing the logo or background image does NOT fix the rectangle
The rectangle persisted across ALL combinations:
- Original copaia.png (white bg) → rectangle
- Nuclear-processed copaia.png (67% transparent) → rectangle
- Brand new generated logo (LogoNEWx.jpg → copaia-v2.png) → rectangle
- Original herobg3.jpg → rectangle
- New herobg4.jpg (gradual fade) → rectangle
This means the issue is NOT the image content — it's the browser's compositing of the `<img>` element as a rectangular layer against the hero background. The fix must be CSS/structural, not image-level.

### IMPORTANT: The production site looks fine in light mode
Do NOT change the light mode appearance. The current production state works perfectly in light mode. Any dark mode fix must NOT introduce a rectangle in light mode.

### Current dark-mode CSS on production
The production (`origin/main`) currently has several dark-mode logo fix commits that added CSS rules to `globals.css`:
- `mix-blend-mode: multiply` on `.logo-halo` container
- `isolation: auto !important` override
- Hero bg `mix-blend-mode: multiply`
- Logo img `filter: none !important` + `mask-image`
These are in the CSS but gated by `[data-theme="dark"]` so they don't affect light mode.

---

## Priority 3 — Close-out (already partially done)

### Already done this session (on production)
- [x] FK guard on `Users.beforeDelete` — clear Hebrew error on customer deletion
- [x] 7 stale branches deleted (feat/brand-rename, etc.)
- [x] Docs updated (STATE.md, NEXT-SESSION.md)

### Still to do
- [ ] Verify Vercel auto-deploy webhook is reliable
- [ ] Full prod QA walkthrough (all storefront + admin routes)
- [ ] Update docs with final changelog

### External dependencies (waiting on Yarit)
- [ ] Meshulam payment gateway credentials
- [ ] Resend API key for transactional emails
- [ ] Legal markdown (privacy/returns/shipping/terms x2 locales = 8 files)
- [ ] Custom domain setup
- [ ] Yarit changing temp admin password (`CopaiaTemp2026!`)
- [ ] Final product catalog copy

---

## Safety net approach

```
main (stable, deployed)
  └── feat/gsap-final (or feat/dark-mode-fix)
        ├── commit 1: effect A
        ├── commit 2: effect B
        └── ... each effect separate, revertable
```

After each commit: `tsc + lint + build`. If broken → `git revert`.
Only merge + push when all effects verified.

---

## Working directory + quality gates

```bash
cd "C:/AI/YaritShop/yarit-shop"
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0
npm run build           # must exit 0
```

**Prod:** `https://yarit-shop.vercel.app`
**Admin:** `https://yarit-shop.vercel.app/admin/login`

---

## importMap gotcha (CRITICAL)

If you change `payload.config.ts` plugins/collections with custom admin components:
1. Check what components the new/changed plugin registers
2. Manually add/remove the import + map entry in `src/app/(payload)/admin/importMap.js`
3. Add entries REGARDLESS of conditional loading (the previous P0 was exactly this)
