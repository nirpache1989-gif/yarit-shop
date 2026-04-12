# Next session — Final polishing + GSAP effects + project close-out

> **Purpose:** The site is functionally complete and deployed. This session is for visual polishing, remaining GSAP effects, and closing out the project. Only external dependencies remain (Meshulam, Resend, legal, domain).
>
> **Read first:** `CLAUDE.md`, then `docs/STATE.md`, then come back here.

---

## Track 1 — GSAP visual effects (~60% of session)

### Available GSAP improvements (researched and categorized)

**Tier S (zero risk, purely additive):**
- S1: Footer garland fade-in reveal on scroll
- S3: About page section-by-section scroll reveals
- S4: Contact form field focus glow animation

**Tier A (low risk, extend existing patterns):**
- A3: Header logo micro-interaction (hover tilt ±2°)
- A4: Scroll progress bar (thin branded bar at page top)

**Tier B (need testing):**
- B1: Product detail image parallax (yPercent scrub)
- B2: Shop grid row-by-row entrance stagger
- B3: Cart page item entrance + deletion animations
- B4: Text highlight sweep on About/Contact pages

**Deferred:**
- Growing tree Lottie animation in MeetYarit section — needs a Lottie JSON asset from the user. Install `lottie-web`, create ScrollTrigger-controlled playback. The SVG hand-drawn approach was too crude.

### What's already shipped (don't re-do)
- BranchDivider: SVG draw-in + scroll-scrubbed leaf sway (berries removed)
- DriftingLeaves: scroll-responsive velocity reaction
- Cart drawer: 40ms stagger item entrance
- Hero: full GSAP timeline + scroll parallax
- Product cards: Ken Burns + 3D tilt
- FeaturedProducts: stagger + desktop heading pin
- CategoryGrid: bloom entrance + tilt + pin
- MeetYarit: column converge + word cascade
- Testimonials: horizontal cascade
- Product gallery: hover zoom + Flip morph
- Checkout: confetti + checkmark draw

### Non-negotiables (same every session)
- `immediateRender: false + once: true + start: 'top bottom-=40'` on every `gsap.from + scrollTrigger`
- Single GSAP entry point: `import { gsap } from '@/lib/motion/gsap'`
- Every GSAP component must use `useGsapScope`
- Reduced motion must always be handled
- Additive only — never remove existing keyframes

---

## Track 2 — Project close-out checklist (~30%)

### External dependencies (waiting on Yarit/stakeholder)
- [ ] Meshulam payment gateway credentials
- [ ] Resend API key for transactional emails
- [ ] Legal markdown (privacy/returns/shipping/terms x2 locales = 8 files)
- [ ] Custom domain setup
- [ ] Yarit changing temp admin password (`CopaiaTemp2026!`)
- [ ] Final product catalog copy (Yarit refining descriptions via admin)

### Code tasks if time permits
- [ ] `feat/brand-rename` branch decision — merge or abandon? (5 commits: Copaia rename, new catalog, admin UX, motion polish — NOT deployed)
- [ ] Verify Vercel auto-deploy webhook is reliable
- [ ] Consider adding `onDelete: 'SET_NULL'` to Orders.customer relation (FK constraint prevented user deletion this session — required deleting the order first)

---

## Track 3 — Final QA + docs (~10%)

- [ ] Full prod QA walkthrough (all storefront + admin routes)
- [ ] Update `docs/STATE.md` with final changelog
- [ ] Update `docs/NEXT-SESSION.md` for handoff

---

## Safety net approach (proven this session)

```
main (stable, deployed)
  └── feat/gsap-final
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
