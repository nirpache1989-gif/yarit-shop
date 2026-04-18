# Session log

> **What this folder is.** Every meaningful work session on this
> project starts with a "session prompt" — a long-form briefing of
> what shipped previously, what's open, and what the next session
> should do. When a session ends, that prompt is archived here so
> the next session can read `docs/NEXT-SESSION-PROMPT.md` (always
> the current one) without losing the history of prior prompts.
>
> **Live prompt lives at** `docs/NEXT-SESSION-PROMPT.md` — not in
> this folder. This folder is archive-only.

## Why we archive prompts

Each prompt captures the *intent and assumptions* of a session at
the moment it started. Git history captures the code outcome. STATE.md
captures the final shipped state. The session prompts sit between —
they're the most useful artifact when you need to understand *why*
a session made certain choices, because they record what we knew
(or thought we knew) going in.

Good reasons to re-read an archived session prompt:

- You're about to revert / redo something from that session and
  want to understand what drove the original decision.
- You're debugging a regression and the commit message isn't enough.
- You're onboarding and need to see the project's trajectory.
- You want to remember what "next session" meant N sessions ago.

## Naming convention

Two forms live here because the project predates the numbered
convention:

- **New (2026-04-18 onward):** `session-{N}-{slug}.md`
  - Example: `session-19-living-garden-phase-1-remainder-phase-2-chrome.md`
  - Numbers increment monotonically. Current session number = the
    most recent entry in this folder.
- **Legacy (2026-04-11 → 2026-04-12):** `NEXT-SESSION-PROMPT-{DATE}-{slug}.md`
  - Names preserved from the era before numbering. The date at
    the front is the date the prompt was *written* (= the end of
    the previous session). Do not rename — STATE-ARCHIVE.md and
    prior session prompts reference these paths.

## Index (reverse-chronological — newest first)

| # | Slug | Shipped | One-line description |
|---|---|---|---|
| 19 | [living-garden-phase-1-remainder-phase-2-chrome](session-19-living-garden-phase-1-remainder-phase-2-chrome.md) | 2026-04-18 | GardenAlive + RevealOnScroll, Living Garden Header + Footer + Marquee + Sound Pill, MobileNav active-state. |
| — | [2026-04-18 dark-mode-disable](NEXT-SESSION-PROMPT-2026-04-18-dark-mode-disable.md) | 2026-04-18 | Dark mode toggle removal + admin importMap P0 fix + Living Garden handoff docs. |
| — | [2026-04-12 admin-fix](NEXT-SESSION-PROMPT-2026-04-12-admin-fix.md) | 2026-04-12 | Admin blank-page diagnostic + importMap entry fix. |
| — | [2026-04-11 t2.9-homepage-orchestration](NEXT-SESSION-PROMPT-2026-04-11-t2.9-homepage-orchestration.md) | 2026-04-11 | T2.9 scroll-linked homepage storytelling ship. |
| — | [2026-04-11 post-launch-catalog-sync](NEXT-SESSION-PROMPT-2026-04-11-post-launch-catalog-sync.md) | 2026-04-11 | Prod DB catalog sync + 8-product replacement. |
| — | [2026-04-11 final-qa-polish](NEXT-SESSION-PROMPT-2026-04-11-final-qa-polish.md) | 2026-04-11 | Final QA + polish sweep. |
| — | [2026-04-11 close-out](NEXT-SESSION-PROMPT-2026-04-11-close-out.md) | 2026-04-11 | Late close-out session (prod deploy + SSG incident fix). |
| — | [2026-04-11 cleanup-and-tier2-lite](NEXT-SESSION-PROMPT-2026-04-11-cleanup-and-tier2-lite.md) | 2026-04-11 | Code + docs cleanup, motion bug fix, footer reveal, category hover. |
| — | [2026-04-11 brand-rename-and-finalqa](NEXT-SESSION-PROMPT-2026-04-11-brand-rename-and-finalqa.md) | 2026-04-11 | `Shoresh → Copaia` brand rename end-to-end + catalog replacement. |
| — | [2026-04-11 admin-fix-attempt](NEXT-SESSION-PROMPT-2026-04-11-admin-fix-attempt.md) | 2026-04-11 | Early admin blank-page debugging attempt. |
| — | [GSAP Tier-1 roadmap (reference)](NEXT-SESSION-GSAP-PROMPT.md) | 2026-04-11 | GSAP Tier-1 wave roadmap — all shipped. Kept as vocabulary reference. |

## Workflow

At the end of every meaningful session:

1. `cp docs/NEXT-SESSION-PROMPT.md docs/sessions/session-{next}-{slug}.md`
2. Overwrite `docs/NEXT-SESSION-PROMPT.md` with the new prompt.
3. Update the index in this file (add a row at the top).
4. Update `docs/NEXT-SESSION.md` (5-min orientation).
5. Update `docs/STATE.md` (changelog entry for what shipped).
6. Commit: `docs: archive session {N} prompt + write session {N+1}`.

The numbered convention means the next session doesn't have to guess
which old prompt is relevant — they just read the highest-numbered
one in this folder, then the live prompt.
