# Copaia — AI Agent Entry Point

> **This file is auto-loaded by Codex when any session opens this project.**
> It is the entry point for any AI assistant continuing work on Copaia.
> **Read `docs/NEXT-SESSION.md` FIRST** — it has the current status, known issues, and a 5-minute orientation. Then come back here, then `docs/STATE.md`, then `docs/TASKS.md`.
>
> 🚀 **Production is live at https://yarit-shop.vercel.app** (2026-04-10). Project renamed from "Shoresh" to "Copaia" on 2026-04-11.

---

## What Copaia is

**Copaia** (קופאה, ko-PA-eh) is a bilingual Hebrew/English e-commerce site for **Yarit**, a registered Forever Living distributor in Israel. The shop sells Forever Living products (primarily) and her own curated selection of other natural wellness products. Logo: tree with visible roots. Tagline: "שורשים של בריאות" / "Rooted in wellness".

- **Owner:** Yarit (Forever Living authorized distributor, non-technical)
- **Primary language:** Hebrew (RTL), with English as a secondary locale
- **Tech stack:** Next.js 16.2.3 + Tailwind CSS v4 + Payload CMS 3.82.1 + SQLite (dev) / Neon Postgres (prod) + next-intl 4.9
- **Deployment target:** Vercel (app) + Neon (production DB)
- **Current phase:** **A — Scaffolding, Brand, AI-Handoff Docs** (see `docs/STATE.md`)

## The business model (read this carefully — it drives data shape)

Yarit is the merchant of record for **every** sale. Money always lands in her bank account via an Israeli payment gateway (Meshulam is currently recommended but not locked in).

- **Forever products** — No local stock. When an order arrives, she buys the items from Forever at her distributor price, receives them at home, repackages, and ships to the customer. She earns the retail markup PLUS her distributor discount.
- **Independent products** — She sources and stocks these herself. Normal fulfilment from her own inventory.

The `type: 'forever' | 'independent'` field on every Product is a **fulfilment source indicator**, not a sales-model switch. It drives:
- Whether stock is tracked (yes for independent, no for Forever)
- How orders appear in the admin Fulfillment Dashboard (Forever orders go into a "needs sourcing from Forever" queue)
- Which help text shows in the admin when editing the product

This is **not** a deep-link model — everything goes through our own cart + checkout + Meshulam. See `docs/DECISIONS.md` ADR-002 for the reasoning.

## Where to find things

| Question | Where to look |
|---|---|
| How does the whole thing fit together? | `docs/ARCHITECTURE.md` |
| What's been built and what's next? | `docs/STATE.md` — **updated every work session** |
| Open TODOs, blockers, next actions | `docs/TASKS.md` |
| Why we chose X over Y | `docs/DECISIONS.md` |
| How to run/build/deploy locally | `docs/ENVIRONMENT.md` |
| Code style, naming, file layout rules | `docs/CONVENTIONS.md` |
| The Forever fulfillment workflow (Phase E) | `docs/FULFILLMENT.md` |
| Brand (colors, fonts, logo rules) | `docs/BRAND.md` |
| Original full plan (source of truth for vision) | `C:\Users\Ar1ma\.Codex\plans\glimmering-scribbling-pudding.md` |

## Critical rules (these WILL bite you)

1. **No hardcoded strings.** Every UI string goes through `src/messages/{he,en}.json`. Import via `useTranslations(namespace)` from `next-intl`.
2. **Never import from `next/link` in storefront code.** Use `Link` from `@/lib/i18n/navigation` — the locale-aware version. `next/link` bypasses the locale prefix and breaks language switching.
3. **Always `await` `params` and `searchParams` in server components.** Next 16 removed synchronous access. `const { locale } = await params`.
4. **`cookies()`, `headers()`, `draftMode()` are async.** Next 16 breaking change — must `await`.
5. **Call `setRequestLocale(locale)` at the top of every server page/layout** that uses translations, otherwise next-intl falls back to default.
6. **Never skip the `type` discriminator on Products.** Forever vs independent behave completely differently downstream.
7. **Payments provider is abstracted.** Do NOT import `meshulam.ts` directly from routes — go through `src/lib/payments/provider.ts`. When we swap gateways later, this is a one-file change.
8. **All admin labels in Hebrew.** When adding Payload collection fields, always include Hebrew `label` + Hebrew `admin.description` (help text). Yarit is non-technical.
9. **Never run Meshulam webhook verification in dev without the sandbox secret.** The webhook signature check must be enforced even locally.
10. **`src/brand.config.ts` is the single source of truth for brand data.** If you change a color, change it both here AND in `src/app/globals.css` `@theme` block. If we later add a build step to sync them, update this rule.
11. **`docs/STATE.md` must be updated at the end of every meaningful work session.** This is how the next AI session picks up where you left off.

## Development workflow

```bash
# first time
npm install
cp .env.example .env.local
# edit .env.local if you need to change PAYLOAD_SECRET or DATABASE_URI
npm run dev

# storefront: http://localhost:3000
# Payload admin: http://localhost:3000/admin
# (first visit to /admin will prompt you to create the first admin user)
```

Tests: `npm test` (not yet wired — Phase E).
Build: `npm run build` (verifies production bundling).
Lint: `npm run lint`.

## Pre-flight checks before doing anything

If the user asks you to make changes, do this first:
1. Read `docs/STATE.md` to know what phase we're in.
2. Read `docs/TASKS.md` to see what's blocked / in progress.
3. Read the relevant doc from the "Where to find things" table above.
4. Only then start planning / editing.

After a work session that changed files:
1. Update `docs/STATE.md` with what you did.
2. Update `docs/TASKS.md` with any new items discovered.
3. Add a new ADR to `docs/DECISIONS.md` if you made a significant architectural decision.
