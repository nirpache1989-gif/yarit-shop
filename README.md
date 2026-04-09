# Shoresh — שורש

A bilingual Hebrew/English natural wellness e-commerce site, built for Yarit (a Forever Living authorized distributor) and her selection of other natural products.

## Stack

- **Next.js 16.2.3** (App Router, TypeScript)
- **Tailwind CSS v4** (CSS-first theme in `src/app/globals.css`)
- **Payload CMS 3.82.1** (embedded admin at `/admin`)
- **SQLite** for local dev, **Neon Postgres** for production
- **next-intl 4.9** — Hebrew default with RTL, English secondary
- **Heebo** + **Frank Ruhl Libre** fonts via `next/font/google`

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open:
- Storefront: http://localhost:3000
- Admin panel: http://localhost:3000/admin

## Project structure

See `CLAUDE.md` and `docs/ARCHITECTURE.md` for the full story. Quick map:

```
src/
├── app/
│   ├── (storefront)/[locale]/   ← bilingual storefront (Hebrew default)
│   └── (payload)/               ← Payload admin + REST/GraphQL API
├── collections/                  ← Payload collections (Users, Products, Orders...)
├── components/
│   ├── layout/                   ← Header, Footer, MobileMenu
│   └── (more added in Phase C)
├── lib/
│   └── i18n/                     ← next-intl config + locale-aware Link
├── messages/                     ← he.json (primary), en.json
├── brand.config.ts               ← single source of truth for brand data
└── payload.config.ts             ← Payload CMS config

scripts/
└── process-logo.py               ← rembg background removal for logo

docs/
├── ARCHITECTURE.md
├── STATE.md                      ← current progress (updated each session)
├── TASKS.md
├── DECISIONS.md                  ← ADRs
├── CONVENTIONS.md
├── ENVIRONMENT.md
├── FULFILLMENT.md                ← Forever order workflow
└── BRAND.md
```

## For AI assistants

`CLAUDE.md` at the repo root is the entry point for any AI session. Read it first.

## Scripts

- `npm run dev` — Next.js dev server (webpack in dev)
- `npm run build` — production bundle
- `npm run start` — serve production bundle
- `npm run lint` — ESLint
- `python scripts/process-logo.py` — one-time: strip background from the source logo (requires `pip install rembg pillow`)
