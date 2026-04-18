# AI collaboration playbook

> **Audience:** Claude (or any AI coding assistant) working on this
> project, and the human reviewing the AI's work.
>
> **Goal:** Make AI-assisted edits fast, predictable, and reversible.
> Every section below is a rule the AI follows — read them before the
> AI starts, and the AI will stay inside the guardrails that keep this
> project shippable.

This complements `CLAUDE.md` (project-level rules) and `CONVENTIONS.md`
(code style). This file focuses on **process** — how to approach a
task, where to look first, what to commit, what to never do.

---

## Opening moves (every session)

Every fresh AI session opens these files in order, top-to-bottom:

1. `CLAUDE.md` (project root) — auto-loaded by Claude Code. Non-negotiable rules.
2. `docs/NEXT-SESSION.md` — 5-minute orientation.
3. `docs/NEXT-SESSION-PROMPT.md` — what this session is supposed to ship.
4. `docs/STATE.md` — what's actually in the tree right now.
5. `docs/CODEMAP.md` — where code lives.
6. The specific doc for the task (`DESIGN-LIVING-GARDEN.md`, `ADMIN-SURFACES.md`, `DECISIONS.md`, etc.)

Do NOT start editing before this is done. The first 5 minutes of a
session saves 30 minutes of re-work later.

## Rhythm (every task)

For any task that touches code, follow this rhythm:

1. **Plan.** State in one sentence what you'll do. If the task is
   multi-step, write a todo list (`TodoWrite` in Claude Code).
2. **Find.** Use `CODEMAP.md` to locate files. Use Grep / Glob — do
   NOT guess filenames. Read each file you intend to edit.
3. **Edit.** Smallest-diff-that-works. Prefer `Edit` (targeted
   replace) over `Write` (full file).
4. **Gate.** Run `npx tsc --noEmit && npm run lint` before committing.
   Run `npm run build` for anything touching routes or Payload.
5. **Verify.** If UI-observable, open Preview MCP and check the real
   page. Fonts, colors, responsiveness, RTL. Don't rely on screenshots
   alone — `preview_inspect` for precise CSS values.
6. **Commit.** One commit per logical slice. Short imperative subject,
   explanation in the body.
7. **Update docs.** At end of session: `STATE.md` + `TASKS.md` +
   `NEXT-SESSION.md` + the session prompt archive.

## Hard rules (never break these without user approval)

- **No hardcoded UI strings.** Every user-facing string goes through
  `src/messages/{he,en}.json`. Both locales, same key tree.
- **Never `import Link from 'next/link'`** in the storefront. Always
  `import { Link } from '@/lib/i18n/navigation'`.
- **Never import from `gsap/ScrollTrigger` directly.** Always go
  through `@/lib/motion/gsap`.
- **Never import payment or email drivers directly.** Go through
  `src/lib/payments/provider.ts` / `src/lib/email/provider.ts`.
- **Never bypass `isPlaceholder` guards** in `siteSettings` or the
  footer. Placeholder values must not render as live links.
- **Never run `git push` or `npx vercel --prod` without explicit
  user word** (`push` / `deploy`).
- **Never skip hooks** (`--no-verify`, `--no-gpg-sign`) unless the
  user explicitly asks. If a pre-commit hook fails, fix the cause.
- **Never `--amend`** a commit. Always create a new one.
- **Never edit `src/app/(payload)/admin/importMap.js` manually**
  unless restoring the `VercelBlobClientUploadHandler` line that
  `npm run build` just wiped. Otherwise let Payload regenerate it.
- **Never rewrite history on a branch that has been pushed.**
- **Never add `generateStaticParams()` returning only `{locale}`** —
  CI fails per ADR-018.

## Soft rules (default behavior — override only with reason)

- **Edit existing files over creating new ones.** Reuse. The codebase
  is DRY; fit in.
- **Small commits over big ones.** One concept per commit.
- **Comments: almost never.** Well-named identifiers and docstrings
  cover the common case. Add a comment only when the *why* is
  non-obvious (a constraint, workaround, invariant).
- **Tests: only when asked.** The project's test harness isn't wired
  yet; don't invent one during unrelated work.
- **No docs files** (`*.md`) unless explicitly requested or part of
  a session prep task like this one.
- **Prefer server components.** Promote to `'use client'` only when
  you need state, effects, refs, or browser APIs.
- **Prefer `.g-*` (Living Garden) tokens for new page work**, `--color-*`
  (Night Apothecary) for chrome that hasn't been rebuilt yet.
  Document in a commit message when you pick one over the other.

## Verification toolkit

When a change is observable in a browser:

- `preview_start` once at the top of the session (autoport via
  `.claude/launch.json`).
- `preview_eval` for reading DOM + computed styles + firing synthetic
  events. This is the workhorse.
- `preview_inspect` for precise CSS property reads. More reliable than
  screenshots for colors, fonts, spacing.
- `preview_snapshot` for structure + text verification (a11y tree).
- `preview_click` / `preview_fill` for interaction testing.
- `preview_resize` for responsive + `prefers-color-scheme` emulation.
- `preview_console_logs` filtered to `error` to verify no runtime errors.
- `preview_screenshot` — **avoid on Next dev + Turbopack, it often
  hangs the renderer under heavy CSS.** Prefer `inspect` + `eval`.

## Writing commit messages

Subject: `<type>(<scope>): <short description>` — under 72 chars.

Types in use on this project:
- `feat` — new user-facing behavior
- `fix` — bug fix
- `refactor` — code-only, no behavior change
- `docs` — docs-only changes
- `chore` — repo maintenance, tooling

Body (optional but encouraged): *why*, not *what*. The diff shows what.

Always include the `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer when an AI wrote the change.

## End-of-session checklist

Before the human closes the terminal:

- [ ] `npx tsc --noEmit` green
- [ ] `npm run lint` green (2 pre-existing prototype warnings are OK)
- [ ] `npm run build` green if routes / Payload touched
- [ ] `git diff src/app/(payload)/admin/importMap.js` empty
- [ ] `docs/STATE.md` updated with a new changelog entry
- [ ] `docs/TASKS.md` — completed items marked, new items added
- [ ] `docs/NEXT-SESSION.md` refreshed
- [ ] `docs/NEXT-SESSION-PROMPT.md` written for the next session
- [ ] This session's prompt archived to
      `docs/sessions/session-{N}-{slug}.md` + indexed in
      `docs/sessions/README.md`
- [ ] No pushes, no deploys (unless the human said the word)

## Common failure modes to watch for

| Smell | Likely cause | Fix |
|---|---|---|
| Admin panel blank / partial | A provider in the admin tree doesn't forward `{children}` | See AdminThemeInit.tsx comment block |
| Admin upload button missing | `importMap.js` lost the `VercelBlobClientUploadHandler` line | `git checkout HEAD -- src/app/(payload)/admin/importMap.js` |
| Hebrew page shows English or vice versa | Forgot `setRequestLocale(locale)` in the server page | Add it at top of the component |
| Next 16: "params/searchParams is a Promise" | Forgot to `await` | `const { locale } = await params` |
| Dark mode styles "leak" into light mode | Rule not scoped under `[data-theme="dark"]` | Wrap the selector; dark mode disabled entirely since 2026-04-12 but CSS preserved |
| GSAP animation flashes on load | Missing `immediateRender: false` | Apply CLAUDE.md rule #12 invariant |
| Hydration mismatch warning in console | Reading `window` / `localStorage` during SSR | Wrap in `useEffect` or `useHasMounted` |
| Motion runs even with reduced motion | Component forgot `useGsapReducedMotion()` gate | Add the early-return |

## Asking the user vs. deciding yourself

Ask the user when:
- There's a branding / product / voice decision (color, wording, feature shape).
- The change is hard to reverse (deletes data, drops a column, closes a branch).
- The code could be written two equally-valid ways and the user has preferences.

Decide yourself when:
- There's a single right answer per this playbook or `CONVENTIONS.md`.
- The change is inside a session whose prompt already scoped the work.
- The fix is obvious and reversible.

Use `AskUserQuestion` for genuine choices. Never fake-ask to get
performative buy-in on a decision you've already made.

## When a session goes sideways

Stop, write down the state, and either:
1. Ask the user for guidance before making more changes.
2. Revert the half-done work (`git reset --hard HEAD` if nothing was
   committed; `git revert` if it was) and restart from a known-good
   point.

Do NOT:
- Keep editing in the hope the diff gets smaller.
- Delete branches, files, or history to "clean up".
- Skip hooks to push through a failing CI gate.

## The reading loop

Every time you want to take an action, re-check the relevant doc.
`CLAUDE.md` + this file are short enough to reread. `CODEMAP.md` is
the lookup table. `DECISIONS.md` explains the *why* when you disagree
with a rule. Keep these open.
