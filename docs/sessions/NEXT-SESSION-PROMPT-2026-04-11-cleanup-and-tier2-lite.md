# Next session — starting prompt

> **Purpose:** You are (probably) the last session of the Shoresh project. The previous close-out session (2026-04-11 late) shipped everything from `e3a8a53` + `4ea4d90` to production, verified end-to-end, and left the project in a paste-and-go state waiting on Yarit. Your job is to pick up whatever is ready and walk the project the rest of the way.
>
> **Read this file top to bottom, then `CLAUDE.md`, then the "Latest (2026-04-11 late)" section of `docs/STATE.md`. Only then start working.** The previous close-out prompt is archived at `docs/NEXT-SESSION-PROMPT-2026-04-11-close-out.md` — it's historical now, you don't need it.

---

## Status as of 2026-04-11 late (what you inherit)

- **Production is LIVE** at `https://yarit-shop.vercel.app`. Latest deploy is `dpl_Asz72xL4FqWDPHacoe6khgSf5gXV` based on `4ea4d90` (main). Auto-deploy via GitHub webhook has been stalling intermittently since 2026-04-10 — if a new push doesn't pick up within 2–3 minutes, run `npx vercel --prod --yes` from `C:/AI/YaritShop/yarit-shop` to trigger a manual deploy. Project is already linked via `.vercel/project.json`.
- **All 16 smoke-test routes return 200 in prod**: `/`, `/en`, `/shop`, `/en/shop`, `/product/<any>`, `/en/product/<any>`, `/reset-password/<any>`, `/en/reset-password/<any>`, `/about`, `/en/about`, `/contact`, `/admin/login`, `/robots.txt`, `/sitemap.xml`. Product detail pages render the real Hebrew titles, `data-gallery-image` is live (T1.7 `ProductGalleryMotion`), `id="site-header"` is live (T1.5 header shrink observer).
- **The SSG/DYNAMIC_SERVER_USAGE incident is fixed** (see `docs/STATE.md` 2026-04-11 late). Three routes lost their incomplete `generateStaticParams` functions. **Do NOT re-add `generateStaticParams` returning only `{locale}` to any storefront page** — either return full params including the second segment, or omit the function entirely.
- **Quality gates on main**: `npx tsc --noEmit` → 0. `npm run lint` → 0 errors, 0 warnings. `npm run build` → 40 routes, all classified `ƒ` Dynamic or `○` Static, zero `●` SSG routes.
- **Motion state**: GSAP Tier-1 waves G1/G2/G3/T1.1/T1.2/T1.3/T1.4/T1.5/T1.6/T1.7 all shipped and verified in prod. Foundation files: `src/lib/motion/gsap.ts`, `src/lib/motion/useGsapReducedMotion.ts`, `src/components/motion/GsapScope.tsx`. Motion primitives (`Reveal`, `StaggeredReveal`, `KenBurns`, `SplitWords`, `CountUp`, `ConfettiTrigger`, `BranchDivider`) all exported and in active use.
- **Admin**: Yarit-friendly re-skin is shipped. Admin language pill is shipped. Do NOT touch `src/app/(payload)/*`, `src/components/admin/payload/*`, `src/collections/*`, `src/payload.config.ts` unless Yarit specifically asks for an admin change.

---

## What's still blocked on Yarit (external inputs)

These are the "paste-and-go" items. If Yarit has handed any of them over before this session starts, pick them up; otherwise skip.

### Track A.1 — Resend email credentials
- **Status**: adapter is paste-in-ready at `src/lib/email/resend.ts`. `.env.example` documents every variable.
- **When Yarit sends the API key**: she pastes four variables into Vercel → Project → Settings → Environment Variables (prod scope): `EMAIL_PROVIDER=resend`, `RESEND_API_KEY=...`, `EMAIL_FROM=shop@<verified-domain>`, `EMAIL_FROM_NAME=שורש`. Optional: `ADMIN_NOTIFICATION_EMAIL=yarit@...`. Trigger a redeploy from the Vercel dashboard (or `npx vercel --prod --yes --force`). Smoke test by placing a test order via the mock payment provider and confirming the order-confirmation email lands.
- **Caveat**: If Yarit hasn't verified a domain in Resend yet, first smoke test must use `onboarding@resend.dev` as the FROM. Domain verification adds DKIM/SPF records and is a one-time setup.

### Track A.2 — Meshulam payment credentials
- **Status**: provider scaffolding is paste-in-ready at `src/lib/payments/meshulam.ts`. Two `TODO(meshulam)` hotspots at lines 123 (createPayment body field names) and 193 (webhook signature handling) need to be reconciled against Yarit's actual Meshulam PDF before use.
- **When Yarit sends the PDF + sandbox credentials**: (1) reconcile the two TODOs with the exact field names / signature algorithm from the PDF, (2) paste sandbox env vars into `.env.local`: `PAYMENT_PROVIDER=meshulam`, `MESHULAM_API_KEY=...`, `MESHULAM_USER_ID=...`, `MESHULAM_PAGE_CODE=...`, `MESHULAM_WEBHOOK_SECRET=...`, `MESHULAM_BASE_URL=https://sandbox.meshulam.co.il/api/light/server/1.0`, (3) run a sandbox end-to-end test: create test order → walk the hosted payment page → confirm webhook lands → confirm order `paymentStatus` flips to `paid` → confirm the fulfillment dashboard surfaces it. If any step fails, STOP and report — do NOT flip to live mode. (4) Only after sandbox E2E is green, Yarit pastes the live `MESHULAM_BASE_URL=https://meshulam.co.il/api/light/server/1.0` + live credentials into Vercel env and redeploys. **Per `CLAUDE.md` rule 9**, the webhook signature check must be enforced even locally.

### Track A.3 — Legal markdown (terms / privacy / shipping / returns)
- **Status**: loader at `src/app/(storefront)/[locale]/legal/[slug]/page.tsx` reads from `content/legal/<slug>/<locale>.md`. Folders are scaffolded empty. `content/legal/README.md` documents the drop-in format. Footer links for legal pages are currently hidden (see the two comment blocks in `src/components/layout/Footer.tsx` at lines ~51–55 and ~74–77).
- **When Yarit's lawyer sends the files**: (1) drop `he.md` + `en.md` into each of `content/legal/{terms,privacy,shipping,returns}/`, (2) verify each renders at `/legal/<slug>` and `/en/legal/<slug>`, (3) re-add the four footer links in `Footer.tsx`. **IMPORTANT**: the live URL is `/legal/<slug>`, NOT `/policies/<slug>` — the Footer comments still say `/policies/*` which is stale. Use `/legal/*` when re-adding. Translation keys for the anchor text may or may not still be in `src/messages/{he,en}.json` — check before adding.

### Track A.4 — Custom domain
- **User action only**: (1) Yarit adds the domain in Vercel → Project → Settings → Domains, (2) updates DNS records at her registrar per Vercel's instructions, (3) waits for cert to issue, (4) updates `NEXT_PUBLIC_SITE_URL` in Vercel env to the new https origin + redeploys. Your side: once the new origin serves traffic, smoke test it the same way the 2026-04-11 late session smoke-tested `yarit-shop.vercel.app`. Confirm Payload admin login still works from the new origin.

### Track A.5 — Final product catalog copy
- **Yarit-only** via `/admin/collections/products`. No code action.

---

## What else the next session could do (pick based on what Yarit sends)

If Yarit doesn't have Track A items ready yet, or if they're all done quickly, here are the optional tracks in rough priority order. Ask the user which (if any) to tackle.

### Track B — GSAP Tier-2 expansion (additive only)

The Tier-1 waves landed on the high-impact surfaces (hero, featured products, shop filter, product gallery, header). Tier-2 candidates that would fit the editorial-botanical vocabulary without breaking the restraint rule:

1. **About page narrative scroll** (`src/app/(storefront)/[locale]/about/page.tsx`). Likely has zero GSAP right now. A subtle text-reveal timeline paired with `KenBurns` on any imagery would echo the Hero rhythm without feeling heavy. ~1 new component in `src/components/sections/AboutMotion.tsx`, wrapped by the existing server page.
2. **Cart drawer open/close timeline** (the customer-facing cart, not admin). Currently probably uses CSS transitions. A GSAP timeline would let the drawer slide + items stagger in with `power2.out` at ~600ms. Gate on `useGsapReducedMotion`. Verify `CartDrawer`'s existing focus trap + scroll lock are not disturbed.
3. **Checkout success confetti** — the `ConfettiTrigger` primitive already exists. Firing it once when the user lands on `/checkout/success` would close the loop on a successful purchase. Very light touch, reduced-motion-safe.
4. **Contact form focus micro-interactions** — subtle scale or underline pulse on focus. Again, additive only.
5. **Footer reveal on scroll** — if there isn't already one. Short fade + slight y translation, same rhythm as the existing `<Reveal>` primitive.

**Non-negotiable rules** (from `CLAUDE.md` + prior feedback):
- Durations 600–1400ms for single moves, 2–4s for orchestrated.
- Eases `power2.out` / `power3.out` / `expo.out` / `power1.inOut` only. No elastic / bounce / back.
- Tilt ceiling ±3–8°.
- Every motion uses `useGsapScope` with a `useGsapReducedMotion` check and `clearProps: 'all'` on reduced.
- Import gsap only from `@/lib/motion/gsap`, never raw.
- Customer-only; NEVER touch the admin (`(payload)` and `src/components/admin/payload/*`).
- Additive — don't remove any existing CSS keyframe, don't replace any existing `<Reveal>` / `<StaggeredReveal>` usage, don't touch the motion primitives exports.

### Track C — Code + docs cleanup sweep ⭐ IMPORTANT — do this even if no other track runs

This is the "leave no trace" pass. Even if Yarit hasn't sent any Track A items and there's no appetite for Tier-2, this track is always worth running, and the user explicitly flagged it as important. The goal is to hand the next maintainer (human or AI) a codebase + doc set that's internally consistent, free of stale cruft, and buildable from scratch without surprise.

Work in roughly this order:

**C.1 — Code cleanup**

1. **Read every file modified in the last 4–5 commits** (`git log --name-only -5`) and look for leftover debug code, commented-out blocks, stale `TODO` / `FIXME` / `TEMP BISECT` / `// REVERT BEFORE COMMIT` comments that were addressed but never removed, and `console.log` calls that shouldn't be in prod.
2. **Grep for debug markers across the whole tree**: search for `console.log`, `console.warn` (that aren't inside error handlers), `// TEMP`, `// DEBUG`, `// XXX`, `// HACK`, `// REMOVEME`. Triage each hit — either delete or convert to a proper comment explaining why the line exists.
3. **Hunt for unused imports / exports / files**. A clean approach: `npx knip` (install if needed — zero-config, reports unused files/exports/deps). Alternatively a manual sweep: `grep -r 'from .*SomeComponent' src/` for each suspect file. Be conservative — don't delete anything that's imported dynamically or used by Payload's admin bundle indirectly.
4. **Stricter type check**: run `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` once. It will complain about things the default config skips. Fix what's real, ignore what's intentional.
5. **`npm run lint -- --fix`** and review the diff before committing. Most likely it's whitespace / import ordering.
6. **Check for OS cruft in git**: `.DS_Store`, `Thumbs.db`, `*.swp`, `.idea/`, `.vscode/*.json` that shouldn't be tracked. `git ls-files | grep -E '(\.DS_Store|Thumbs\.db|\.swp$)'`. If any exist, gitignore + remove from tracking.
7. **Dependency audit**: `npx depcheck` to find declared-but-unused deps in `package.json`. Be careful — some peer deps show as unused but are actually required by `next` or `payload`.
8. **Secrets sweep**: `git grep -E '(sk_|pk_|key[_-]?[a-z0-9]{16,})'` — confirm no hardcoded API keys slipped in. Should be clean given the Track A adapters are all paste-in stubs, but verify.

**C.2 — Docs audit**

Read **every single file** in `docs/` and make sure it reflects reality as of the session you're in. The full inventory (as of 2026-04-11 late):
- `docs/STATE.md` — the changelog. Confirm the newest entry at the top is yours, earlier entries aren't contradicted.
- `docs/CLAUDE.md` at the project root (not the agent-global one at `C:\Users\Ar1ma\.claude\`) — entry point, "where to find things" table, critical rules.
- `docs/ARCHITECTURE.md` — high-level architecture. Any new modules or removed ones need reflecting.
- `docs/BRAND.md` — colors, fonts, logo rules. Check against `src/brand.config.ts` and `globals.css @theme` block for drift.
- `docs/CONVENTIONS.md` — code style + naming + file layout. **Add a rule forbidding partial `generateStaticParams` returning only `{locale}` after the 2026-04-11 SSG incident if it's not already there.**
- `docs/DECISIONS.md` — ADRs. Check sequential numbering (no gaps), confirm no ADR is outdated or superseded without a "SUPERSEDED BY ADR-XX" note.
- `docs/ENVIRONMENT.md` — local setup guide. Run through it from a cold clone perspective — does it still work end-to-end?
- `docs/FULFILLMENT.md` — Forever fulfillment workflow. Check against the current `Orders` collection + OrderRow state machine.
- `docs/INDEX.md` — table of contents. Must list every file in `docs/`. Update if you add or remove any.
- `docs/ONBOARDING.md` — fresh-clone setup. Same as ENVIRONMENT.md but from an engineer's perspective. Check commands.
- `docs/TASKS.md` — open tasks. Prune anything already done. Add anything discovered during the session.
- `docs/YARIT-ADMIN-GUIDE.md` — the Hebrew guide for Yarit herself. This is the one Yarit actually reads. Most important doc for the "final handoff" use case. Read every sentence, fix typos, confirm every screenshot / instruction still matches the current admin UI.
- `docs/ADMIN-SURFACES.md` — map of every admin surface. Confirm it matches `src/payload.config.ts` + the shipped admin views.
- `docs/NEXT-SESSION.md` — the 5-min orientation. Update the TL;DR to reflect current state. Don't rewrite wholesale.
- `docs/NEXT-SESSION-PROMPT.md` (this file) — if another session is coming after this one, archive this file (`git mv` to `NEXT-SESSION-PROMPT-<date>.md`) and write a fresh one. If this IS the final session, mark it completed at the top the same way the 2026-04-11 close-out prompt was marked (banner + historical content preserved).
- `docs/NEXT-SESSION-PROMPT-2026-04-11-close-out.md` — historical, don't touch.
- `docs/NEXT-SESSION-GSAP-PROMPT.md` — old GSAP Tier-1 roadmap. All waves marked shipped. Don't delete — historical reference for the vocabulary.
- `docs/round-4-*` directories — intermediate working notes. If they're no longer useful, consider archiving or deleting, but only after checking with the user.

For each file, ask:
1. Is any content stale or contradicted by the current codebase?
2. Are there any broken internal links (`[text](docs/...)` pointing at renamed or removed files)?
3. Are there references to specific commits, dates, or deploys that should be updated? (e.g. mentions of "2026-04-10 build" when we're now on `4ea4d90`.)
4. Are there typos or unclear sentences?
5. Does the file still serve a useful purpose, or should it be archived?

**C.3 — Runtime warnings sweep** (partly covered by the original "QA + polish" list — none are blockers, but now's a good time to clean them up)

1. **Vercel auto-deploy webhook is stalled.** Every push in the close-out session fell back to `npx vercel --prod --yes` manually. Worth investigating the webhook settings in the Vercel dashboard → Git Integration, or re-linking the repo. Not urgent but annoying.
2. **`middleware` → `proxy` deprecation warning** at build time. Tracked in `docs/DECISIONS.md` ADR-005. A clean rename would silence the warning but requires touching the middleware entry point. Low risk if Next docs are followed exactly.
3. **Turbopack NFT warning on `src/lib/legal.ts`** — the legal loader reads from the filesystem, which causes Turbopack to trace the whole project. Non-blocking. A targeted `/*turbopackIgnore: true*/` comment on the filesystem call site silences it.
4. **Payload media storage adapter warning** on Vercel builds — the `media` collection has uploads enabled but no Vercel Blob adapter is wired. Currently the catalog ships static files in `public/brand/ai/` via `STATIC_IMAGE_OVERRIDES` in `src/lib/product-image.ts`, so uploads to `/admin/collections/media` would fail on prod. If Yarit ever needs to upload new images via the admin, wire up `@payloadcms/storage-vercel-blob` (see ADR-017 for the decision record + the current workaround).
5. **pg-connection-string SSL mode deprecation** (Neon). Minor. A one-line env fix (`uselibpqcompat=true&sslmode=require` or `sslmode=verify-full`) silences the warning. Do in passing, not a whole session.
6. **Optional CI guard**: a simple grep rule in `.github/workflows/ci.yml` that fails the build if any `generateStaticParams` returns only `{locale}` without a second param. Prevents regression of the 2026-04-11 SSG incident. 5-line shell one-liner.

**C.4 — Final verification**

1. `npx tsc --noEmit` → 0 errors.
2. `npm run lint` → 0 errors, warning count matches expectation (3 stub-file warnings until Track A.1/A.2 are wired).
3. `npm run build` → 40 routes, all `ƒ` Dynamic or `○` Static, zero `●` SSG, build completes clean.
4. Local prod smoke test: `npx next start -p 3009` (or any free port) → curl all 16 routes from the 2026-04-11 late smoke test, all 200 (307 on `/account/orders/abc` is the auth redirect, expected).
5. `git status` clean before committing.
6. Commit the cleanup sweep as `chore: code + docs cleanup pass` or similar. One commit if tight; two commits (`chore(code): ...` + `chore(docs): ...`) if the changes are substantial. Ask the user before pushing.

### Track D — End the work (final handoff)

If Yarit doesn't send any Track A items and there's no appetite for Tier-2 / polish, the cleanest way to close the project is:

1. **Verify `docs/YARIT-ADMIN-GUIDE.md`** is complete and readable by a non-technical user. Read through it, fix any typos or stale references, make sure every collection and common task is covered.
2. **Walk through `docs/STATE.md`** one more time and ensure the timeline reads cleanly end-to-end.
3. **Write Yarit a short "your shop is live" note** (in Hebrew, since that's her primary language) — what URL to bookmark, how to log into the admin, what she can edit (product catalog, site settings), what she can't (legal pages, until her lawyer sends the markdown), and what to do when her Meshulam account is ready.
4. **Tell the user (Nir) what to say to Yarit, when to say it, and what the "done" state looks like.**

Track D can be as short as a 30-minute session. It ends the project cleanly.

---

## Non-negotiable rules (same as every session)

1. **Never push without explicit user word.** Both `git push` calls in this session will be gated on the user saying "push" or equivalent.
2. **No admin panel aesthetic changes.** `src/app/(payload)/*`, `src/components/admin/payload/*`, `src/collections/*`, `src/payload.config.ts` are read-only unless Yarit specifically asks for a change.
3. **Motion is additive only.** Don't remove existing keyframes, don't touch the motion primitives, don't break the editorial-botanical vocabulary. Durations + eases per the list above.
4. **`setRequestLocale` + `getTranslations` in every server page/layout that uses translations.** Next 16 + next-intl 4.9 is strict about this.
5. **`cookies()`, `headers()`, `draftMode()` are async.** `await` always.
6. **Never import `next/link` in storefront code.** Use `Link` from `@/lib/i18n/navigation` — the locale-aware version.
7. **Single GSAP entry point** — `@/lib/motion/gsap`, never raw `gsap/ScrollTrigger` or `gsap/Flip`.
8. **Server→client props are strings/numbers/booleans/JSX only.** No function props across the boundary.
9. **No Tailwind arbitrary-value classes in JSX comments or markdown files** — the v4 scanner picks them up and can 500 every page at build time. Describe class patterns in prose.
10. **Hebrew + English bilingual strings always go through `src/messages/{he,en}.json`.**
11. **Do NOT re-add `generateStaticParams` returning only `{locale}` to any storefront page.** This is the 2026-04-11 late incident in permanent form. Either return full params (locale × slug/token/id) or omit the function.

---

## Working directory + quality gates

```
cd C:/AI/YaritShop/yarit-shop
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0 (0 errors; 3 warnings are intentional stub files until Track A.1/A.2 are wired)
npm run build           # must exit 0, all 40 routes
```

Dev server: `npm run dev` → http://localhost:3000. **Warning**: `npm run dev` does NOT exercise SSG behavior — if you need to reproduce a production-only issue, use `npm run build && npx next start -p <free-port>` instead. The 2026-04-11 SSG incident was latent for weeks because nobody ran a prod build locally.

Preview MCP: if you use `preview_start` from `.claude/launch.json`, note that Preview MCP's Chrome does NOT emit native `scroll` events on programmatic `window.scrollTo(y)` — ScrollTrigger won't auto-update during preview-driven tests. Dispatch `window.dispatchEvent(new Event('scroll'))` manually if you need to verify scroll-triggered behavior in the preview.

---

## Definition of done for this session

Whatever track(s) you run, the session is done when:

- [ ] Any Track A items that came in are wired, verified on prod, and documented in `docs/STATE.md`.
- [ ] `tsc + lint + build` green after every code change.
- [ ] `git push origin main` only after explicit user word.
- [ ] Vercel auto-deploys OR you manually trigger `npx vercel --prod --yes`.
- [ ] Prod smoke test covers at minimum the 16 routes from the 2026-04-11 late session (see `docs/STATE.md`).
- [ ] `docs/STATE.md` has a new entry under "Latest (...)" describing what shipped.
- [ ] If this is the FINAL session: write a Hebrew-language "your shop is live" summary for Yarit in chat and archive this `NEXT-SESSION-PROMPT.md` the same way the 2026-04-11 close-out prompt was archived.

**Good luck. The site is in good shape. Restraint over flash. Slow over fast. Additive over replacement.**
