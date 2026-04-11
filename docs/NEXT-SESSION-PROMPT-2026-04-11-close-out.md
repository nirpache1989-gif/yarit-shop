# Next session — final closing prompt (copy-paste this to start)

> **✅ COMPLETED 2026-04-11 late.** This prompt was executed in full: `e3a8a53` + `4ea4d90` are both pushed and deployed to production at `https://yarit-shop.vercel.app`. All 16 smoke-test routes return 200, product pages render correctly in both locales, the T1.4–T1.7 GSAP waves are live, the mobile audit fixes are verified. A P0 SSG regression (pre-existing since Phase F.1, masked by `npm run dev`) was surfaced during prod smoke-testing, root-caused, and fixed in the same session — see the 2026-04-11 late entry in `docs/STATE.md` for the full post-mortem. **For the current starting prompt, see the new `docs/NEXT-SESSION-PROMPT.md` — this file has been demoted to a historical record of the close-out session.**
>
> The text below is preserved as-is from when it was written, for archival reference only.
>
> ---
>
> **Purpose:** You are the closing session of the Shoresh project. This file is the exact prompt the user will paste when they open a new session. Your job is to take the project from "all code shipped locally" to "deployed, verified, and handed over to Yarit". Read this file top to bottom, then `CLAUDE.md`, then `docs/STATE.md` (top section — "Latest (2026-04-11)"), and only then start working.
>
> **When this file was written:** 2026-04-11, at the end of the GSAP Tier-1 finish + mobile audit session. Everything in code is DONE. The previous sessions left all of G1/G2/G3/T1.1/T1.2/T1.3/T1.4/T1.5/T1.6/T1.7 + admin language pill + mobile fixes ready to commit.

---

## TL;DR — your mission this session

1. Verify everything still builds clean (`tsc`, `lint`, `build`).
2. Commit the accumulated local work as ONE clean commit (or a tight series — your call based on what's cleanest).
3. Push to `main`. Confirm Vercel auto-deploys. If the Vercel webhook is stalled (has been a known issue), run `npx vercel --prod` manually.
4. Smoke-test the live production URL at `https://yarit-shop.vercel.app` across desktop Chrome + real mobile Safari/Chrome (the user will test on their Redmi Note Poco X7). Verify:
   - Hebrew default loads on `/`
   - English at `/en`
   - Language switcher visible in the header at every breakpoint (the big mobile regression from the 2026-04-11 audit)
   - Site loads in LIGHT mode by default even when the phone's OS is set to dark (the second 2026-04-11 audit fix)
   - Featured products heading pins to viewport top on desktop while cards scroll past (T1.4)
   - Sticky header shrinks after 80px scroll — bg more opaque, shadow appears, logo ~20% smaller (T1.5)
   - Shop page: clicking a filter chip morphs the product grid (T1.6)
   - Product detail: hover zoom on the main image, thumb clicks flip into the main slot (T1.7 — thumb path requires a multi-image product)
   - Nothing in the admin panel regressed
5. Handle whichever external credentials Yarit has handed over (these are Track A — any combination of them unblocks going fully live):
   - `RESEND_API_KEY` + `EMAIL_FROM` + `EMAIL_FROM_NAME` + `EMAIL_PROVIDER=resend` — paste into Vercel env and redeploy
   - `MESHULAM_*` credentials — finish the two `TODO(meshulam)` hotspots in `src/lib/payments/meshulam.ts` against Yarit's Meshulam PDF, sandbox E2E test, then paste env and flip `PAYMENT_PROVIDER=meshulam`
   - Legal markdown — drop the files in `content/legal/<slug>/<locale>.md`, then re-add the footer legal links in `src/components/layout/Footer.tsx`
   - Custom domain — wire up DNS + add to Vercel project settings
   - Final product catalog copy — Yarit edits live via `/admin/collections/products`
6. Update `docs/STATE.md` with a new changelog entry describing what this session actually shipped. Don't delete this file (`NEXT-SESSION-PROMPT.md`) — just mark it completed at the top.

---

## Important rules (non-negotiable)

1. **Never commit or push without explicit user authorization.** The user holds git permission. They may say "go ahead and commit" in this session, or they may want to review first. Read their first message carefully.
2. **Never modify the admin panel aesthetics unless asked.** `src/app/(payload)/*`, `src/components/admin/payload/*`, `src/collections/*`, `src/payload.config.ts` are under the admin domain. The admin language pill is shipped; don't add more GSAP there.
3. **Additive only for motion.** Do not remove any CSS keyframe in `globals.css` or any primitive in `src/components/motion/`. The `Reveal`, `StaggeredReveal`, `KenBurns`, `SplitWords`, `CountUp`, `ConfettiTrigger` primitives stay exported.
4. **Respect the drift vocabulary.** Durations 600–1400ms for single moves, 2–4s for orchestrated. Eases `power2.out` / `power3.out` / `expo.out` / `power1.inOut` only. No elastic / bounce / back. Tilt ceiling ±3–8°.
5. **Every new motion uses `useGsapScope`** from `src/components/motion/GsapScope.tsx` with a reduced-motion check and `clearProps: 'all'` on reduced.
6. **Server→client props are strings/numbers/booleans/JSX only.** No function props cross the boundary.
7. **Single GSAP entry point.** Import from `@/lib/motion/gsap`, never raw `gsap/ScrollTrigger` or `gsap/Flip`. The single entry registers plugins exactly once.
8. **No Tailwind arbitrary-value classes inside JSX comments or Markdown files** — the Tailwind v4 scanner picks them up and can 500 every page at build time. Describe class patterns in prose.

---

## Working directory & quality gates

```
cd C:/AI/YaritShop/yarit-shop
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0
npm run build           # must exit 0
```

Dev server: `npm run dev` → http://localhost:3000
Preview MCP: the user may ask you to verify via the Claude Preview MCP. Remember that Preview MCP's Chrome does NOT emit native scroll events on programmatic `window.scrollTo(y)` — ScrollTrigger won't auto-update during preview-driven tests. Dispatch `window.dispatchEvent(new Event('scroll'))` manually if you need to verify scroll-triggered behavior in the preview.

---

## What's in the working tree right now (2026-04-11 handoff)

Everything below was brought in by the 2026-04-10 + 2026-04-11 sessions. Either this is committed already when you read this (user committed at end of 2026-04-11) OR you are the one committing it. Check with `git status` and `git log` at the very start of your session to know which.

### Storefront GSAP tree

- `src/lib/motion/gsap.ts` — single entry, registers ScrollTrigger + Flip. `Flip` imported via `gsap/dist/Flip` to dodge a GSAP 3.14.2 types subpath casing bug on Windows.
- `src/lib/motion/useGsapReducedMotion.ts` — `useSyncExternalStore` hook that returns live `prefers-reduced-motion` state.
- `src/components/motion/GsapScope.tsx` — the `useGsapScope(ref, setupFn, deps)` helper every motion component uses.
- `src/components/sections/HeroMotion.tsx` (G2)
- `src/components/sections/MeetYaritMotion.tsx` (T1.1)
- `src/components/sections/CategoryGridMotion.tsx` (T1.2)
- `src/components/ui/BranchDivider.tsx` (T1.3 — was converted from server to client to own the draw-in timeline)
- `src/components/product/ProductCardMotion.tsx` (G3 — magnetic cursor tilt on every product card)
- `src/components/sections/FeaturedProductsMotion.tsx` (T1.4)
- `src/components/layout/HeaderShrinkObserver.tsx` (T1.5)
- `src/components/shop/ShopGridFlip.tsx` (T1.6)
- `src/components/product/ProductGalleryMotion.tsx` (T1.7)

Server shells that hand data to the above:

- `src/components/sections/Hero.tsx` (server — hands strings to HeroMotion)
- `src/components/sections/MeetYarit.tsx` (server)
- `src/components/sections/CategoryGrid.tsx` (server)
- `src/components/sections/FeaturedProducts.tsx` (server — 50 lines, hands products + strings to FeaturedProductsMotion)
- `src/app/(storefront)/[locale]/shop/page.tsx` (uses ShopGridFlip)
- `src/app/(storefront)/[locale]/product/[slug]/page.tsx` (uses ProductGalleryMotion)
- `src/components/layout/Header.tsx` (server — mounts HeaderShrinkObserver as a client sibling, `id="site-header"`, LanguageSwitcher moved out of `hidden md:flex`)
- `src/app/(storefront)/[locale]/layout.tsx` (updated theme bootstrap — defaults to light, no more OS dark detection)

### Admin language pill

- `src/components/admin/payload/AdminLangSwitcher.tsx` — new client component registered as the first entry in `admin.components.actions` in `src/payload.config.ts`. Renders a `🌐 עברית` ↔ `🌐 English` pill in the top-right action cluster of every admin page.
- `src/components/admin/payload/SidebarGreeting.tsx`, `SidebarFooter.tsx`, `HelpButton.tsx` — all three read `props.i18n?.language` and branch inline `strings` objects so the Hebrew/English flip reaches the full sidebar chrome.
- `src/app/(payload)/admin-brand.css` — minor tweaks during the admin audit.

### Messages

- `src/messages/he.json` + `src/messages/en.json` — added `product.galleryThumbLabel` + `product.galleryMainLabel` for T1.7 accessibility.

### Global CSS

- `src/app/globals.css` — added a `@layer utilities { header#site-header { … } }` block for the header shrink state (T1.5). Added reduced-motion overrides for the header transitions.

### Docs (what you should read before touching code)

- `docs/STATE.md` — top section "Latest (2026-04-11)" has the full per-wave breakdown
- `docs/NEXT-SESSION.md` — 5-min orientation to the repo
- `docs/NEXT-SESSION-GSAP-PROMPT.md` — old GSAP Tier-1 roadmap, all 4 waves now marked as shipped
- `docs/DECISIONS.md` — any new ADR for Flip registration is optional (the decision is captured in the file comment inside `src/lib/motion/gsap.ts`)

---

## Known quirks you will bump into

1. **Preview MCP scroll events.** Programmatic `window.scrollTo(y)` does not fire a native `scroll` event in the Preview MCP Chrome instance. ScrollTrigger piggybacks on those events, so during preview verification you may see cards stuck at opacity 0 because the tween never played. Dispatch `window.dispatchEvent(new Event('scroll'))` manually if you need to verify. **Real browsers emit scroll events normally — production is fine.**
2. **Preview MCP screenshots.** `preview_screenshot` sometimes times out on this page because the storefront has a lot of always-animating backgrounds (ambient-breathe, KenBurns, DriftingLeaves, leaf-breathe, iridescent shimmer). Fall back to `preview_snapshot` + `preview_inspect` + `preview_eval` for measurements instead of relying on visual captures.
3. **Seed data single-image limit.** Every dev product has a static-override entry in `src/lib/product-image.ts` that forces a single image. This means the T1.7 thumb-Flip path does not get exercised against the default seed. To test it locally, delete one override and create a multi-image product via `/admin/collections/products`.
4. **Tailwind v4 layer order.** Utilities live in `@layer utilities`. If you add a rule that needs to beat a Tailwind utility class via specificity, put YOUR rule inside `@layer utilities { … }` too. An unlayered rule will LOSE to a layered utility via layer order even if your selector is more specific. T1.5's `header#site-header[data-scrolled="true"]` block relies on this.
5. **GSAP Flip types bug (Windows).** Do NOT import Flip as `import { Flip } from 'gsap/Flip'`. Use `import { Flip } from 'gsap/dist/Flip'` instead. See the long comment in `src/lib/motion/gsap.ts` for the full explanation.
6. **Fast Refresh + gsap.from initial state.** When HMR rebuilds a component in dev, `useGsapScope`'s setup re-runs, which re-applies the `gsap.from` initial state (opacity 0 etc.). If the user is scrolled PAST the trigger when HMR fires, the tween may not replay automatically because ScrollTrigger thinks it's already past its end. This is dev-only; production is unaffected. Reloading fixes it.
7. **Vercel auto-deploy webhook.** The GitHub → Vercel webhook has been stalling intermittently since the 2026-04-10 sprint. After pushing, if Vercel doesn't pick up the commit within 2–3 minutes, run `npx vercel --prod` manually. Don't panic-re-push.

---

## Definition of done for this session

Ship these in order. Stop and confirm with the user after each block if you're not sure.

### Block A — commit + push + deploy

- [ ] `tsc`, `lint`, `build` all green (run them fresh on session start)
- [ ] Stage the uncommitted changes in a sensible grouping (one big "Tier-1 finish + mobile audit" commit is fine if the user says "one commit")
- [ ] Commit with a clear Hebrew + English-friendly message that mentions: T1.4-T1.7, mobile language switcher fix, theme bootstrap fix, and the a11y gallery aria-labels
- [ ] Push to `origin main` ONLY after explicit user confirmation
- [ ] Watch Vercel; fall back to `npx vercel --prod` if auto-deploy stalls
- [ ] Smoke-test `https://yarit-shop.vercel.app` (desktop) — hero, shop, product detail, cart, language switcher, dark mode toggle
- [ ] Wait for the user to smoke-test from their Poco X7 — both mobile fixes should pass visually

### Block B — Track A credentials (whichever Yarit has handed over)

- [ ] Resend email: paste env vars, redeploy, trigger a test checkout, verify order confirmation email arrives
- [ ] Meshulam: reconcile `src/lib/payments/meshulam.ts` TODO hotspots against the PDF, sandbox test, then flip env to live
- [ ] Legal markdown: drop files in `content/legal/*`, re-add footer links
- [ ] Custom domain: add to Vercel project, update DNS records
- [ ] Final product catalog: let Yarit edit live (no code needed)

### Block C — handoff

- [ ] Update `docs/STATE.md` with a new changelog entry
- [ ] Update `docs/NEXT-SESSION.md` TL;DR
- [ ] Mark this file (`NEXT-SESSION-PROMPT.md`) as completed at the top
- [ ] Tell the user what's live, what's still blocked on external input (if anything), and what Yarit should try first

---

**Good luck. The site is in great shape — restraint, editorial polish, botanical warmth throughout. Don't break the vocabulary. Slow over fast, restraint over flash, additive over replacement.**
