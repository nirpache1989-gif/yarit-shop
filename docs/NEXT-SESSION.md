# Next session — read this first

> **Audience:** Whoever opens this repo next, human or AI. This is the
> 5-minute orientation. After this, read `CLAUDE.md`, then
> `docs/NEXT-SESSION-PROMPT.md` for the full session brief.
>
> **Last updated:** 2026-04-18, end of **session 19 (Living Garden Phase 1 remainder + Phase 2 Chrome)**.

---

## Where we are right now

- **Session 19 just finished.** Phase 1 remainder (`GardenAlive` + `RevealOnScroll` motion primitives) and Phase 2 Chrome (Header, Footer, MarqueeBanner, AmbientSoundPill, MobileNav polish) shipped on branch `feat/living-garden`. 13 commits ahead of `main`, all quality gates green, branch stays local until user says `push`.
- **Prod unchanged.** `https://yarit-shop.vercel.app` is still serving commit `d7a68bf` on `main` (dark mode disabled, admin P0 fix). Nothing new deployed.
- **Transition state.** Every storefront page wears the new chrome (header, footer, marquee, sound pill) but the `<main>` content still renders the old Night Apothecary design. Phase 3 pages — starting with Home — are the next 7 sessions' work.

## What's next — session 20

**Phase 3 begins.** Full Home page rebuild in the Living Garden style — hero, featured grid, category garden, story strip, ingredients rail, testimonials. All details + section-by-section slicing plan in `docs/NEXT-SESSION-PROMPT.md`.

The Home page is the biggest page and sets the template for the other 8 pages. Expect 8-9 bite-sized commits (one per section + wire-up + verification). If Home overflows session 20, it spills into session 21.

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
