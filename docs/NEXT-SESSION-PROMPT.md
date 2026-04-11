# Next session — Copaia prod catalog sync + residual QA + external inputs as they land

> **Purpose:** The heavy lifting is done. The 2026-04-11 "Copaia brand rename + final QA" session shipped Tracks A + D + B + F on a feature branch (`feat/brand-rename`) and left Tracks C + E + G as follow-ups. This prompt is short on purpose — everything you need is in `docs/STATE.md` top entry, `docs/DECISIONS.md` ADR-020, and `docs/NIR-HANDOFF.md`.
>
> **Read first:** `CLAUDE.md`, then the top of `docs/STATE.md` ("Latest (2026-04-11 very late)"), then `docs/NIR-HANDOFF.md`. Then come back here.

---

## Inherited state

- **`feat/brand-rename`** is 5 commits ahead of `main` (`a3b767d`):
  - `1ae5a73` — hero backdrop swap to `herobg3.jpg` @ 85% + featured backdrop swap to `recommendedBG.jpg` @ 14%
  - `fe8b97d` — Track B admin UX (thumbnail col, stock +/-, recent orders, live preview)
  - `20a9e2d` — Track D GSAP polish (sticky header scrub, card Ken Burns, add-to-cart press bounce)
  - `f489808` — Track A brand rename + catalog + 3-image gallery
- **Prod:** still at `8d50bd4` via `dpl_EFBBXQ1ZKxrDe2T7ZJTcQTBsJzui`. **No push or deploy happened** — waiting on explicit user word.
- **Prod Neon catalog:** still holds the old 7 Shoresh-era `sourced` products. The feature branch's dev DB has the new 8 Copaia products. **These need to be reconciled on prod.**
- **All quality gates green.** tsc + lint + build + preview smoke all verified.

---

## 🛟 SAFETY NET

Last known-good commit is `1ae5a73` on `feat/brand-rename` (or `8d50bd4` on prod). `main` is at `a3b767d`. **Do not push `main` and do not deploy without explicit user word.** If you make new edits, land them on `feat/brand-rename`, not `main`.

---

## Tasks in priority order

### 1. Push + deploy the feature branch (once user approves)

```bash
cd C:/AI/YaritShop/yarit-shop
git checkout main
git merge --ff-only feat/brand-rename
git push origin main
npx vercel --prod --yes
```

After the deploy, smoke-test prod:

- `https://yarit-shop.vercel.app/en` — new Copaia logo, header alt `"Copaia"`, no visible parchment rectangle, title `"Copaia — Rooted in wellness"`
- `https://yarit-shop.vercel.app/en/shop` — prod will still show the OLD 7 products because the Neon catalog hasn't been swapped yet (see task 2)
- `https://yarit-shop.vercel.app/admin` — the admin chrome is rebranded even before the catalog swap, because the brand config is baked into the bundle

### 2. Sync the prod Neon catalog to the new 8 products

Two options — pick with Yarit in the loop:

**Option A (recommended) — Manual rebuild via the admin.**

1. Have Yarit log into `/admin/collections/products`
2. For each of the 7 old products, click in, click "Delete" (red button)
3. Add 8 new products via `/admin/collections/products/create`, copying:
   - Title, slug, short description, long description from `src/lib/seed.ts` `SOURCED_PRODUCTS` array
   - Category (nutrition / skincare / aloe)
   - Price
   - Images (upload 2-3 each from `C:/AI/YaritShop/assets/`)
   - SKU (if Yarit knows the real Forever Living codes)
   - Mark `isFeatured` for `aloe-drink` + `aloe-toothgel` + `daily-multivitamin`

Total time: ~20 min of her time + 21 image uploads.

**Option B — One-off migration script.**

Like the 2026-04-11 Remove-Forever SQL migration (see STATE-ARCHIVE.md for the pattern). Write a Node script that uses Payload's local API + the prod `DATABASE_URI` pulled from Vercel. Upload the 18 media files from `C:/AI/YaritShop/assets/` via `payload.create({ collection: 'media', filePath })`, then upsert each of the 8 products via `payload.create({ collection: 'products', ... })` with the media IDs.

Riskier, faster. Recommend only if Yarit is busy.

### 3. Track C — External inputs (as they land)

**C.1 Resend email** — 4 env vars + a redeploy. Smoke test: hit `/api/checkout` mock flow → email should land in the configured inbox.

**C.2 Meshulam payment** — Yarit's PDF → reconcile the 2 `TODO(meshulam)` hotspots in `src/lib/payments/meshulam.ts` lines ~123 + ~193 → set 5 env vars → deploy → ₪1 sandbox E2E → live-flip.

**C.3 Legal markdown** — 8 files at `content/legal/{privacy,returns,shipping,terms}/{he,en}.md` when Yarit's lawyer sends them. Re-enable the 4 footer links in `src/components/layout/Footer.tsx` (TODO comments around lines ~51–55 and ~74–77). Smoke test each locale variant.

**C.4 Custom domain** — add in Vercel dashboard, configure DNS, wait for SSL, update `NEXT_PUBLIC_SITE_URL`, redeploy. Then update `CLAUDE.md` + the STATE.md "Latest" entry.

### 4. Track E — Residual QA (if skipped last session)

The full checkbox list lives in the archived prompt at `docs/NEXT-SESSION-PROMPT-2026-04-11-brand-rename-and-finalqa.md` under "Track E — Full QA pass". Walk it. Every red X is a bug to fix before the next push.

Known items to verify:

- **Storefront LTR + RTL** both locales, homepage + shop + product detail + cart + checkout + about + contact + account + legal (if content/legal is populated)
- **Admin:** login → dashboard → products list (thumbnail column ✓) → product edit (stock +/- when `stocked`) → fulfillment dashboard → orders → categories → site settings
- **Mobile 375×812:** no horizontal scroll, MobileNav opens from the right edge in RTL, cart drawer doesn't block the checkout button
- **Reduced motion:** emulate `prefers-reduced-motion: reduce` → every animation snaps to final state
- **Hygiene:** 0 console errors on every page, 0 network 500s, 0 404 images, `tsc + lint + build` all green

### 5. Track G — Cleanup (if skipped last session)

- **G.1 Drop unused devDeps:** `npm uninstall @swc-node/register @swc/core`. One-line commit.
- **G.4 Drop unused AI assets:** `public/brand/ai/hero-bg-2.png` is now unused after the herobg3 swap — delete it. The 2026-04-11 logo audit flagged a dozen other likely-unused files in `public/brand/ai/`; verify via `git grep` before deleting each one.
- **YARIT-ADMIN-GUIDE.md §2 + §3 rewrite** — the full rewrite of the Forever-era "handling orders" + "adding products" sections was deferred. A prominent banner was added at the top pointing at the admin HelpButton, but the body still needs updating.

### 6. Track F finishing touches

Most of Track F landed in the 2026-04-11 session. If you find anything that was cut short:

- The old YARIT-ADMIN-GUIDE.md sections (noted above) are the biggest item.
- `docs/NEXT-SESSION.md` got a TL;DR refresh but the deep-dive sections further down the file are still historical.

---

## Non-negotiables (same every session)

1. **Never push to main without explicit user word.** `git push origin main` + `npx vercel --prod --yes` both require the user saying "push" / "deploy".
2. **Motion is additive only.** Don't remove existing keyframes, don't touch motion primitives (except to add new additive direction/variant values).
3. **`setRequestLocale` + `getTranslations` in every server page/layout.**
4. **`cookies()`, `headers()`, `draftMode()` are async.**
5. **Never import `next/link` in storefront code.** Use `Link` from `@/lib/i18n/navigation`.
6. **Single GSAP entry point** — `@/lib/motion/gsap`.
7. **Brand data stays in `src/brand.config.ts`.** Every rename goes through there first.
8. **Every new `gsap.from + scrollTrigger` MUST include `immediateRender: false + once: true + start: 'top bottom-=40'`** — the 2026-04-11 bug-fix pattern. CLAUDE.md rule #12.
9. **Prod DB changes require explicit user approval AND a backup plan.** When you touch Neon, always: (a) inspect read-only first, (b) wrap writes in a transaction, (c) have rollback criteria ready.

---

## Working directory + quality gates

```bash
cd C:/AI/YaritShop/yarit-shop
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0, 0 errors 0 warnings
npm run build           # must exit 0, 40 routes ƒ/○, zero SSG
```

**Dev server** → `npm run dev` → http://localhost:3000. For prod-mode motion testing use `preview_start("yarit-shop-prod")` (which runs `npm --prefix yarit-shop run start -- -p 3009` after a build).

---

## Definition of done for this session

- [ ] User approved `feat/brand-rename` → `main` fast-forward merge → push → deploy
- [ ] Prod Neon catalog is in sync with the seed (8 Copaia products, 18 media docs)
- [ ] Any external inputs Yarit has landed (Meshulam / Resend / legal / domain) are wired up
- [ ] Track E QA walkthrough is checkboxed ✓ or every red X has a fix commit
- [ ] Track G cleanup items (at minimum: drop `@swc*` devDeps, delete `hero-bg-2.png`)
- [ ] `docs/STATE.md` has a new "Latest" entry describing this session's work
- [ ] If all tasks ship: archive THIS prompt → `docs/NEXT-SESSION-PROMPT-<date>-<short-name>.md` and write a new short successor.

The project is in a great place. The catalog swap is the only required action — everything else is polish or waits on Yarit.
