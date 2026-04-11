# Next session — starting prompt (final QA + GSAP polish + closeout)

> **Purpose:** This is the **last planned session** for Shoresh. T2.9 — the homepage scroll-linked
> storytelling wave — shipped cleanly at the end of the previous session (`9f01a50`, deployed via
> `dpl_EQYNCT12CyNVmPSthrs5SVmg6YwJ`, live at `https://yarit-shop.vercel.app`). The previous session
> also cleaned up 2 stray test products from the local dev DB, rewrote the admin help button as a
> mini-guide popover (Yarit's explicit ask), and pushed the whole batch to main + prod. This
> session's job is to do a **deep QA pass across the whole site**, add **one more layer of GSAP
> polish** (smaller, targeted bits to make the site feel even better), and **prepare the final
> handoff**.
>
> **Read this file top to bottom, then `CLAUDE.md`, then the top entry in `docs/STATE.md`
> ("2026-04-11 night — T2.9 homepage scroll-linked storytelling + admin help rewrite"). Only then
> start working.** The previous ready prompts are archived at
> `docs/NEXT-SESSION-PROMPT-2026-04-11-t2.9-homepage-orchestration.md` (the T2.9 prompt that led to
> tonight's ship), `docs/NEXT-SESSION-PROMPT-2026-04-11-cleanup-and-tier2-lite.md`, and
> `docs/NEXT-SESSION-PROMPT-2026-04-11-close-out.md`. Historical — don't read unless you want
> context.

---

## 🛟 SAFETY NET

The previous session's safety net is still the right approach.

**Last known-good commit is `9f01a50`** (T2.9 homepage scroll-linked storytelling + admin help
rewrite, merged fast-forward from `feat/t2.9-homepage-orchestration`). This is what `origin/main`
points at, what Vercel is deploying, and what Yarit sees when she opens `https://yarit-shop.vercel.app`.
It is SAFE until you explicitly `git push` or `npx vercel --prod`.

**Before you start any ambitious motion work, cut a feature branch:**

```bash
cd C:/AI/YaritShop/yarit-shop
git fetch origin
git checkout origin/main
git checkout -b feat/final-qa-and-polish          # or a more specific name per sub-task
```

Work on that branch. `main` stays on `9f01a50` until you explicitly push. Prod stays where it is
until you `npx vercel --prod --yes`. Treat every commit as opt-in. **Never push to main and never
deploy without the user saying "push" or "deploy"** — the previous session survived a 6-beat
motion restructure on this pattern and it works.

For tiny, low-risk changes (typo fixes, 1-line docs updates), you can commit directly to `main`
and wait for explicit user approval before pushing. For anything that touches rendered output,
use a branch.

---

## Where things stand

### Production

- **LIVE at `https://yarit-shop.vercel.app`** at commit `9f01a50` via `dpl_EQYNCT12CyNVmPSthrs5SVmg6YwJ`
- All 40 routes build cleanly (`ƒ` / `○`, zero `●` SSG)
- The 2026-04-11 `immediateRender: false` blank-cards bug is fixed on every existing tween and
  the pattern is enforced on every new tween via a non-negotiable rule (CLAUDE.md rule #12).
- Bug-fix regression test passes on prod: 5 category cards + 3 featured cards + 3 testimonial
  cards + 4 meet text blocks all at `opacity: 1` on load.

### GSAP waves shipped to date

- **Tier-1** (G1–G5, T1.1–T1.7) — all shipped
- **Tier-2 lite** — T2.1 checkout confetti, T2.2 footer reveal, T2.8 category tile magnetic hover
- **T2.9 — homepage scroll-linked storytelling** (shipped end of previous session):
  - #1 Hero exit parallax tightening (`HeroMotion.tsx`)
  - #2 TrustBar scale reveal + new `'scale'` primitive direction
    (`Reveal.tsx` + `StaggeredReveal.tsx` + `globals.css` + `TrustBar.tsx`)
  - #3 MeetYarit body-paragraph word cascade via `useInView`-gated `<SplitWords>`
    (`MeetYaritMotion.tsx`)
  - #4 CategoryGrid desktop header pin (`CategoryGrid.tsx` + `CategoryGridMotion.tsx`)
  - #5 Testimonials horizontal cascade (`Testimonials.tsx` + new `TestimonialsMotion.tsx`)
  - #6 BranchDivider → next-section coordination (`BranchDivider.tsx` + `page.tsx` +
    section `data-section` attributes)

### Admin

- `HelpButton` is now a 7-task mini-guide popover (not a contact card)
- `YARIT-ADMIN-GUIDE.md` is still the long version of the same content
- Everything else admin is untouched

### Docs

- `docs/STATE.md` has a full T2.9 ship entry as the "Latest" section
- `docs/YARIT-ADMIN-GUIDE.md` is still the canonical long-form guide
- `docs/CONVENTIONS.md` + `docs/DECISIONS.md` ADR-018 document the SSG incident prevention rule
- `CLAUDE.md` rule #12 enforces `immediateRender: false + once: true` on every new `gsap.from`
  + scrollTrigger

---

## Your primary tasks this session

### Task 1 — Deep QA pass (front + admin)

The previous session verified the 6 T2.9 beats via Preview MCP + a local prod-build smoke test,
ran quality gates after each beat, and fetched the live prod site to confirm ship. This session
should go deeper. Check:

**Storefront (LTR English)**
- [ ] `/en` — homepage: all 6 sections scroll cleanly, dividers draw in sync with their next
  section, TrustBar icons bloom on enter view, MeetYarit body cascades word-by-word, CategoryGrid
  heading pins on desktop + unpins at section bottom, Testimonials cards slide in from the left
  (LTR start edge), hero parallax scrubs smoothly
- [ ] `/en/shop` — 7 products render, category filter (`?category=aloe`) narrows the list
- [ ] `/en/shop/product/<slug>` — at least 3 product detail pages (lip balm, multivitamin, gift set)
- [ ] `/en/cart` — empty state + add-to-cart round trip
- [ ] `/en/checkout` — form renders, no "test checkout" disclaimer leaking to customers (prod
  uses a real payment provider — confirm via `isMockPaymentProvider()` behavior)
- [ ] `/en/about` — long-form page, reveal-on-scroll still works
- [ ] `/en/contact` — form renders, email/phone pulled from SiteSettings (not brand.config
  placeholders)
- [ ] `/en/login` + `/en/forgot-password` + `/en/reset-password/<token>` — auth flow
- [ ] `/en/account` — after login, orders list + profile + addresses
- [ ] `/en/legal/<slug>` — if legal markdown is still empty, verify the 404 path is graceful

**Storefront (RTL Hebrew, the default locale)**
- [ ] `/` (= `/he`) — dir=rtl, Hebrew copy everywhere, Testimonials cards slide in from the RIGHT
  (RTL start edge), Hebrew headline "שורשים של בריאות", all 5 category tiles with Hebrew titles
- [ ] Run through the same checklist as above but on the Hebrew side

**Mobile 375×812**
- [ ] No horizontal scroll on any page
- [ ] Category heading pin DOES NOT fire on mobile (`position: static` throughout)
- [ ] Hero min-height and drifting leaves still look right
- [ ] MobileNav opens from the right edge (in RTL) / left edge (in LTR)
- [ ] Cart drawer overlay doesn't block the checkout button (the 2026-04-11 P1 fix)

**Tablet 768×1024**
- [ ] Just barely desktop — verify the CategoryGrid pin fires at the 768px breakpoint
- [ ] Product grid collapses to 3 columns on tablet, 4 on desktop

**Reduced motion**
- [ ] DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" → reload
- [ ] Every animation snaps to its settled state (no movement, no fades)
- [ ] `[data-category-card]`, `[data-featured-card]`, `[data-meet-text-block]`,
  `[data-testimonial-card]` all at `opacity: 1` with identity transforms
- [ ] TrustBar icons visible immediately

**Admin panel**
- [ ] Login as `admin@shoresh.example` / `admin1234` (dev DB only — prod has whatever Yarit set)
- [ ] Dashboard loads with the correct product count (7), order count, customer count
- [ ] `/admin/collections/products` — 7 rows, no stray lavender rows
- [ ] `/admin/collections/products/1` — edit form loads, Hebrew + English title tabs work
- [ ] `/admin/collections/categories` — 5 categories, drag-reorder works
- [ ] `/admin/collections/orders` — orders list (may be empty on dev — that's fine)
- [ ] `/admin/globals/site-settings` — loads, all fields labeled in Hebrew
- [ ] `/admin/fulfillment` — custom fulfillment view loads
- [ ] **HelpButton popover** — opens in both he and en, 7 task cards, click to expand hint,
  Escape / outside-click closes, no WhatsApp / email / mailto refs
- [ ] **Language pill** (`עברית · EN`) — clicking flips the emphasis

**Network + console hygiene**
- [ ] Zero console errors on every page visited
- [ ] Zero network 500s
- [ ] No missing images (404s on `/brand/ai/*.jpg` etc.)
- [ ] No hydration warnings (`Text content did not match`)

**Quality gates**
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npm run build` → 40 routes, `ƒ` / `○`, zero `●` SSG

### Task 2 — Extra GSAP polish ("make the site feel even better")

Small, targeted additions. **Restraint over flash.** Pick 2–4 of these, not all of them. All must
respect the non-negotiables in the previous section (durations, eases, tilt ceiling,
`immediateRender: false + once: true` on every `gsap.from` + scrollTrigger, import from
`@/lib/motion/gsap` only, customer-only, additive only).

Candidate ideas (order = rough priority):

1. **Sticky-header compression on scroll.** When the user scrolls past the Hero, the
   `src/components/layout/Header.tsx` nav could compress from its current height to something
   tighter (~52px), with the logo shrinking and the background gaining a subtle blur. GSAP
   scroll-scrubbed, gated on `(min-width: 768px)` + reduced motion. This is a common editorial
   pattern and is an additive overlay on the existing sticky nav.

2. **Product card image Ken Burns on scroll-into-view.** `ProductCard.tsx` has a hover-zoom
   already. Add a one-shot Ken Burns drift when the card first enters the viewport (not on
   scroll, just at entry) so every card feels "alive" the first time the user sees it. Use the
   existing `KenBurns` primitive or write a one-off GSAP tween.

3. **Hero headline rotateX → 0 tightening.** The existing T1.1 entrance uses `rotateX: -8°` on
   each word. This is tasteful but subtle — try tightening to a slightly more dynamic `rotateX:
   -12°` + shorter duration. Restrained tweak.

4. **Shop grid bloom-in on first page load.** `ShopGridFlip.tsx` currently uses Flip for
   filter/sort transitions. Add a T1.2-style bloom entrance on first render so the whole grid
   feels like it's arriving deliberately.

5. **Add to cart button press feedback.** When the user clicks "add to bag", the button could do
   a small GSAP-driven scale bounce (`0.96 → 1`, 200ms) + a check icon fade-swap. Pair with the
   existing `CartDrawer` open animation for a coordinated "item added" moment.

6. **Footer rise on exit viewport.** When the user scrolls off a page (e.g. shop → cart), the
   `Footer.tsx` Reveal primitive already fires on scroll-in. Add a subtle `y: 40 → 0` +
   `opacity: 0 → 1` on a second ScrollTrigger if it re-enters (safer: just ensure the footer
   reveal doesn't get "stuck" on SPA navigation).

7. **404 page polish.** `src/app/not-found.tsx` is a little static. Add a GSAP intro (headline
   + illustration drift) so a user who hits a dead link still feels cared for.

8. **Cart drawer stagger on items.** When multiple items are added in quick succession, the
   cart drawer items could stagger-reveal. Might already work — verify.

**Critical**: every pick should be verified on prod build via `preview_start("yarit-shop-prod")`
and a smoke test before committing. Follow the same verification workflow as T2.9: after each
substantive edit, run `tsc + lint + build`, then `preview_eval` against the running prod server
to confirm the behavior works.

### Task 3 — Final handoff

The previous T2.9 session was sold as "then close out the project". That was optimistic — there's
still one session of polish. This session's closeout deliverables:

- [ ] **Write Yarit a short "your shop is live" note in Hebrew.** What URL to bookmark, how to
  log in (admin email + a password YARIT chose, not the dev default), what she can edit, and what
  she should wait for (Meshulam credentials, Resend API, legal markdown, custom domain — these
  are external inputs she needs to provide or wait on). Save to
  `docs/YARIT-WELCOME-LETTER.md` (new file) with a header explaining it's Hebrew-only and meant
  to be copy-pasted into WhatsApp / email.

- [ ] **Update `docs/NEXT-SESSION.md` TL;DR** so if anyone opens the project cold, they see "the
  shop is live, Yarit is using it, remaining work is external input (credentials, legal, domain,
  final content)."

- [ ] **Walk `docs/STATE.md` end-to-end** and confirm the timeline reads cleanly. Archive the
  oldest entries if the file has grown past ~800 lines (create
  `docs/STATE-ARCHIVE.md` for the historical entries).

- [ ] **Tell Nir what to send Yarit and when** in a brief summary (docstring in this prompt file,
  or a top-of-session message). What's the handoff sequence, who does what.

- [ ] **Archive `NEXT-SESSION-PROMPT.md`**. If the final closeout truly completes, this file
  becomes "NEXT-SESSION-PROMPT-2026-04-11-final-qa-and-polish.md" and a new one replaces it with
  only the "post-handoff maintenance" notes (if any). If more work is needed, extend into
  another polish pass.

### Task 4 — Any Yarit follow-up asks

If Yarit has new asks between sessions, add them here. As of the T2.9 ship:
- Admin help button → mini-guide popover (✅ shipped in T2.9 session)
- Lavender-soap stray products → removed from dev DB (✅ shipped; prod was never affected)

---

## Non-negotiables (same every session)

1. **Never push to main without explicit user word.** Fast-forward merge + `git push origin
   main` + `npx vercel --prod --yes` all require the user saying "push" / "deploy".
2. **No admin panel aesthetic changes** unless Yarit explicitly asks. The HelpButton rewrite was
   authorized. `src/app/(payload)/*`, `src/components/admin/payload/*`, `src/collections/*`,
   `src/payload.config.ts` are otherwise read-only.
3. **Motion is additive only.** Don't remove existing keyframes, don't touch the motion
   primitives (except to add new additive direction/variant values), don't break the
   editorial-botanical vocabulary.
4. **`setRequestLocale` + `getTranslations` in every server page/layout.**
5. **`cookies()`, `headers()`, `draftMode()` are async.**
6. **Never import `next/link` in storefront code.**
7. **Single GSAP entry point** — `@/lib/motion/gsap`.
8. **Server→client props are serializable only.** No function props.
9. **No Tailwind arbitrary-value classes in JSX comments or markdown files.**
10. **Hebrew + English bilingual strings always go through `src/messages/{he,en}.json`.**
11. **Never re-add `generateStaticParams` returning only `{locale}` to a TWO-segment dynamic route**
    — CI will fail.
12. **Every new `gsap.from` + scrollTrigger MUST include `immediateRender: false + once: true +
    start: 'top bottom-=40'`** — the 2026-04-11 bug-fix pattern is enforced.

## Working directory + quality gates

```bash
cd C:/AI/YaritShop/yarit-shop
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0, 0 errors 0 warnings
npm run build           # must exit 0, all 40 routes ƒ/○, zero SSG
```

Dev server: `npm run dev` → http://localhost:3000. **Warning:** `npm run dev` does NOT exercise
SSG behavior and has looser GSAP timing than prod builds. If you need to reproduce a
production-only motion issue, use `npm run build && npx next start -p <free-port>` instead.

Preview MCP: `preview_start("yarit-shop-prod")` uses the config in
`C:/AI/YaritShop/.claude/launch.json` (the **project root** launch.json, NOT
`yarit-shop/.claude/launch.json` — Preview MCP reads from the parent). The config runs
`npm --prefix yarit-shop run start -- -p 3009` which expects a prior `npm run build`.
Preview MCP's Chrome has two quirks worth remembering:

- Programmatic `window.scrollTo` sometimes doesn't stick without a `requestAnimationFrame` chain.
  Use `document.documentElement.scrollTop = <y>` inside an rAF, then dispatch
  `new Event('scroll')` manually, then sample after `setTimeout(..., 1500)`.
- `preview_click` on buttons that use React onClick handlers sometimes doesn't propagate. Use
  `btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))`
  via `preview_eval` as a reliable fallback.

---

## Definition of done for this session

The session is done when:

- [ ] Task 1 — every Task 1 checkbox ticked, no regressions found (or any regressions found are
      fixed + verified)
- [ ] Task 2 — 2–4 GSAP polish additions shipped, each verified on local prod build
- [ ] Task 3 — handoff deliverables written (Hebrew welcome letter, NEXT-SESSION.md, STATE.md
      walk, Nir handoff note)
- [ ] All quality gates green
- [ ] `git push origin main` only after explicit user word
- [ ] `npx vercel --prod --yes` only after explicit user word
- [ ] `docs/STATE.md` has a new "Latest" entry describing the final QA + polish + handoff
- [ ] This `NEXT-SESSION-PROMPT.md` is archived and either replaced with a post-handoff
      maintenance stub OR marked "completed" if nothing more is planned

**The site is in great shape. Restraint over flash. Slow over fast. Additive over replacement.**
