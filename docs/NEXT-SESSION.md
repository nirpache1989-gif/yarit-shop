# Next session — read this first

> This document is the fastest possible orientation for whoever opens the project next, human or AI. Read this, then `CLAUDE.md`, then `docs/STATE.md`. You'll be productive in 5 minutes.

## Where things stand (2026-04-10, end of session)

**Status:** 🚀 Phases A–E + design polish are **complete and deployed to production**.

- **Production URL:** https://yarit-shop.vercel.app (live, all routes respond 200)
- **Admin:** https://yarit-shop.vercel.app/admin (`admin@shoresh.example` / `admin1234` — rotate password first thing)
- **Fulfillment Dashboard:** https://yarit-shop.vercel.app/fulfillment (admin-only)
- **GitHub:** https://github.com/nirpache1989-gif/yarit-shop (public, 3 commits authored by Nir Pace)
- **Database:** Neon Postgres, Frankfurt region, seeded with 10 products + 5 categories + site settings
- **Local dev:** still works — SQLite via `DATABASE_URI=file:./shoresh-dev.db` in `.env.local`, OR point at the Neon URL for production-parity dev

## ⚠️ Known issues that need fixing first thing

### 1. Product images are empty white boxes on production (5 min fix)

**Why:** The seed ran against Neon locally with `BLOB_READ_WRITE_TOKEN` unset, so the 8 Forever product photos went to the local `./media/` folder (which doesn't exist on Vercel). The Media records in Neon point at `/api/media/file/...` URLs that return 404 in production.

**Fix (follow these exact steps):**

1. Open https://vercel.com/nirpache1989-gifs-projects/yarit-shop/stores
2. Click **Create** → **Blob** → name it `shoresh-media` → **Create**
3. When prompted "Connect to project", say yes. Vercel auto-injects `BLOB_READ_WRITE_TOKEN` into the project's production env vars.
4. Pull the new env vars to your local `.env.local`:
   ```bash
   cd yarit-shop
   npx vercel env pull .env.local.vercel
   ```
   (This creates a new file. Merge the `BLOB_READ_WRITE_TOKEN` line into your real `.env.local`.)
5. Delete the broken Media records from Neon. The fastest way: open `/admin/collections/media` in production, select all, delete. Or use the Payload REST API:
   ```bash
   # first log in to /admin to get a cookie, then delete each media id
   ```
   Easier: just wipe + re-seed everything. Temporarily flip your local `.env.local` DATABASE_URI to the Neon URL, delete `shoresh-dev.db*` (harmless), run the dev server, and:
   ```bash
   # wipe existing records via a new dev endpoint (to write), or manually via the admin UI
   ```
6. Re-seed with the Blob token set. `BLOB_READ_WRITE_TOKEN` + `DATABASE_URI=postgres://...neon...` both in `.env.local`, then:
   ```bash
   npm run dev
   # in another terminal:
   curl -X POST http://localhost:3000/api/dev/seed
   ```
   This time the seed uploads go to Vercel Blob, and the Media records in Neon point at `https://<hash>.public.blob.vercel-storage.com/...` URLs that work from production.
7. Visit https://yarit-shop.vercel.app/ and verify product cards now show images.

### 2. Rotate the Neon DB password

The password `npg_P1DUc9hvXItk` was pasted in chat during the deploy conversation. Best practice:
1. Go to https://console.neon.tech → your project → Settings → Reset password
2. Copy the new connection string
3. Update the Vercel env var:
   ```bash
   cd yarit-shop
   # remove old
   printf 'yes' | npx vercel env rm DATABASE_URI production
   # add new
   printf 'postgresql://NEW_PASSWORD_HERE@...' | npx vercel env add DATABASE_URI production
   # trigger a redeploy so the new value takes effect
   npx vercel --prod
   ```
4. Also update your local `.env.local` with the new password.

Not urgent — it's a dev-stage secret, but good hygiene.

### 3. (Minor) Middleware `proxy.ts` rename deprecation warning

Next 16 has been nagging: "The `middleware` file convention is deprecated. Please use `proxy` instead." The site works — this is cosmetic. Fix when you have 5 minutes: rename `src/middleware.ts` → `src/proxy.ts` and update any `next/link` imports inside. Tracked in `docs/TASKS.md`.

## What's done (so you don't redo any of it)

**Phases A–E (all 5 implementation phases):** scaffolding, Payload collections + seed, storefront (homepage + shop + product + cart), checkout + payments with mock providers, admin panel + Hebrew UI + fulfillment dashboard. See `docs/STATE.md` for the per-phase changelog.

**Design polish:** BranchDivider + SectionHeading primitives, MeetYarit + Testimonials new sections, corner sprigs + hover lifts + serif prices on ProductCard, nav link animated underlines, hero fade-up keyframes, paper grain overlay. See `docs/DECISIONS.md` ADR-010.

**Infrastructure:** Neon Postgres for prod DB (via env-based adapter selection in `src/payload.config.ts`), Vercel Blob plugin wired conditionally, `vercel.json` locks framework to nextjs, public GitHub repo, deployed to Vercel, 3 env vars set (PAYLOAD_SECRET, DATABASE_URI, NEXT_PUBLIC_SITE_URL). See `docs/DECISIONS.md` ADR-014.

**AI handoff hygiene:** CLAUDE.md + 9 docs files (this one, STATE, TASKS, ARCHITECTURE, DECISIONS with 14 ADRs, CONVENTIONS, ENVIRONMENT, FULFILLMENT, BRAND). Phase H (final organization pass for AI handoff) is in the plan file and will run at the very end.

## What to do next (your options)

### Option A — Fix the production images + call it a milestone
1. Fix the image issue (section above, 5 min)
2. Take screenshots of the live site for your own record
3. Send the URL to Yarit for first feedback
4. Start **Phase F** in a new session (customer account + SEO + responsive QA)

### Option B — Continue to Phase F immediately
Phase F items that matter most:
- `/account` + `/account/orders/[id]` for customers to see their order history
- Full he↔en string coverage audit
- Per-page SEO meta + `sitemap.xml` + `robots.txt` + Product structured data
- Responsive QA (iPhone SE, iPad, desktop 1440) in both RTL and LTR
- Switch middleware.ts → proxy.ts (Next 16 convention)
- Custom domain once one is picked and purchased

### Option C — Replace the placeholder brand name
Shoresh is a placeholder. If the final brand name is picked:
1. Edit `src/brand.config.ts` → change `brand.name.he` and `brand.name.en`
2. Replace `assets/Logomain1.jpg` with the new logo
3. Re-run `python scripts/process-logo.py` (requires `pip install rembg pillow`)
4. Commit + push — Vercel auto-deploys
5. Optionally rename the GitHub repo + the Vercel project

Everything else (docs, i18n keys, etc.) already uses the `brand` import, so a name change propagates automatically.

## Critical files to know about

| File | Purpose |
|---|---|
| `CLAUDE.md` | AI entry point — always read first |
| `docs/STATE.md` | Per-session progress log |
| `docs/TASKS.md` | Open items by phase |
| `docs/DECISIONS.md` | 14 ADRs explaining the non-obvious choices |
| `docs/ENVIRONMENT.md` | Env vars + Neon + Vercel Blob setup recipes |
| `docs/ARCHITECTURE.md` | System diagram + data model + flow descriptions |
| `docs/FULFILLMENT.md` | The Forever order state machine explained |
| `docs/BRAND.md` | Colors, fonts, logo rules |
| `src/brand.config.ts` | SINGLE source of truth for brand data |
| `src/payload.config.ts` | Payload root config + DB adapter branching + Blob plugin |
| `src/lib/seed.ts` | The one-shot seed logic called by `/api/dev/seed` |
| `~/.claude/plans/glimmering-scribbling-pudding.md` | The master plan file with all 8 phases (A–H) |

## Don't do these things

- **Don't commit `.env.local`** or anything with real secrets. The `.gitignore` is audited but always double-check `git status` before committing.
- **Don't run `/api/dev/*` endpoints in production.** They're gated on `NODE_ENV !== 'production'` and return 403 otherwise, but the gate only works if `NODE_ENV` is set correctly by Vercel (it is, by default).
- **Don't drop the Neon database** without re-seeding — the site crashes on `/admin` without a user.
- **Don't push to main without typechecking first** (`node node_modules/typescript/bin/tsc --noEmit`).
- **Don't edit `src/app/(payload)/admin/importMap.js` by hand** — Payload regenerates it on dev boot.

## Contacts / access

- **GitHub:** `gh` CLI is authenticated as `nirpache1989-gif`
- **Vercel:** `npx vercel whoami` → `nirpache1989-gif`, project linked at `nirpache1989-gifs-projects/yarit-shop`
- **Neon:** console at https://console.neon.tech, project in EU Central
- **Admin login (temporary):** `admin@shoresh.example` / `admin1234` — CHANGE FIRST THING

---

Good luck. Everything needed to pick this up is documented. 🌿
