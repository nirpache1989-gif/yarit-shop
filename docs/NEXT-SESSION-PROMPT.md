# Next session — starting prompt (T2.9 homepage orchestration + closeout)

> **Purpose:** This session is the "big motion" follow-up. The previous session (2026-04-11 cleanup + Tier-2 lite) landed a code/docs cleanup sweep, a task-oriented Yarit admin guide rewrite, a hotfix for a production GSAP `immediateRender` bug that left category tiles blank, and two safe Tier-2 additions (footer reveal, category tile magnetic hover). Your job is to ship **T2.9 — homepage scroll-linked storytelling** (the last big Tier-2 wave) and then close out the project.
>
> **Read this file top to bottom, then `CLAUDE.md`, then the top ~2 entries in `docs/STATE.md` ("2026-04-11 later — code + docs cleanup sweep" and whatever the 2026-04-11 evening entry is called). Only then start working.** The previous close-out prompts are archived at `docs/NEXT-SESSION-PROMPT-2026-04-11-close-out.md` (the original production close-out) and `docs/NEXT-SESSION-PROMPT-2026-04-11-cleanup-and-tier2-lite.md` (the immediately previous session). Both are historical — you don't need them unless you want context.

---

## Status as of this session's start

### Production

- **LIVE at `https://yarit-shop.vercel.app`** at commit `593fad5` (or later).
- All 16 smoke-test routes return 200 in prod.
- GSAP Tier-1 is complete. The 2026-04-11 production bug where `CategoryGrid` + `FeaturedProducts` + `MeetYarit` rendered blank due to a flaky `gsap.from` + `immediateRender: true` + `scrollTrigger` interaction is fixed in `027ebda` and verified — all 5 category cards + 3 featured cards at `opacity: 1` after load.
- Tier-2 so far:
  - **T2.1** (checkout success confetti) — already shipped via `CheckoutCelebration` in `src/components/account/CheckoutCelebration.tsx`.
  - **T2.2** (footer reveal on scroll) — shipped in `9d4ddeb`. `src/components/layout/Footer.tsx` wraps the 4-column grid + the bottom social strip in the `Reveal` primitive (IntersectionObserver-backed, not GSAP — deliberately immune to the SSR/hydration race that bit the homepage sections).
  - **T2.8** (category tile magnetic hover) — shipped in `593fad5`. `CategoryGridMotion.tsx` now attaches pointermove/pointerleave listeners to each tile after the entrance plays, using the same ±3° tilt + 4px parallax vocabulary as `ProductCardMotion` (G3). Gated on `hover: hover` + reduced-motion.

### Quality gates on main

- `npx tsc --noEmit` → 0 errors
- `npm run lint` → 0 errors, 0 warnings
- `npm run build` → 40 routes, all `ƒ` Dynamic or `○` Static, zero `●` SSG. Turbopack NFT warning silenced via the `/*turbopackIgnore: true*/` hints on `fs.existsSync` / `fs.readFileSync` in `src/lib/legal.ts`.

### CI guard (2026-04-11 SSG incident prevention)

- `.github/workflows/ci.yml` has a "Guard against partial generateStaticParams on nested dynamic routes" step that:
  - `find`s files under `src/app/(storefront)/[locale]/` whose path contains a `[bracket]` segment after the `[locale]` segment (the four at-risk files today: `account/orders/[id]/page.tsx`, `legal/[slug]/page.tsx`, `product/[slug]/page.tsx`, `reset-password/[token]/page.tsx`)
  - greps each for `routing.locales.map` and fails CI on a hit
- Single-segment routes like `/[locale]/about`, `/[locale]/contact`, `/[locale]/shop` are intentionally NOT flagged — they legitimately return `routing.locales.map((locale) => ({ locale }))` because they have no second dynamic segment.
- **Do NOT remove this guard.** If you're adding a new two-segment dynamic route, either return full params from `generateStaticParams` (locale × whatever) or omit the function entirely. See `docs/CONVENTIONS.md` §generateStaticParams + `docs/DECISIONS.md` ADR-018 for the full rule.

### Docs state

- `docs/YARIT-ADMIN-GUIDE.md` — **full task-oriented rewrite** shipped in `90911c6`. ~330 lines, 7 sections + 3 appendices, every field label keyed to the actual Hebrew labels in `src/collections/Products.ts` + `src/globals/SiteSettings.ts`. This is the file Yarit will actually read.
- `docs/CONVENTIONS.md` + `docs/DECISIONS.md` ADR-018 document the SSG incident prevention rule.
- `docs/ARCHITECTURE.md`, `docs/ENVIRONMENT.md`, `docs/FULFILLMENT.md`, `docs/INDEX.md`, `docs/NEXT-SESSION.md`, `docs/ONBOARDING.md`, `docs/TASKS.md` — all audited and fixed for drift.

---

## Your primary task — T2.9 homepage scroll-linked storytelling

This is the biggest Tier-2 item, deliberately deferred to its own session. The idea is to take the homepage and turn scrolling it into a coherent narrative rather than a sequence of independent sections. Every section you scroll past should feel like a deliberate beat in a story, not an isolated card.

### What "orchestration" means here

Today the homepage is:

```
Hero → TrustBar → BranchDivider → FeaturedProducts → BranchDivider → MeetYarit → ForeverSpotlight → Testimonials → BranchDivider → CategoryGrid → Footer
```

Each section currently has its own entrance motion (some T1/T2, some `Reveal`, some CSS keyframes). They feel independent. T2.9 gives them a shared scroll-linked layer on top:

1. **Hero exit parallax.** As the user scrolls out of the Hero, the botanical frame (Layer 1) should `yPercent 0 → -18` (bigger drift than the current G2 value of -12) and the cream vignette (Layer 3) should opacity-fade to `0.25`. The scrub should feel buttery, `ease: 'power1.inOut'`. Already partially in place via `HeroMotion.tsx` G2 scroll triggers — this tightens the values and extends the drift distance.
2. **TrustBar sequential pulse.** The 4 value-prop icons currently render instantly. Add a scroll-linked reveal where each icon scales `0.8 → 1` + opacity `0 → 1` with a 120ms stagger as the TrustBar enters the viewport. Use the existing `Reveal` primitive pattern (IntersectionObserver) for SAFETY — do NOT use `gsap.from` + scrollTrigger. The 2026-04-11 bug fix proved that IntersectionObserver is the bug-tolerant choice for enter animations.
3. **MeetYarit Ken Burns + word cascade.** The image column already has `KenBurns` from T1.1. Add a SplitWords-style cascade on the body paragraph where each word fades up with a 60ms stagger when the block enters the viewport. `SplitWords` primitive already exists — use it. Keep the existing T1.1 column converge from `MeetYaritMotion.tsx`.
4. **CategoryGrid "blooming" extension.** T1.2 already does a scale `0.96 → 1` on entrance. T2.9 extends this by also pinning the section header while the tiles scroll past — same pattern as `FeaturedProductsMotion`'s desktop pin (T1.4). Gate on `(min-width: 768px)` via `gsap.matchMedia()`. On mobile, the header scrolls normally. Keep the T2.8 hover tilt untouched.
5. **Testimonials horizontal cascade.** The 3 testimonial cards currently reveal in place. Swap to a horizontal cascade where each card slides in from the start edge (RTL-aware) with a 150ms stagger. Use GSAP for the cascade because the RTL-awareness is easier than a CSS variant. **Critical: use the same `immediateRender: false + once: true` pattern** so the SSG/hydration failure mode can't recur. Put the code in a new `src/components/sections/TestimonialsMotion.tsx` client component wrapping the existing server `Testimonials.tsx`.
6. **Section-to-section connective tissue.** As each `BranchDivider` enters the viewport, its SVG draw-in animation should trigger at the same moment the NEXT section below it starts revealing — not independently. This means binding the BranchDivider's ScrollTrigger to the next section's entry. In practice: give each BranchDivider a `data-divider-for="featured|meetyarit|categories"` attribute, and have the consumer section's motion setup `.add('labels...')` to coordinate.

### Non-negotiables

- **Durations** 600–1400ms for single moves, 2–4s for orchestrated timelines.
- **Eases** `power2.out` / `power3.out` / `expo.out` / `power1.inOut` only. No elastic / bounce / back.
- **Tilt ceiling** ±3–8° maximum.
- **Every GSAP motion uses `useGsapScope` with a `useGsapReducedMotion` check and `clearProps: 'all'` on reduced.**
- **Import gsap only from `@/lib/motion/gsap`**, never raw.
- **Customer-only**; NEVER touch the admin panel (`src/app/(payload)/*`, `src/components/admin/payload/*`, `src/collections/*`, `src/payload.config.ts`) unless Yarit specifically asks.
- **Additive only** — don't remove any existing CSS keyframe, don't replace any existing `<Reveal>` / `<StaggeredReveal>` usage outside the one section you're touching, don't break the motion primitives exports.
- **Robust `gsap.from` pattern** — `immediateRender: false` + `once: true` on every scroll-triggered entrance. This is the fix from `027ebda` and IS non-negotiable. If you write a `gsap.from(...).scrollTrigger(...)` without those two options, the bug from 2026-04-11 can recur.
- **Never `generateStaticParams` returning only `{ locale }`** on any two-segment dynamic route. CI will fail if you do.
- **`setRequestLocale` + `getTranslations` in every server page/layout** that uses translations.
- **`cookies()`, `headers()`, `draftMode()` are async** — `await` always.
- **Never import `next/link` in storefront code** — use `Link` from `@/lib/i18n/navigation`.
- **Server→client props are strings/numbers/booleans/JSX only** — no function props.
- **No Tailwind arbitrary-value classes in JSX comments or markdown files** — the v4 scanner picks them up.

### Critical files to touch

**Likely to modify:**
- `src/components/sections/HeroMotion.tsx` — tighten the scroll parallax values for #1
- `src/components/sections/TrustBar.tsx` — add `Reveal` wraps around each icon for #2 (may need to split into a TrustBarMotion client wrapper if the current file is a server component)
- `src/components/sections/MeetYaritMotion.tsx` — add `SplitWords` import + wrap the body text for #3 (keeping the existing T1.1 + bug-fix intact)
- `src/components/sections/CategoryGrid.tsx` + `CategoryGridMotion.tsx` — add desktop pin for #4 (keep T1.2 entrance + T2.8 hover intact)
- Potentially: new `src/components/sections/TestimonialsMotion.tsx` for #5
- `src/components/ui/BranchDivider.tsx` — may need a `data-divider-for` prop for #6

**Do NOT touch** unless explicitly required:
- `src/components/product/ProductCardMotion.tsx` — G3 magnetic hover, already shipped and stable
- `src/components/shop/ShopGridFlip.tsx` — T1.6, different motion pattern (mount-only, not scroll-triggered)
- `src/components/product/ProductGalleryMotion.tsx` — T1.7, hover + Flip pattern
- `src/lib/motion/gsap.ts` — foundation, only touch to register new plugins
- `src/lib/motion/useGsapReducedMotion.ts` — stable

### Verification workflow

After EVERY substantive edit, run:

```bash
cd C:/AI/YaritShop/yarit-shop
npx tsc --noEmit         # must exit 0
npm run lint             # must exit 0, 0 errors 0 warnings
npm run build            # must exit 0, 40 routes all ƒ/○, zero SSG
```

End-to-end smoke test before pushing:

```bash
npm run build && npx next start -p 3009    # local prod build
```

Then via Chrome MCP (or curl if Chrome isn't available):

1. Load `http://localhost:3009/` and scroll to the bottom. Verify:
   - Hero parallax happens (Layer 1 drifts up)
   - TrustBar icons reveal on scroll
   - FeaturedProducts cards are at `opacity: 1` (the 2026-04-11 bug regression check)
   - MeetYarit image + text arrive together
   - Testimonials cascade horizontally
   - CategoryGrid tiles are at `opacity: 1` (the 2026-04-11 bug regression check), scale and blur into place, desktop-pinned header holds while scrolling
   - Footer reveals
2. Eval `document.querySelectorAll('[data-category-card]')` and check all 5 cards have `opacity: 1` and `transform: matrix(1, 0, 0, 1, 0, 0)` — this is the bug-fix smoke test, **do not skip it**.
3. Load with `?prefers_reduced_motion=1` or use DevTools "Emulate CSS prefers-reduced-motion: reduce" and verify: everything snaps to natural state instantly, no animations play. This is the accessibility smoke test.
4. Resize to 375×812 (iPhone SE). All motion should degrade gracefully — no horizontal scrollbars, no pin on mobile, entrance animations still play.
5. Load in RTL (default `/`) and LTR (`/en`). Both should look correct.

### Plan file

Create your plan at `C:\Users\Ar1ma\.claude\plans\<generated-name>.md` using the Plan workflow. Don't skip the Explore phase even if you feel you know the codebase — the interplay between T1, T2, and T2.9 is subtle and a fresh read will catch assumptions.

---

## Secondary tasks for this session (after T2.9)

Pick these up only if T2.9 completes cleanly and there's time left. Otherwise defer to the final closeout session.

### Drop `@swc-node/register` and `@swc/core`

Verified genuinely unused (no direct imports, no scripts, no config refs, ADR-008 acknowledged them as "kept just in case"). Removing them is a trivial `npm uninstall` + regenerate `package-lock.json`. Test with `tsc + lint + build`. Commit as its own isolated commit so the dep diff stays clean.

### Link `YARIT-ADMIN-GUIDE.md` from the admin `?צריכה עזרה` button

Currently `src/components/admin/payload/HelpButton.tsx` is a `mailto:` to Nir. Three options:

- **Option A (simplest):** Leave as-is. Nir sends Yarit the GitHub link to the guide directly on WhatsApp. No code change.
- **Option B (medium):** Add a second pill next to the mailto button labeled "📖 מדריך". Opens the rendered guide in a new tab. Needs a hosting target — either a `/help` storefront route that renders the markdown (using the existing `src/lib/legal.ts` markdown renderer as a template), OR a GitHub pages link for the raw file.
- **Option C (nicest but most invasive):** Register a custom Payload admin view at `/admin/help` that renders the markdown inside the Payload chrome. Uses `payload.config.ts` `admin.components.views` registration. Matches how `/admin/fulfillment` is wired. Touches admin code — only do this if Yarit asks.

**Recommendation:** Option B with the storefront `/help` route. It keeps admin code untouched, gives Yarit a real web page (not raw markdown), and is reachable from anywhere. The route is a ~20-line server component that reads `docs/YARIT-ADMIN-GUIDE.md` and renders it using `renderLegalMarkdown` from `src/lib/legal.ts`.

### Other Track A / handoff items

These are still blocked on Yarit handing over external values:

- **Resend email credentials** (adapter at `src/lib/email/resend.ts` is paste-in-ready — 4 env vars + redeploy)
- **Meshulam payment credentials** (`src/lib/payments/meshulam.ts` has 2 `TODO(meshulam)` hotspots at lines 123 + 193 that need reconciling against Yarit's actual PDF; then 5 env vars + sandbox E2E + live-flip)
- **Legal markdown** (drop files into `content/legal/<slug>/<locale>.md`; re-add footer links in `src/components/layout/Footer.tsx` — look for the comment blocks around lines 51–55 and 74–77)
- **Custom domain** (Vercel → Domains + DNS + update `NEXT_PUBLIC_SITE_URL`)
- **Final catalog copy** (Yarit edits live via `/admin/collections/products` — no code action)

### Final closeout (Track D)

If T2.9 lands cleanly AND Yarit has no pending items, the final deliverable is:

1. Update `docs/YARIT-ADMIN-GUIDE.md` if any admin changes happened in T2.9 (unlikely, but audit)
2. Walk `docs/STATE.md` end-to-end and make sure the timeline reads cleanly
3. Write Yarit a short "your shop is live" note **in Hebrew** — what URL to bookmark, how to log in, what she can edit, what's blocked on her external inputs
4. Tell Nir what to send Yarit and when, and what "done" looks like
5. Archive this `NEXT-SESSION-PROMPT.md` the same way the 2026-04-11 close-out prompt was archived

---

## Non-negotiable rules (same every session)

1. **Never push without explicit user word.** `git push` is gated on the user saying "push" or equivalent.
2. **No admin panel aesthetic changes.** `src/app/(payload)/*`, `src/components/admin/payload/*`, `src/collections/*`, `src/payload.config.ts` are read-only unless Yarit specifically asks for a change.
3. **Motion is additive only.** Don't remove existing keyframes, don't touch the motion primitives, don't break the editorial-botanical vocabulary.
4. **`setRequestLocale` + `getTranslations` in every server page/layout.**
5. **`cookies()`, `headers()`, `draftMode()` are async.**
6. **Never import `next/link` in storefront code.**
7. **Single GSAP entry point** — `@/lib/motion/gsap`.
8. **Server→client props are serializable only.**
9. **No Tailwind arbitrary-value classes in JSX comments or markdown files.**
10. **Hebrew + English bilingual strings always go through `src/messages/{he,en}.json`.**
11. **Never re-add `generateStaticParams` returning only `{locale}` to a TWO-segment dynamic route** — CI will fail.
12. **Every new `gsap.from` + scrollTrigger MUST include `immediateRender: false + once: true`** — the 2026-04-11 bug fix pattern is non-negotiable.

## Working directory + quality gates

```bash
cd C:/AI/YaritShop/yarit-shop
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0, 0 errors 0 warnings
npm run build           # must exit 0, all 40 routes ƒ/○, zero SSG
```

Dev server: `npm run dev` → http://localhost:3000. **Warning:** `npm run dev` does NOT exercise SSG behavior and has also been observed to have looser GSAP timing than prod builds — if you need to reproduce a production-only motion issue, use `npm run build && npx next start -p <free-port>` instead.

Preview MCP: if you use `preview_start` from `.claude/launch.json`, note that Preview MCP's Chrome does NOT emit native `scroll` events on programmatic `window.scrollTo(y)`. Dispatch `window.dispatchEvent(new Event('scroll'))` manually if you need to verify scroll-triggered behavior.

---

## Definition of done for this session

The session is done when:

- [ ] T2.9 — all 6 numbered items above shipped in a coherent motion layer
- [ ] All 5 category cards + 3 featured cards + MeetYarit columns verified at `opacity: 1` in prod (the 2026-04-11 bug-fix regression test)
- [ ] Reduced-motion path verified — everything snaps to natural state
- [ ] Mobile (375×812) + desktop (1440) + tablet (768) all verified visually
- [ ] `tsc + lint + build` green after every change
- [ ] `git push origin main` only after explicit user word
- [ ] Vercel auto-deploys OR manual `npx vercel --prod --yes`
- [ ] `docs/STATE.md` has a new "Latest" entry describing T2.9 shipped
- [ ] `docs/NEXT-SESSION.md` TL;DR updated with the new state
- [ ] This `NEXT-SESSION-PROMPT.md` is either archived + replaced with a fresh one OR marked completed at the top (banner-style)

**Good luck. The site is in great shape. Restraint over flash. Slow over fast. Additive over replacement.**
