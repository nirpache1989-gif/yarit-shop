# Next session — Fix the prod admin (P0), then GSAP polish + final QA

> **Purpose:** The customer-facing Copaia site is fully working on prod and has been since launch. The Payload admin panel is broken on prod due to a Vercel + Payload 3.82 + Next 16 + React 19 streaming SSR bug that the previous session isolated but did not fix despite 7 deploy attempts. This session has ONE blocking job and then a longer polish queue.
>
> **Read first:** `CLAUDE.md`, then the **top entry of `docs/STATE.md`** ("Latest 2026-04-12 — Admin streaming SSR debug + middleware v4..."). The STATE.md entry has the full diagnosis, all 9 attempts that didn't work, and the prod admin password. Then come back here.
>
> The previous prompt is archived at `docs/NEXT-SESSION-PROMPT-2026-04-11-admin-fix-attempt.md` for historical reference. **Do not re-attempt anything in the "What I tried" table in STATE.md** — those paths are confirmed dead ends.

---

## The bug in 30 seconds

Every `/admin/*` route on prod ships ~110-120KB of HTML. With `<script>` tags stripped, only 3-5KB of body content remains:

```html
<body>
  <div hidden=""><!--$--><!--/$--></div>   ← empty React Suspense placeholder
  <style>...</style>
  <div class="payload__modal-container"></div>
  <section aria-label="Notifications">...</section>
  <div id="portal"></div>
</body>
```

The other 100KB is 22 `<script>self.__next_f.push([1, "..."])</script>` tags containing the FULL serialized RSC payload — Payload's nav, dashboard, collection list, all of it. The browser receives the data but `querySelector('.yarit-dashboard')` returns null after hydration completes.

Same code on local `next start -p 3009` renders the full admin shell + dashboard inline at SSR time. The differential is in how Vercel's serverless function wrapper handles React 19 streaming SSR responses for routes that emit Suspense placeholders.

## What we know is NOT the cause (don't waste time)

Confirmed in the previous session:
1. ❌ Our custom `YaritDashboard` view (removing it didn't help)
2. ❌ ANY of our `admin.components` customizations (graphics, providers, actions, beforeNavLinks, afterNavLinks — disabling all of them didn't help, vanilla Payload still blank)
3. ❌ Vercel function timeout (bumped `maxDuration` to 60s, no change)
4. ❌ Next 16 partial-prerender / static-shell behaviour (`dynamic = 'force-dynamic'` + `runtime = 'nodejs'` + `fetchCache = 'force-no-store'` + `revalidate = 0` didn't help)
5. ❌ Payload 3.82 specifically (downgraded entire stack to 3.81.0, same Suspense pattern, same blank result)
6. ❌ Missing `loading.tsx` (added one, the explicit fallback never even renders)
7. ❌ The middleware cookie path (v4 middleware verifies signatures correctly; cookie classification is fully working — the bug is downstream of any cookie state)

## What we know IS the case

- Server response IS the right bytes — curl with a forged-derived-key cookie containing a real session ID gets back ~167KB of HTML with all the Payload nav + collection list as live HTML elements (not just script tags). The serialized HTML the SERVER produces is correct.
- Browser receives the right bytes — `await fetch('/admin')` from inside a Chrome MCP tab returns the SAME 110KB response with all the data in script tags.
- React's CLIENT runtime is what fails — it receives the RSC payload chunks and never converts them into actual DOM elements that fill the empty Suspense placeholder.
- The bug only happens via **navigation** in a real browser (top-of-tab page load). Inline `fetch()` from JS gets the same response but the browser's React tree NEVER processes it into DOM.
- Local `next start` works perfectly with the SAME code, SAME Payload version, SAME React version. The differential is at the Vercel runtime layer.

## Suggested attack plan (in order)

### Phase 1 — Look for upstream prior art (5-10 min)

Before debugging from scratch, check if anyone else has hit this:

1. **Payload GitHub issues:** search `repo:payloadcms/payload "Suspense" "Vercel"` + `repo:payloadcms/payload "blank" "admin" "vercel"` + `repo:payloadcms/payload "3.82" "Next 16"`. Look for closed PRs after 2026-04-12 that touch `RootLayout` or `RootPage` or anything related to streaming.
2. **Vercel community:** search `site:vercel.community "empty Suspense" "Next 16"` + `"Payload" "Vercel" "blank admin"`.
3. **Next.js GitHub issues:** `repo:vercel/next.js "Suspense" "streaming" "Vercel" "16.2"` — Next 16.2 was a recent release.
4. **Payload Discord:** if access available, search `#bugs` for "Vercel admin blank" / "Suspense empty" between 2026-04-01 and now.

If you find an upstream issue with a workaround, USE IT. Skip the rest of this section.

### Phase 2 — Reproduce in a controlled minimal repo (15-20 min)

The fastest way to convince yourself (and Payload upstream) of the bug shape is to reproduce it in a fresh repo:

```bash
npx create-next-app@latest payload-vercel-bug --typescript --app
cd payload-vercel-bug
npx create-payload-app@latest -t blank
# Use the prod Neon connection string in .env.local (read-only schema is fine)
npm run dev
# verify it works
git push to a fresh GitHub repo
import to a new Vercel project
```

If the minimal repo ALSO ships an empty Suspense on Vercel: file an upstream bug with the Payload team + Vercel support, link both. Get a workaround from them.

If the minimal repo WORKS on Vercel: bisect what's different between it and our project. Suspect order:
- `next-intl/middleware` (we use it for the storefront — maybe it's interfering with admin streaming somehow even though our matcher excludes /admin)
- The custom `(payload)` route group naming
- Our `src/app/(payload)/layout.tsx` wrapper around Payload's `RootLayout`
- The custom `serverFunction` we pass to RootLayout
- The `htmlProps` we pass with `lang: 'he', dir: 'rtl'` and font variable classes

### Phase 3 — Targeted code probes (if Phase 2 inconclusive)

If the minimal repo also breaks AND there's no upstream issue:

1. **Set `experimental.serverActions: false`** in `next.config.ts` and rebuild. Server actions and React 19 streaming share infrastructure; turning them off may force a different render path.
2. **Try `output: 'standalone'`** in `next.config.ts`. This changes how the build artifact is structured and may bypass whatever Vercel wrapper logic is truncating the stream.
3. **Check Vercel function logs DURING a /admin request:** `npx vercel logs https://yarit-shop.vercel.app --since 5m --no-follow` after triggering a request. Look for any "stream closed" / "request aborted" / "function timeout" messages. The previous session's logs were empty for the relevant time window (only had build logs and storefront image errors), but a fresh trigger may surface something.
4. **Check Vercel deployment runtime details:** `npx vercel inspect <deployment-url>` and look at function runtime, region, CPU limits. The current deployment is in `fra1::iad1` (Frankfurt → IAD). Maybe the cross-region routing is what's truncating responses.
5. **Try `NODE_OPTIONS="--enable-source-maps"`** in Vercel env to get better stack traces if any error fires server-side.

### Phase 4 — If all else fails: switch admin to a non-streaming render

**Last resort — gives up some Payload features but unblocks the user:**

Replace the Payload admin route entirely with a custom server-rendered page that:
- Uses Payload's server-side API (`getPayload({ config })`) to fetch collection data
- Renders static HTML for each collection's list view
- Implements basic CRUD via direct form posts to `/api/users/login`, `/api/products`, etc.
- Provides a logout link that POSTs to `/api/users/logout`

This is ~200 lines of code and ships a barebones admin that bypasses Payload's streaming render entirely. Yarit wouldn't get the full Payload UX (no live preview, no rich text editor, no nice tables) but she could create / edit / delete products and orders.

Only do this if Phases 1-3 are exhausted.

### Phase 5 — After admin renders correctly

Once a real browser shows the dashboard:

1. **Verify Yarit's full flow:** clear cookies → /admin/login → form → submit → /admin → dashboard renders → click into Products → click into a product → edit a field → save → confirm the change persists in prod Neon
2. **Reset the admin password to something Yarit knows.** Currently set to `CopaiaTemp2026!` (see STATE.md). Yarit / Nir picks the real password and updates the user via the admin UI.
3. **Re-enable `YaritDashboard` + `FulfillmentView` custom views** (commit `53c25cb` revert is in the e1599c8 batch — it's already re-enabled). Verify they render too.

---

## After admin fix: GSAP polish + QA pivot

The previous session was supposed to do these but the admin P0 ate the entire budget. Pick up where we left off.

### Track 1 — Full prod QA walkthrough (~30% of remaining time)

Walk every customer-facing route on prod with a careful eye:

- `/en` and `/` (Hebrew) homepages — hero entrance motion, TrustBar, MeetYarit, CategoryGrid pin, FeaturedProducts pin, Testimonials, BranchDividers, Footer
- `/en/shop` and `/shop` — 8 product cards static on first paint, filter chips, Flip on category change, Ken Burns on cards
- `/en/product/aloe-drink`, `/en/product/aloe-toothgel` — 3-image galleries, thumb Flip morph, JSON-LD `<Product image>` array shape
- `/en/cart` — empty state, add flow, quantity adjust, remove, press bounce
- `/en/checkout` — form, mock payment banner
- `/en/account` (after login)
- `/en/about`, `/en/contact` — long-form reveals + ContactBG1 backdrop @ 55%
- Mobile (375×812): no horizontal scroll, hamburger drawer slide-in, 2-col shop grid, touchable product gallery
- Tablet (768×1024): 3-col shop grid, mid-width hero
- Reduced motion: every entrance animation snaps to final state
- Dark mode: every route renders without contrast issues

Hygiene: 0 console errors, 0 500s, 0 404 images, `tsc + lint + build` green.

Document anything found in commit messages or `docs/STATE.md` follow-ups.

### Track 2 — 4 design refinements (~20%)

User picked these in the previous session — re-confirm before starting:

1. **Favicon refresh** (#9): generate `src/app/icon.png` (512×512) + `src/app/apple-icon.png` (180×180) from `public/brand/copaia.png` (the Copaia tree logo). Sharp is already a dep — use it from a one-shot script.
2. **OG / social share card** (#10): create `src/app/opengraph-image.tsx` using `next/og`'s `ImageResponse` (1200×630). Render the Copaia logo + `brand.tagline.he` + `brand.description.en` on `#F6EFDC` parchment with Heebo font.
3. **Footer conditional rendering** (#4): in `src/components/layout/Footer.tsx`, audit the contact rows that render `brand.contact.phone`, `brand.contact.whatsapp`, `brand.contact.address`. Use the existing `isPlaceholder()` helper from `src/lib/siteSettings.ts` and ALSO guard against empty strings. Don't render the `<li>` / `<div>` when value collapses to nothing.
4. **Admin chrome warmth** (#7): grep `src/app/(payload)/admin-brand.css` for `#[0-9a-fA-F]{3,8}` literals, replace any that match `brand.config.ts` colors with `var(--color-*)` tokens. Surgical pass — don't rewrite the file.

### Track 3 — 2 GSAP motion picks (~15%)

User picked these in the previous session — re-confirm before starting:

1. **Checkout success confetti** (#3): fire `fireConfetti('celebration')` from `src/lib/motion/confetti.ts` on the checkout success page mount. Find the success page (grep `src/app/(storefront)/[locale]/checkout/`), add a small `'use client'` component with `useEffect(() => { fireConfetti('celebration') }, [])`. Respect `prefers-reduced-motion: reduce`.
2. **Cart drawer item stagger** (#1): when items enter the cart drawer, stagger them in with 40ms delay + 12px y-offset. Find `src/components/cart/CartDrawer.tsx`, add a `useGSAP` effect that animates `.cart-line-item` from `{ y: 12, opacity: 0 }` to `{ y: 0, opacity: 1 }` with `stagger: 0.04, ease: 'power2.out', duration: 0.45`. Reduced-motion snaps to final state. Don't touch the existing add-to-cart press bounce on `AddToCartButton.tsx`.

**Non-negotiables for every new GSAP addition** (CLAUDE.md rule #12):
- `immediateRender: false + once: true + start: 'top bottom-=40'` on every new `gsap.from + scrollTrigger` (the cart drawer pick is mount-based so doesn't need scrollTrigger; checkout confetti has no GSAP at all)
- Single GSAP entry point: `import { gsap } from '@/lib/motion/gsap'`
- Additive only — never remove existing keyframes

---

## Non-negotiables (same every session)

1. **Never `git push origin main` without explicit user word** ("push")
2. **Never `npx vercel --prod --yes` without explicit user word** ("deploy")
3. **Motion is additive only** — never remove existing keyframes
4. **`setRequestLocale` + `await params` / `await searchParams`** in every server page/layout
5. **Never import `next/link` in storefront** — use `Link` from `@/lib/i18n/navigation`
6. **Single GSAP entry point** — `@/lib/motion/gsap`
7. **Brand data stays in `src/brand.config.ts`**
8. **Server → client props are serializable only** — no function props
9. **Hebrew + English strings through `src/messages/{he,en}.json`**
10. **Never re-add `generateStaticParams` returning only `{locale}`** — CI fails per ADR-018
11. **Every `gsap.from + scrollTrigger` gets `immediateRender: false + once: true + start: 'top bottom-=40'`** per CLAUDE.md rule #12
12. **Prod DB changes require explicit user approval**
13. **If you touch a Vercel env var, redeploy** — middleware bakes them at build time
14. **Don't push or deploy in a loop without confirming each one with the user** — the previous session pushed twice without re-asking and the user (correctly) called it out

---

## Working directory + quality gates

```bash
cd "C:/AI/YaritShop/yarit-shop"
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0, 0 errors 0 warnings
npm run build           # must exit 0, 40 routes ƒ/○, zero ● SSG
```

**Dev server:** `npm run dev` → `http://localhost:3000`. Hits `copaia-dev.db` (SQLite).

**Prod-mode local preview** for accurate motion + admin testing:
```bash
rm -rf .next
npm run build
# Use preview_start("yarit-shop admin-fix prod") via the Preview MCP
# OR npx next start -p 3009 manually
```

**Local admin dev creds:** `admin@copaia.example` / `admin1234` (see `docs/NIR-HANDOFF.md`).

**PROD admin creds (set this session, change on first login):**
- URL: `https://yarit-shop.vercel.app/admin/login`
- Email: `admin@shoresh.example`
- Password: `CopaiaTemp2026!`

---

## Definition of done

- [ ] Prod `/admin/*` renders the dashboard / collections / etc. in a real browser (not just curl)
- [ ] Yarit can clear cookies → log in → see her real product catalog → edit a product → save → confirm in prod Neon
- [ ] Admin password rotated from the temp value
- [ ] Track 1 QA walked + every issue either fixed or filed as a follow-up
- [ ] Track 2 — 4 design refinements shipped, each verified on prod preview
- [ ] Track 3 — 2 GSAP motion additions shipped under the bug-fix pattern
- [ ] All quality gates green
- [ ] `git push origin main` only after explicit user word, deploy only after explicit user word
- [ ] `docs/STATE.md` has a new "Latest" entry describing this session
- [ ] Archive this prompt → `docs/NEXT-SESSION-PROMPT-<date>-admin-fix-and-polish.md` and write a short successor

---

## Quick-start cheatsheet

First 5 minutes:

```bash
# 1. Confirm baseline
git log -1 --oneline           # should show e1599c8
git status                      # should be clean
git checkout -b feat/admin-streaming-fix-and-polish

# 2. Probe the prod admin scenario one more time
curl -sS -c _cj -H "Content-Type: application/json" \
  -d '{"email":"admin@shoresh.example","password":"CopaiaTemp2026!"}' \
  https://yarit-shop.vercel.app/api/users/login

curl -sS -b _cj -o _admin.html -w "len=%{size_download}\n" \
  https://yarit-shop.vercel.app/admin

# Strip script tags and look at what's actually rendered
python -c "
import re
html = open('_admin.html', encoding='utf-8').read()
no_scripts = re.sub(r'<script[^>]*>[\s\S]*?</script>', '', html, flags=re.DOTALL)
print('rendered HTML len:', len(no_scripts))
print('first 1500 chars:', no_scripts[no_scripts.find('<body'):no_scripts.find('<body')+1500])
"
rm _cj _admin.html
```

Expected: rendered HTML ~3-5KB, body contains only providers + empty Suspense + portal divs. Same as session-end. If anything changed, re-read STATE.md to see if the bug shape moved.

---

**The customer-facing Copaia site is live and working. Yarit cannot use her admin panel until this is fixed. Restraint over flash. Slow over fast. Additive over replacement.**
