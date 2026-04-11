# Next session — GSAP Tier-1 continuation (T1.4 → T1.7)

> **STATUS 2026-04-11: ALL FOUR WAVES ARE SHIPPED LOCALLY.** This file is kept as a reusable template / history reference. The next session should read `docs/NEXT-SESSION.md` and `docs/NEXT-SESSION-PROMPT.md` instead — they describe the CURRENT remaining work (commit/push/deploy + paste-in credentials). See `docs/STATE.md` "Latest (2026-04-11)" for the detailed per-wave changelog.
>
> ~~**Audience:** The next Claude session (or a human developer) continuing the GSAP motion work on the Shoresh storefront. This file is self-contained — you should NOT need to re-plan anything. Read it top to bottom, execute the 4 waves in order, verify at each step, then update the docs and stop.~~
>
> ~~**When to read:** Open this file when the user asks to "continue the GSAP work" or "ship the remaining Tier-1 items" or equivalent. If they ask for something totally different, read `docs/NEXT-SESSION.md` instead and defer this file to later.~~
>
> **Original status at the time this file was written (2026-04-10):** Waves G1 / G2 / G3 / T1.1 / T1.2 / T1.3 were already shipped locally. The remaining 4 Tier-1 items were listed below in the recommended order. All four have now been shipped (2026-04-11). The recipes below remain accurate as historical reference but no further action is required.

---

## ✅ Completion log (2026-04-11)

- **T1.4 shipped.** `FeaturedProductsMotion.tsx` + server shell `FeaturedProducts.tsx`. Gotcha: section's `overflow-hidden` had to move onto an inner bg-wash wrapper so the pinned heading's `position: fixed` isn't clipped by its ancestor.
- **T1.5 shipped.** `HeaderShrinkObserver.tsx` + `id="site-header"` on `Header.tsx` + CSS block in `globals.css` inside `@layer utilities` (the layer wrapper is critical — Tailwind's `bg-[...]\/92` lives in the same layer, and an unlayered rule loses to it via layer order even with higher selector specificity).
- **T1.6 shipped.** `ShopGridFlip.tsx` + Flip plugin registration in `src/lib/motion/gsap.ts`. Flip imported via `gsap/dist/Flip` (not `gsap/Flip`) to dodge a GSAP 3.14.2 types subpath casing bug on Windows.
- **T1.7 shipped.** `ProductGalleryMotion.tsx` + hooked into `product/[slug]/page.tsx`. Hover zoom is gated behind a `useSyncExternalStore`-backed `(hover: hover)` matchMedia subscription. Thumb Flip is untestable against the current dev seed because every product has a single-image static override, but the code follows the canonical GSAP @gsap/react Flip pattern.
- **Plus two mobile UX bug fixes** (not in this file's original scope but shipped alongside): (a) `LanguageSwitcher` moved out of `hidden md:flex` in `Header.tsx` so it's visible on mobile; (b) theme bootstrap in `[locale]/layout.tsx` no longer follows OS dark-mode preference — defaults to light unless the user explicitly clicked the toggle.

---

**The recipes below are the original 2026-04-10 spec. They are what the 2026-04-11 session actually followed. Kept for archival reference.**

---

## Rules of engagement (READ THIS FIRST)

These rules are non-negotiable. They are distilled from the user's explicit feedback over multiple sessions and saved as a feedback memory file named `feedback_motion_additive_customer_only.md` inside the project's Claude memory directory (under the user's home `.claude` folder).

1. **Additive only, never replacement.** Do NOT remove any existing CSS keyframe in `src/app/globals.css` or `src/app/(payload)/admin-brand.css`. Do NOT remove any motion primitive in `src/components/motion/`. The one allowed exception: replacing the OLD Reveal / StaggeredReveal / SplitWords usage inside a SPECIFIC component when introducing its GSAP upgrade. But the primitive itself STAYS exported and STAYS consumed by every other file.
2. **Customer experience only.** Do NOT touch the admin panel (`/admin/*`) for motion upgrades. Zero GSAP work on admin surfaces. If you see yourself about to edit anything under `src/components/admin/payload/` or `src/app/(payload)/`, STOP.
3. **Never break the existing "drift" vocabulary.** Durations 600–1400ms for single moves, 2–4s for orchestrated sequences. Eases `power2.out`, `power3.out`, `expo.out`, or `power1.inOut`. NEVER `elastic`, `bounce`, `back` — they are wrong for the brand. Tilt/rotation ceilings are plus/minus 3 to 8 degrees. Opacity from 0 to 1 is fine; scale from 0.96 to 1 is fine; translate plus/minus 40px is fine. Anything more dramatic than that is out of vocabulary.
4. **Respect `prefers-reduced-motion`.** Every new GSAP component MUST use `useGsapScope` from `src/components/motion/GsapScope.tsx`, MUST check the `reduced` flag first, and MUST fall through to a `gsap.set` call with `clearProps: 'all'` on reduced. The primitives already do this — follow the same pattern. See HeroMotion, ProductCardMotion, MeetYaritMotion, CategoryGridMotion, BranchDivider for reference implementations.
5. **Server to client function-prop rule.** Server components cannot pass function props to client components. Only strings, numbers, booleans, and JSX children. If you need to run data fetching in a server parent and motion in a client child, split them and pass the resolved strings down. Pattern reference: `Hero.tsx` to `HeroMotion.tsx`, `MeetYarit.tsx` to `MeetYaritMotion.tsx`.
6. **Single GSAP entry point.** Import `gsap` and `ScrollTrigger` ONLY from `@/lib/motion/gsap` — never directly from the raw GSAP package paths. The entry file registers the plugin exactly once; direct imports break this.
7. **`useGsapScope` wraps `useGSAP` from `@gsap/react`.** Never call GSAP from raw useEffect — React 19 StrictMode double-mounts leak timelines. Always go through `useGsapScope(ref, setupFn, deps)`.
8. **Tailwind v4 scanner gotcha.** Do NOT write class names containing square brackets and parentheses (the Tailwind arbitrary-value syntax) inside JSX/TSX comments or markdown files. The scanner picks them up from ANY scanned file including .md, and a malformed example can 500 every storefront page at build time. This file itself avoids that syntax entirely — follow the same rule. When documenting className patterns, describe them in prose or point to the real source file.
9. **No new dependencies in the default path.** GSAP core and ScrollTrigger are already installed. The Flip plugin ships bundled with the free gsap package since April 2024 — it just needs registration. T1.6 and T1.7 use Flip. When you reach them, register it in `src/lib/motion/gsap.ts` using the same pattern already there for ScrollTrigger. No `npm install` needed.
10. **Zero git unless explicitly asked.** The user holds commit and push authorization. Ship the code, update the docs, then STOP and hand back. Do NOT run git commands or deploy commands unless the user gives explicit word.

---

## Required reading before you touch any code (5 min)

1. `CLAUDE.md` (repo root) — project overview and critical rules
2. `docs/STATE.md` top 400 lines or so — read the latest 2 changelog entries to know what G1 to T1.3 already did
3. `src/lib/motion/gsap.ts`, `src/lib/motion/useGsapReducedMotion.ts`, `src/components/motion/GsapScope.tsx` — the GSAP foundation, about 100 lines total
4. The 5 already-shipped reference components: `src/components/sections/HeroMotion.tsx`, `src/components/product/ProductCardMotion.tsx`, `src/components/sections/MeetYaritMotion.tsx`, `src/components/sections/CategoryGridMotion.tsx`, `src/components/ui/BranchDivider.tsx` — each shows a different pattern (master timeline, pointer-event hover, scroll-triggered converge, scroll-triggered grid reveal, scroll-triggered SVG draw)

That is the full onramp. Don't read the entire repo — read those 8 files and you will have 95% of the context you need.

---

## T1.4 — FeaturedProducts heading pin (estimated 45 to 60 min)

### Goal

On the homepage, as the user scrolls into the FeaturedProducts section, the section heading should PIN to the top of the viewport and stay there while the product cards scroll up past it. Once the last product card reaches the heading, the heading unpins and scrolls away with the rest of the page. This is the classic "editorial pin" effect used by Aesop, Le Labo, and most luxury apothecary sites.

### Files to read first

- `src/components/sections/FeaturedProducts.tsx` — the current server component
- `src/components/sections/HeroMotion.tsx` — reference for `useGsapScope` and ScrollTrigger

### Files to create

- `src/components/sections/FeaturedProductsMotion.tsx` — new client component

### Files to modify

- `src/components/sections/FeaturedProducts.tsx` — reduce to a short server shell that fetches products and delegates rendering and motion to FeaturedProductsMotion (keep the same data flow pattern as Hero.tsx to HeroMotion.tsx)

### Implementation recipe

Your new `FeaturedProductsMotion.tsx` should be a `'use client'` component that:

1. Receives the products array, locale, and all translated strings (eyebrow, title, subheading, seeAllLabel) as serializable props from the server parent.
2. Keeps two refs: one for the whole section (`scopeRef`, attached to the section element) and one for the heading row (`headingRef`, attached to the flex row that contains SectionHeading and the "See all" button).
3. Renders the SAME JSX as the current `FeaturedProducts.tsx` body: the ambient newsletter-bg image wash, the Container, the heading row, and a grid of ProductCard elements. Every product card should be wrapped in a div that has a `data-featured-card` attribute on it (use a `div`, not a React.Fragment, so GSAP can find it via selector).
4. Uses `useGsapScope(scopeRef, setupFn)` to run three GSAP calls:
   - `ScrollTrigger.create` that pins the heading row. Set `trigger` to the heading element, `start` to "top 100px" (pin when heading hits 100px from viewport top), `endTrigger` to the section element, `end` to "bottom 200px" (unpin when section bottom is 200px from viewport top), `pin` to the heading element, and `pinSpacing: false` so Next.js and Tailwind grid flow is not disrupted by an injected pin-spacer div.
   - `gsap.from` on the heading with `y: 20, opacity: 0, duration: 0.9, ease: 'power2.out'` and a `scrollTrigger` sub-config (start "top 85%", toggleActions "play none none reverse") so the heading also fades up when the section first enters.
   - `gsap.from` targeting every child element that carries the `data-featured-card` attribute (use a CSS attribute-selector string as the target), with `y: 32, opacity: 0, duration: 0.8, stagger: 0.11, ease: 'power2.out'` and its own `scrollTrigger` sub-config (start "top 75%", same toggleActions).
5. Reduced motion path: early return after an explicit `gsap.set` call on the heading and the featured cards that clears all props.

### Important gotchas for T1.4

- **Destructure `ScrollTrigger` from the setup context** if you use `ScrollTrigger.create` directly. Or use only the inline `scrollTrigger` sub-config on `gsap.to` and `gsap.from` calls and don't destructure ScrollTrigger at all.
- **`pinSpacing: false` is important.** Without it, Next.js + Tailwind layout gets an extra pin-spacer div inserted at runtime that can break the grid flow below.
- **Don't pin on mobile.** The pin effect feels cramped on narrow viewports. Gate it on a media query check in JS before creating the ScrollTrigger, using `window.matchMedia('(min-width: 768px)').matches`. Or use ScrollTrigger's `matchMedia` helper (cleaner).
- **Test with the actual data.** The homepage seeds 3 featured products in dev. If the grid is too short, the pin might never trigger (end passes before start). Make sure there are at least 600px of grid height below the heading.

### Verification after T1.4

- `npx tsc --noEmit` → 0 errors
- `npm run lint` → 0 errors
- `npm run build` → 0 errors
- curl check: `curl -sL http://localhost:3000/he` piped to grep counting `data-featured-card` should return 3 or more
- In a real browser, scroll the homepage and watch the heading stick to the top for 1 viewport height while the product cards pass behind it.

---

## T1.5 — Global header shrink on scroll (estimated 30 to 45 min)

### Goal

The sticky header at the top of every storefront page currently has a fixed h-16 height with a full-size logo. As the user scrolls down past 80px, the header should smoothly shrink: logo from h-10 to h-8, inner height from h-16 to h-12, background opacity increases from 92% to 96% for better contrast against dense content. When the user scrolls back to the top, it restores. This is table stakes for luxury e-commerce headers.

### Files to read first

- `src/components/layout/Header.tsx` — the current server component
- `src/app/(storefront)/[locale]/layout.tsx` — to confirm Header is mounted once for the whole storefront

### Files to create

- `src/components/layout/HeaderShrinkObserver.tsx` — a tiny client component that listens to scroll and toggles a `data-scrolled` attribute on the header element. About 40 lines.

### Files to modify

- `src/components/layout/Header.tsx` — add `id="site-header"` to the header element and mount the HeaderShrinkObserver as a client child. Keep everything else exactly as is (server component, translation fetch, nav links, cart icon, etc.)
- `src/app/globals.css` — add a small CSS block that targets the header element with `id="site-header"` when its `data-scrolled` attribute equals the string "true" (use the standard CSS attribute-selector syntax) and overrides the relevant sizes/colors/transitions

### Implementation recipe

Your new `HeaderShrinkObserver.tsx` should be a `'use client'` component that:

1. Uses a `useEffect` (NOT useGsapScope — this is a boolean toggle, not a timeline; GSAP is overkill here) to look up the header by id on mount.
2. Sets up a passive scroll listener on `window` that flips a boolean when `window.scrollY` crosses 80.
3. Uses `requestAnimationFrame` to throttle the scroll handler so it only fires once per frame.
4. When the boolean changes, sets or removes the `data-scrolled` attribute on the header element using `setAttribute('data-scrolled', 'true')` or `setAttribute('data-scrolled', 'false')`.
5. Runs the check once on mount in case the page loaded already scrolled.
6. Cleans up the listener and any pending rAF on unmount.
7. Returns `null` (no visible output).

Then in `Header.tsx`, mount `<HeaderShrinkObserver />` as a sibling before the `<header>` element inside a React fragment, and add `id="site-header"` to the `<header>` element. Nothing else changes in Header.tsx.

In `globals.css`, add a small block (place it in the utility classes section, not inside the `@theme` block):

- Transition rule on `header#site-header` for background-color, box-shadow, and backdrop-filter over 280ms ease.
- When `data-scrolled="true"`: background-color shifts to a more opaque surface warm mix (use color-mix with 96% surface warm and 4% transparent), add a subtle box-shadow for depth.
- When `data-scrolled="true"`, the logo image inside `.leaf-breathe` shrinks its height from 2.5rem to 2rem with a 280ms transition.
- Under the existing `prefers-reduced-motion: reduce` media query, disable all these transitions with `transition: none !important` on the header and the logo image.

### Important gotchas for T1.5

- **Header is a SERVER component.** Do not add `'use client'` to `Header.tsx`. Just mount the observer as a client child — React composes them correctly.
- **Mobile.** The header is already h-16 on mobile. Shrinking it further can hide the hamburger. Gate the data-scrolled rules to `@media (min-width: 768px)` in the CSS so mobile is unaffected.
- **RTL.** The header has no horizontal parallax, so RTL is unaffected.

### Verification after T1.5

- tsc, lint, build all green
- curl check: response for `/he` contains `id="site-header"` exactly once
- In a real browser: scroll down past 80px, watch the header shrink over 280ms; scroll back up, it restores

---

## T1.6 — Shop filter grid Flip (estimated 60 to 90 min)

### Goal

On `/shop`, when the user clicks a brand chip (All / Forever / Natural) or a category chip, the product grid currently hard-cuts between states. Upgrade it so the cards smoothly animate to their new positions via GSAP's Flip plugin. Cards that stay in both states interpolate their position/size; cards that disappear fade out; new cards fade in.

### Files to read first

- `src/app/(storefront)/[locale]/shop/page.tsx` — the shop page server component
- Whatever filter chip component renders the brand/category chips (grep for `brand=forever` or `?brand` in `src/components/shop/` or under the shop route)
- `src/components/product/ProductCard.tsx` — already has the ProductCardMotion wrapper
- `src/lib/motion/gsap.ts` — where you will add Flip plugin registration

### Files to create

- `src/components/shop/ShopGridFlip.tsx` — new client component that owns the grid and the Flip animation. Takes `products` as a prop from the server parent plus the active filter state from the URL.

### Files to modify

- `src/lib/motion/gsap.ts` — register the `Flip` plugin alongside `ScrollTrigger`. Import it via `import { Flip } from 'gsap/Flip'` and pass it to the existing `gsap.registerPlugin` call.
- `src/app/(storefront)/[locale]/shop/page.tsx` — replace the inline grid mapping with `<ShopGridFlip products={products} locale={locale} />`
- Whichever file renders the filter chips — the filter chip click handler writes to the URL via `router.push`, and your Flip effect reacts to URL changes automatically on the next re-render.

### Implementation recipe

Your new `ShopGridFlip.tsx` should be a `'use client'` component that:

1. Uses `usePathname` and `useSearchParams` from `next/navigation` to read the current filter state. Derive a simple string key from `searchParams.toString()` — this changes whenever any filter changes.
2. Keeps a ref to the grid element and a ref to the PREVIOUS Flip state. The previous state ref is critical — Flip needs to capture state BEFORE the DOM changes, then play the animation AFTER it has changed.
3. On mount (first render with no previous state), runs a simple stagger fade-in via `gsap.from` on the grid children so the initial grid feels alive. Mark the grid element as "flip ready" via a dataset attribute so the next re-render knows it is no longer the first render.
4. On subsequent renders where the filter key has changed and flip is ready, uses `Flip.from(previousState, config)` where config includes: `duration: 0.7`, `ease: 'power2.inOut'`, `absolute: true` (so cards use position absolute during the flip so reflow does not fight), plus `onEnter` and `onLeave` callbacks that fade cards in and out via `gsap.fromTo` and `gsap.to`.
5. Captures the NEW state on every render for the next transition. The correct place to capture is: right before React re-renders, which in practice means you capture inside a `useEffect` that runs when `filterKey` changes, using `Flip.getState(gridRef.current.children)` BEFORE the children have updated. This is tricky — look at the canonical React + Flip pattern in the GSAP docs: it involves capturing state in a `useRef` via a `useLayoutEffect` or cleanup function, then flipping from that saved state after the new render.
6. Reduced motion bypass: if `useGsapReducedMotion` returns true, render the grid normally without any Flip logic at all. The cards will just cut between states like the current behavior — no regression.

### Important gotchas for T1.6

- **Flip + ProductCardMotion tilt.** Every ProductCard is wrapped in ProductCardMotion which attaches pointer listeners and writes rotationX / rotationY via GSAP. If a card is mid-tilt when the filter changes, the Flip animation will fight the tilt. Solution: at the start of the Flip, call a `gsap.set` on all cards that clears rotationX and rotationY props so the cards are flat during the reflow. They will pick up tilt again on the next pointer event naturally.
- **URL state sync.** Filter chips use Next.js router.push which triggers a server re-render. That passes a new `products` array to the client component as a prop. The Flip effect needs to run AFTER React has applied the new array to the DOM. This is subtle — read the GSAP Flip docs for the React-specific pattern and test in the browser before assuming it works.
- **Reduced motion bypass.** Just render the grid normally. No transitions at all. No Flip calls.
- **Initial mount.** On first render there is no previous state to diff against — do a simple stagger-in, not a Flip.
- **Plugin registration.** Remember to update `src/lib/motion/gsap.ts` to register Flip. The existing file already has the pattern for ScrollTrigger — mirror it.

### Verification after T1.6

- tsc, lint, build all green
- Navigate to `/shop`, click between the brand chips (All, Forever, Natural) — product cards smoothly reflow into their new positions with a 700ms Flip animation
- Cards that disappear fade out; cards that appear fade in; cards that stay in both states interpolate position

---

## T1.7 — Product detail image gallery smooth zoom + thumb Flip (estimated 45 to 60 min)

### Goal

On `/product/[slug]`, the main product image currently has a CSS-only hover scale. Upgrade it so:

1. Hover on main image: smooth GSAP scale from 1 to 1.12 over 900ms with `power2.out` ease. On leave, return to 1 over 700ms.
2. Click a thumbnail (if there are multiple images): GSAP Flip animates the thumb image into the main slot. The old main image fades out as the thumb morphs into its position.

### Files to read first

- `src/app/(storefront)/[locale]/product/[slug]/page.tsx`
- Whatever gallery component the product detail page uses (grep for "gallery" or look for the image rendering in the product page)

### Files to create

- `src/components/product/ProductGalleryMotion.tsx` — client component that owns the main image, thumbs, and Flip logic

### Files to modify

- The product detail page to delegate image gallery rendering to `<ProductGalleryMotion>`

### Implementation recipe

Your new `ProductGalleryMotion.tsx` should be a `'use client'` component that:

1. Receives the `images` array (url + alt for each) and the product title as props from the server parent.
2. Uses `useState` to track the active image index.
3. Keeps a ref to the main image wrapper element.
4. Uses `useGsapReducedMotion` to check reduced motion.
5. Renders a main image viewport that has the active image, plus a row of thumbnail buttons below if there are 2 or more images.
6. On main image hover enter: runs `gsap.to` on the inner img element with `scale: 1.12, duration: 0.9, ease: 'power2.out'`. On leave, returns to `scale: 1, duration: 0.7, ease: 'power2.out'`. Skip this entirely if reduced motion is on OR if the device does not support hover (touch device check via matchMedia "hover: hover").
7. On thumbnail click, if the clicked index equals the current index, do nothing. If reduced motion is on, just set state and skip the Flip. Otherwise: capture the current state via `Flip.getState` on the main image data attribute, setState to the new index, then on the next animation frame call `Flip.from(state, config)` with duration 0.7, ease power2.inOut, absolute true.
8. Only the main image should have a `data-gallery-image` attribute so the Flip selector targets it uniquely. Thumbs get a different attribute so they are not accidentally morphed.

### Important gotchas for T1.7

- **Only one image per data-attribute at any time.** The main image is the only element with `data-gallery-image`. Thumbs use `data-gallery-thumb` (or nothing at all).
- **Touch devices.** Drop the hover zoom entirely on touch devices — same gate as ProductCardMotion uses.
- **Server side.** The product detail page is a server component that fetches the product. Pass the resolved image array down as a prop. Don't put the Payload query inside the client component.
- **Reduced motion.** Both the hover zoom AND the thumb Flip are skipped on reduced motion. The user just sees instant state changes.

### Verification after T1.7

- tsc, lint, build all green
- Navigate to `/product/[slug]` (pick any product that has 2 or more images — `aloe-first` has 2). Hover the main image: smooth scale. Click a thumbnail: smooth morph to main slot.

---

## After you ship each wave

Run these in order every time:

```
cd C:/AI/YaritShop/yarit-shop
npx tsc --noEmit
npm run lint
npm run build
curl -sL http://localhost:3000/he | grep -c data-meet-image
```

If all 4 commands exit 0, the wave is shipped. Update `docs/STATE.md` with a new changelog entry at the very top (reverse chronological — add ABOVE the latest entry). Follow the same format as previous entries: goal, files created, files modified, verification, gotchas.

Do NOT commit. Do NOT push. Do NOT run vercel. Stop and hand back to the user so they can review.

---

## If something goes wrong

1. **tsc error in a file you did not edit** → it is probably a type mismatch in a dependency between components. Run tsc and read the actual error. Don't panic-fix random files.
2. **Build fails with a PostCSS / Tailwind error about "Invalid code point" or similar** → you accidentally wrote a class name containing square brackets plus parentheses somewhere. Tailwind v4 scans EVERY file (JS, TS, JSX, TSX, and MARKDOWN). Check any file you recently edited for class-name-like patterns inside comments, docstrings, code-block examples, or stringified examples. Rewrite in prose.
3. **GSAP effect does not fire in the browser** → check browser devtools console for errors. Then check that `'use client'` is on the file. Then check that the ref is actually attached to a real DOM element. Then check that useGsapScope is being called (not useGSAP directly).
4. **ScrollTrigger pins but the layout breaks** → you forgot `pinSpacing: false`, OR the pinned element's parent has `overflow: hidden` which breaks position fixed. Check the Container's overflow.
5. **Flip animation snaps instead of smoothing** → you're calling Flip.from on the wrong state. Read the GSAP Flip docs — the pattern is: capture state BEFORE DOM change, then Flip.from(state) AFTER React has applied the new DOM.
6. **Preview MCP browser will not navigate** → this is a known issue from previous sessions where Payload admin client state intercepts navigations. Use curl against the dev server directly for HTML checks instead. Or restart the preview server via preview_stop and preview_start.
7. **You are about to touch the admin** → STOP. Re-read the Rules of Engagement above. Admin is off limits.

---

## Final handoff checklist

Before you end the session:

- [ ] All 4 waves shipped OR a clear note in STATE.md about which ones are done and which are deferred
- [ ] tsc, lint, and build all exit 0
- [ ] `docs/STATE.md` has a new top-of-changelog entry for the work you did
- [ ] `docs/NEXT-SESSION.md` TL;DR updated to reflect the new state
- [ ] Nothing committed or pushed (user holds git authorization)
- [ ] If you shipped fewer than 4 waves, this file (`NEXT-SESSION-GSAP-PROMPT.md`) is UPDATED to cross off the waves you finished and leave the remainder for the session after you. Do NOT delete this file — it is a reusable template.

Good luck. The user trusts these upgrades to stay within the existing editorial, botanical, warm-luxe apothecary vocabulary. Slow over fast, restraint over flash, additive over replacement.
