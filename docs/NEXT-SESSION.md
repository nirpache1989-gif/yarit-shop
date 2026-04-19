# Next session — read this first

> **Audience:** Whoever opens this repo next, human or AI. This is the
> 5-minute orientation. After this, read `CLAUDE.md`, then
> `docs/NEXT-SESSION-PROMPT.md` for the full session brief.
>
> **Last updated:** 2026-04-19, end of **session 20 (Living Garden Phase 3 — Home page rebuild)**.

---

## Where we are right now

- **Session 20 just finished.** Home page (`/` = `/{locale}`) rebuilt end-to-end in Living Garden style. Six new `*LivingGarden.tsx` section components (Hero, FeaturedProducts, CategoryGarden, StoryStrip, Ingredients, Testimonials) + a new `ProductCardLivingGarden`. Branch `feat/living-garden` carries Phase 1 + 2 + 3 cumulatively, ~21 commits ahead of `main`. All quality gates green. Merged into `main` at end of session per user direction.
- **Prod unchanged** pending an explicit `deploy` word from the user. Prod is still serving commit `d7a68bf` with the dark-mode-disabled + admin P0 fix.
- **Transition state.** **Home is Living Garden; every other storefront page is still Night Apothecary.** `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/about`, `/contact`, `/account`, `/legal/*` still import the old `Hero`, `FeaturedProducts`, `CategoryGrid`, `MeetYarit`, `Testimonials`, `BranchDivider`, `ProductCard` components. Those files stay on disk on purpose — they're deleted as each page migrates in sessions 21–27.

## What's next — session 21

**Shop page (`/shop`) rebuild in Living Garden.** 3-column grid + sidebar filters (category / price / availability) + pagination. Reuses `ProductCardLivingGarden` shipped in session 20 as the grid tile. See `docs/NEXT-SESSION-PROMPT.md` for the full brief.

Rough forecast for the rest of the redesign:

| # | Page | Notes |
|---|---|---|
| 21 | `/shop` | 3-col grid + sidebar filters + pagination. Reuse `ProductCardLivingGarden`. |
| 22 | `/product/[slug]` | Gallery + variant pills + tabs + PDP meta grid. **Phase 3.5: adds `plate` / `specimen` / `badge` fields to Products.** |
| 23 | `/cart` | 2-col grid + gift-note block + promo code. |
| 24 | `/checkout` | Step pills + 3 paper blocks + hand-wrap callout. |
| 25 | `/about` | Page-title + hero visual + timeline + values rail + CTA. |
| 26 | `/contact` + `/account` | Short pages bundled. |
| 27 | `/journal` + `/journal/[slug]` | **Phase 3.5: new Payload `Posts` collection.** |
| 28 | Phase 4 polish | Real audio file, real photography, a11y audit, final responsive sweep. |

## Project at a glance

| | |
|---|---|
| **Owner** | Yarit, 65-year-old non-technical Hebrew-speaking merchant |
| **Stack** | Next.js 16.2.3 + Tailwind v4 + Payload CMS 3.82 + SQLite (dev) / Neon Postgres (prod) + next-intl 4.9 + Vercel |
| **Locales** | Hebrew (default, RTL) + English (LTR) |
| **Prod URL** | `https://yarit-shop.vercel.app` (last-known-good commit: `d7a68bf`) |
| **Prod admin** | `https://yarit-shop.vercel.app/admin/login` |
| **Dev server** | `npm run dev` → autoport via `.claude/launch.json` (3000 or first free) |
| **Dev admin bootstrap** | `POST /api/dev/create-admin` creates `admin@shoresh.example` / `admin1234` |
| **Dev DB** | `./shoresh-dev.db` SQLite (DATABASE_URI commented in `.env.local`) |
| **Design reference** | `docs/DESIGN-LIVING-GARDEN.md` + `New/handoff/design/LivingGarden/*.html` |

## Critical read-me-first

1. **Every admin provider must accept and render `{children}`** or the entire admin panel below it disappears. See the comment block at the top of `src/components/admin/payload/AdminThemeInit.tsx`.
2. **`importMap.js` regenerates on `npm run build`.** After every build, run `git diff src/app/(payload)/admin/importMap.js` — if the `VercelBlobClientUploadHandler` line is gone, restore with `git checkout HEAD -- "src/app/(payload)/admin/importMap.js"`. Prior P0 regression hard-learned.
3. **Dark mode is disabled** (2026-04-18). All dark-mode CSS still lives in `globals.css` + `admin-brand.css` — reversible by restoring 4 files from git history.
4. **Living Garden design is additive.** `--color-*` Night Apothecary tokens stay wired for all pages that haven't been rebuilt yet. `--g-*` Living Garden tokens are live but only consumed by chrome. Page rebuilds migrate content from one palette to the other.
5. **Never push or deploy without explicit user word** (`push` for `git push`, `deploy` for `npx vercel --prod`).

## Quality gates — must all be green before ending any session

```bash
cd "C:/AI/YaritShop/yarit-shop"
npx tsc --noEmit          # expect 0 errors
npm run lint              # expect 0 errors, 0 warnings (2 pre-existing prototype-file warnings are OK)
npm run build             # expect 43 routes compiled
git diff "src/app/(payload)/admin/importMap.js"     # expect empty; if not, restore
```

## Where to find things

| Question | File |
|---|---|
| What to do in the next session? | [`NEXT-SESSION-PROMPT.md`](NEXT-SESSION-PROMPT.md) |
| How is the project structured? | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Where does code X live? | [`CODEMAP.md`](CODEMAP.md) |
| How should AI collaborate on this project? | [`AI-COLLABORATION.md`](AI-COLLABORATION.md) |
| Code style + conventions | [`CONVENTIONS.md`](CONVENTIONS.md) |
| Why was X built this way? | [`DECISIONS.md`](DECISIONS.md) |
| Current phase + changelog | [`STATE.md`](STATE.md) |
| Open todos + blocked items | [`TASKS.md`](TASKS.md) |
| Env vars + local setup | [`ENVIRONMENT.md`](ENVIRONMENT.md) |
| Full doc index | [`INDEX.md`](INDEX.md) |
| Session prompt archive | [`sessions/README.md`](sessions/README.md) |
| Living Garden design reference | [`DESIGN-LIVING-GARDEN.md`](DESIGN-LIVING-GARDEN.md) |

## Still to land before true launch

These are external dependencies on Yarit / legal / vendors, not code work:

- [ ] Meshulam payment gateway credentials (sandbox + prod)
- [ ] Resend API key for transactional emails
- [ ] Legal markdown × 8 files (privacy / returns / shipping / terms × HE + EN)
- [ ] Final catalog copy from Yarit (current descriptions are drafts)
- [ ] Custom domain swap from `yarit-shop.vercel.app` to a Yarit-chosen domain
- [ ] Production DB catalog sync (prod Neon still holds pre-rename products)

All tracked in `docs/TASKS.md` and `docs/NIR-HANDOFF.md`.
