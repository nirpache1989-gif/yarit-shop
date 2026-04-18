# Copaia docs — table of contents

Every file in `docs/` in one place. Read `NEXT-SESSION.md` first if
you're coming back to this repo cold; read `ONBOARDING.md` if you
just cloned it. Everything else is reference material.

## Start here

| File | Purpose |
|---|---|
| [`NEXT-SESSION.md`](NEXT-SESSION.md) | ★ 5-minute orientation for the next work session. Current phase, known issues, what to do first. **Updated at the end of every meaningful session.** |
| [`NEXT-SESSION-PROMPT.md`](NEXT-SESSION-PROMPT.md) | ★ The long-form starting prompt for the next session — inherited state, scope, non-negotiables, definition-of-done. Written at the end of each session and read top-to-bottom at the start of the next one. |
| [`AI-COLLABORATION.md`](AI-COLLABORATION.md) | ★ How Claude (or any AI) should approach this project. Opening moves, rhythm, hard rules, common failure modes. Read this before starting any AI-assisted task. |
| [`ONBOARDING.md`](ONBOARDING.md) | 5-minute runnable setup for a human who just cloned the repo. Clone → install → dev → bootstrap admin → first click-through. |
| [`STATE.md`](STATE.md) | Full history. What's been built, what's deployed, what's in progress. Reverse-chronological changelog. Oldest entries move to `STATE-ARCHIVE.md`. |
| [`TASKS.md`](TASKS.md) | Open todos, blocked items, polish backlog. |

## Architecture + conventions

| File | Purpose |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | How the pieces fit. Route groups, collections, payment + email abstraction, localization, theming. |
| [`CODEMAP.md`](CODEMAP.md) | ★ Where does code X live? Shortcut map of `src/` — every folder, its purpose, which file is the entry point. |
| [`CONVENTIONS.md`](CONVENTIONS.md) | Code style, naming, file layout, i18n rules, Payload field conventions. |
| [`DECISIONS.md`](DECISIONS.md) | ADRs. Why we chose X over Y. Read before questioning an architectural choice. |
| [`ENVIRONMENT.md`](ENVIRONMENT.md) | Every env var, where it lives, what happens if it's unset. `.env.example` in repo root is the quick-reference template. |

## Domain

| File | Purpose |
|---|---|
| [`BRAND.md`](BRAND.md) | Colors, fonts, logo rules, voice. Brand tokens live in `src/brand.config.ts` + `src/app/globals.css` (Tailwind v4 `@theme`). |
| [`DESIGN-LIVING-GARDEN.md`](DESIGN-LIVING-GARDEN.md) | Full Living Garden redesign reference — tokens, typography, chrome, cards, motion layer, all 9 pages, i18n, data model. |
| [`FULFILLMENT.md`](FULFILLMENT.md) | The dual-sourcing workflow. Why the admin has both an order list AND a fulfillment dashboard, what the state-machine statuses mean, and how Yarit uses each bucket. |

## Admin + user-facing

| File | Purpose |
|---|---|
| [`ADMIN-SURFACES.md`](ADMIN-SURFACES.md) | Canonical map of every admin surface. If you're about to add or remove an admin entry point, read this first so the panel stays purposefully minimal. |
| [`YARIT-ADMIN-GUIDE.md`](YARIT-ADMIN-GUIDE.md) | End-user guide for Yarit. Written in Hebrew. Covers: add a product, mark an order shipped, change the announcement bar, swap languages in the admin. |
| [`YARIT-WELCOME-LETTER.md`](YARIT-WELCOME-LETTER.md) | Hand-off letter to Yarit explaining what's shipped + how to start using the admin. |
| [`NIR-HANDOFF.md`](NIR-HANDOFF.md) | Technical handoff for Nir (project-owner engineer) covering external deps + launch-blockers. |

## Session log

| Folder / File | Purpose |
|---|---|
| [`sessions/`](sessions/) | Archive of every session prompt ever written. Naming: `session-{N}-{slug}.md` (new) or `NEXT-SESSION-PROMPT-{DATE}-{slug}.md` (legacy). |
| [`sessions/README.md`](sessions/README.md) | Index of every session — numbered, reverse-chronological, with one-line summaries. Newest-first. |
| [`STATE-ARCHIVE.md`](STATE-ARCHIVE.md) | STATE.md entries older than the two most recent — preserved for historical reference. |

## Round-specific / historical

| File / Folder | Purpose |
|---|---|
| [`round-4-admin-verify/`](round-4-admin-verify/) | Round 4 admin verification sweep — screenshots, markup checks, CSS target inventory. |
| [`round-4-design-review/`](round-4-design-review/) | Round 4 design review agents' findings + triage decisions. |

## How to find something specific

- **"What should I do in the next session?"** → `NEXT-SESSION.md`.
- **"Where does code X live?"** → `CODEMAP.md`.
- **"How should AI approach this task?"** → `AI-COLLABORATION.md`.
- **"Where is X configured?"** → `ENVIRONMENT.md` if env var, `CONVENTIONS.md` if code layout, `ARCHITECTURE.md` otherwise.
- **"Why was X built this way?"** → `DECISIONS.md`.
- **"What's blocked?"** → `TASKS.md` "External blockers" section.
- **"How do I run this locally?"** → `ONBOARDING.md`.
- **"What did we do last session?"** → `STATE.md` (summary) or `sessions/session-{N}-*.md` (full prompt context).

## Rule of thumb for docs drift

After any meaningful work session, update in this order:

1. `STATE.md` — what you did (new changelog entry).
2. `TASKS.md` — move completed items to the "done" list, add new items surfaced by the session.
3. `NEXT-SESSION.md` — rewrite the "where we are" block + the 5-min orientation.
4. `NEXT-SESSION-PROMPT.md` — write the next session's full brief.
5. `sessions/` — archive the current prompt with its session number + update `sessions/README.md`.
6. `DECISIONS.md` — only if you made a decision worth recording.
7. Everything else — only if you changed something that contradicts the existing text.

Drift catches contributors off guard. Keeping the top four files
honest takes 10 minutes and saves hours.
