# Shoresh docs — table of contents

Every file in `docs/` in one place. Read `NEXT-SESSION.md` first if
you're coming back to this repo cold; read `ONBOARDING.md` if you
just cloned it. Everything else is reference material.

## Start here

| File | Purpose |
|---|---|
| [`NEXT-SESSION.md`](NEXT-SESSION.md) | 5-minute orientation for the next work session. Current phase, known issues, what to do first. **Updated at the end of every meaningful session.** |
| [`ONBOARDING.md`](ONBOARDING.md) | 5-minute runnable setup for a human who just cloned the repo. Clone → install → dev → bootstrap admin → first click-through. |
| [`STATE.md`](STATE.md) | Full history. What's been built, what's deployed, what's in progress. Reverse-chronological changelog at the bottom. |
| [`TASKS.md`](TASKS.md) | Open todos, blocked items, polish backlog. |

## Architecture + conventions

| File | Purpose |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | How the pieces fit. Route groups, collections, payment + email abstraction, localization, theming. |
| [`CONVENTIONS.md`](CONVENTIONS.md) | Code style, naming, file layout, i18n rules, Payload field conventions. |
| [`DECISIONS.md`](DECISIONS.md) | ADRs. Why we chose X over Y. Read before questioning an architectural choice. |
| [`ENVIRONMENT.md`](ENVIRONMENT.md) | Every env var, where it lives, what happens if it's unset. `.env.example` in the repo root is the quick-reference template. |

## Domain

| File | Purpose |
|---|---|
| [`BRAND.md`](BRAND.md) | Colors, fonts, logo rules, voice. Brand tokens live in `src/brand.config.ts` (single source of truth) and `src/app/globals.css` (Tailwind v4 `@theme`). |
| [`FULFILLMENT.md`](FULFILLMENT.md) | The Forever Living dual-sourcing workflow. Why the admin has both an order list AND a fulfillment dashboard, what the state-machine statuses mean, and how Yarit uses each bucket. |

## Admin + user-facing

| File | Purpose |
|---|---|
| [`ADMIN-SURFACES.md`](ADMIN-SURFACES.md) | Canonical map of every admin surface. If you're about to add or remove an admin entry point, read this first so the panel stays purposefully minimal. |
| [`YARIT-ADMIN-GUIDE.md`](YARIT-ADMIN-GUIDE.md) | End-user guide for Yarit. Written in Hebrew. Covers: how to add a product, how to mark an order shipped, how to change the announcement bar, how to swap languages in the admin. |

## Historical / round-specific

| Folder | Purpose |
|---|---|
| [`round-4-admin-verify/`](round-4-admin-verify/) | Round 4 admin verification sweep — screenshots, markup checks, CSS target inventory. Reference for "what did we check last time" before the next visual pass. |
| [`round-4-design-review/`](round-4-design-review/) | Round 4 design review agents' findings and the triage decisions that came out of them. |

## How to find something specific

- **"Where is X configured?"** → `ENVIRONMENT.md` if it's an env var, `CONVENTIONS.md` if it's a code-layout rule, `ARCHITECTURE.md` otherwise.
- **"Why was X built this way?"** → `DECISIONS.md`.
- **"What's blocked?"** → `TASKS.md` `External blockers` section.
- **"How do I run this locally?"** → `ONBOARDING.md`.
- **"What should I do in the next session?"** → `NEXT-SESSION.md`.

## Rule of thumb for docs drift

After any meaningful work session, update in this order:
1. `STATE.md` — what you did (new changelog entry).
2. `TASKS.md` — move completed items to the "done" list, add new items surfaced by the session.
3. `NEXT-SESSION.md` — rewrite the "what to do next" block.
4. `DECISIONS.md` — only if you made a decision worth recording.
5. Everything else — only if you changed something that contradicts the existing text.

Drift catches contributors off guard. Keeping the top four files honest takes 10 minutes and saves hours.
