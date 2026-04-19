# Copaia — AI Agent Entry Point

> **This file is auto-loaded by Claude Code when any session opens this project.**
> It is the entry point for any AI assistant continuing work on Copaia.
>
> **Opening moves — read these in order, every session:**
>
> 1. `docs/NEXT-SESSION.md` — 5-minute orientation (current state, what to do next)
> 2. `docs/NEXT-SESSION-PROMPT.md` — this session's full brief
> 3. `docs/AI-COLLABORATION.md` — how AI should approach work on this project
> 4. `docs/CODEMAP.md` — where every piece of code lives
> 5. `docs/STATE.md` — full changelog of what's been built
> 6. The specific doc for the task at hand (see "Where to find things" below)
>
> 🚀 **Production is live at https://yarit-shop.vercel.app** (since 2026-04-10). The project was renamed from "Shoresh" to "Copaia" on 2026-04-11 — historical doc entries still reference the old name and must not be rewritten.

---

## What Copaia is

**Copaia** (קופאה, pronounced ko-PA-eh) is a bilingual Hebrew/English e-commerce site for **Yarit**, a natural-wellness shop owner in Israel. The shop sells a curated catalog of natural wellness products that Yarit hand-picks and either stocks at home or orders from a supplier per-order. The logo is a tree with visible roots — the tagline "שורשים של בריאות" / "Rooted in wellness" still matches the imagery after the rename.

- **Owner:** Yarit (non-technical, 65-year-old Hebrew-first)
- **Primary language:** Hebrew (RTL), with English as a secondary locale
- **Tech stack:** Next.js 16.2.3 + Tailwind CSS v4 + Payload CMS 3.82.1 + SQLite (dev) / Neon Postgres (prod) + next-intl 4.9
- **Deployment target:** Vercel (app) + Neon (production DB)
- **Current state:** Phase 1 + 2 of the "Living Garden" redesign shipped on branch `feat/living-garden` (not yet pushed to main). Every storefront page wears the new chrome (header, footer, marquee, sound pill); page bodies still on old Night Apothecary design. Phase 3 rebuilds the 9 page bodies over the next ~7 sessions. See `docs/NEXT-SESSION.md` for the exact path.

## The business model (read this carefully — it drives data shape)

Yarit is the merchant of record for **every** sale. Money always lands in her bank account via an Israeli payment gateway (Meshulam is currently recommended but not locked in). Every paid order flows through the same 3-step fulfillment pipeline (`packed → shipped → delivered`) regardless of where the item was sourced from.

- **Stocked products** (`type: 'stocked'`) — Yarit keeps these at home. The `stock` field tracks current inventory and the admin warns her when stock drops below 5.
- **Sourced products** (`type: 'sourced'`) — Yarit orders these from her supplier only when a customer buys. No local inventory, no stock tracking. She looks at the order line items and handles sourcing mentally — there's no separate "awaiting supplier" workflow in the admin.

The `type: 'stocked' | 'sourced'` field on every Product is a **stock-tracking toggle**, nothing more. It controls whether the `stock` field is visible in the admin form and whether the storefront enforces an out-of-stock state. It does NOT affect orders, cart, checkout, or the fulfillment state machine.

Every order — regardless of item type — goes through our own cart + checkout + Meshulam. See `docs/DECISIONS.md` ADR-002 (cart flow) and ADR-019 (2026-04-11 removal of Forever terminology + fulfillment state-machine collapse).

## Where to find things

| Question | Where to look |
|---|---|
| What should I do in this session? | `docs/NEXT-SESSION-PROMPT.md` |
| What's the 5-minute orientation? | `docs/NEXT-SESSION.md` |
| How should AI approach work here? | `docs/AI-COLLABORATION.md` |
| Where does code X live? | `docs/CODEMAP.md` |
| Complete docs index | `docs/INDEX.md` |
| How does the whole thing fit together? | `docs/ARCHITECTURE.md` |
| What's been built and what's next? | `docs/STATE.md` — **updated every work session** |
| Open TODOs, blockers, next actions | `docs/TASKS.md` |
| Why we chose X over Y | `docs/DECISIONS.md` |
| How to run/build/deploy locally | `docs/ENVIRONMENT.md` |
| Code style, naming, file layout rules | `docs/CONVENTIONS.md` |
| The fulfillment workflow (Phase E) | `docs/FULFILLMENT.md` |
| Brand (colors, fonts, logo rules) | `docs/BRAND.md` |
| Living Garden redesign reference | `docs/DESIGN-LIVING-GARDEN.md` |
| Prior session prompts archive | `docs/sessions/` (indexed in `sessions/README.md`) |
| Original full plan (source of truth for vision) | `C:\Users\Ar1ma\.claude\plans\glimmering-scribbling-pudding.md` |

## Critical rules (these WILL bite you)

1. **No hardcoded strings.** Every UI string goes through `src/messages/{he,en}.json`. Import via `useTranslations(namespace)` from `next-intl`.
2. **Never import from `next/link` in storefront code.** Use `Link` from `@/lib/i18n/navigation` — the locale-aware version. `next/link` bypasses the locale prefix and breaks language switching.
3. **Always `await` `params` and `searchParams` in server components.** Next 16 removed synchronous access. `const { locale } = await params`.
4. **`cookies()`, `headers()`, `draftMode()` are async.** Next 16 breaking change — must `await`.
5. **Call `setRequestLocale(locale)` at the top of every server page/layout** that uses translations, otherwise next-intl falls back to default.
6. **Never skip the `type` discriminator on Products.** `stocked` vs `sourced` controls stock-tracking visibility in the admin and the storefront's out-of-stock behavior. Defaults to `stocked`.
7. **Payments provider is abstracted.** Do NOT import `meshulam.ts` directly from routes — go through `src/lib/payments/provider.ts`. When we swap gateways later, this is a one-file change.
8. **All admin labels in Hebrew.** When adding Payload collection fields, always include Hebrew `label` + Hebrew `admin.description` (help text). Yarit is non-technical.
9. **Never run Meshulam webhook verification in dev without the sandbox secret.** The webhook signature check must be enforced even locally.
10. **`src/brand.config.ts` is the single source of truth for brand data.** If you change a color, change it both here AND in `src/app/globals.css` `@theme` block. If we later add a build step to sync them, update this rule.
11. **`docs/STATE.md` must be updated at the end of every meaningful work session.** This is how the next AI session picks up where you left off.
12. **Every `gsap.from + scrollTrigger` gets `immediateRender: false + once: true + start: 'top bottom-=40'`.** Without this the element flashes into its final state before the scroll trigger fires. Use `useGsapScope` from `@/components/motion/GsapScope` — it bundles the reduced-motion check with the scope cleanup.
13. **After every `npm run build`, check `git diff src/app/(payload)/admin/importMap.js`.** If the `VercelBlobClientUploadHandler` line is missing, restore with `git checkout HEAD -- "src/app/(payload)/admin/importMap.js"`. Prior P0 regression — this will bite you if ignored.
14. **Never `git push` or `npx vercel --prod` without explicit user word.** The user says "push" to allow pushing; "deploy" for prod. Otherwise keep work local.

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
Build: `npm run build` (verifies production bundling + regenerates Payload importMap).
Lint: `npm run lint` (2 pre-existing warnings in prototype handoff files are expected; fail only on new warnings).
Type-check: `npx tsc --noEmit`.

## Pre-flight checks before doing anything

If the user asks you to make changes, do this first:

1. Read `docs/NEXT-SESSION.md` — current state.
2. Read `docs/NEXT-SESSION-PROMPT.md` — this session's brief (if one exists).
3. Read `docs/AI-COLLABORATION.md` — the process rules.
4. Use `docs/CODEMAP.md` to find the files you'll edit.
5. Read the relevant doc from the "Where to find things" table above.
6. Only then start planning / editing.

After a work session that changed files:

1. Update `docs/STATE.md` with what you did (new changelog entry at the top).
2. Update `docs/TASKS.md` — move completed items to done, add new items surfaced.
3. Rewrite `docs/NEXT-SESSION.md` — the "where we are" block.
4. Write `docs/NEXT-SESSION-PROMPT.md` for the next session.
5. Archive the current prompt to `docs/sessions/session-{N}-{slug}.md` + update `docs/sessions/README.md`.
6. Add a new ADR to `docs/DECISIONS.md` if you made a significant architectural decision.
