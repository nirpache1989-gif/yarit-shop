/**
 * @file ThemeToggle — light/dark mode switcher for the Header
 * @summary Dark mode is disabled (2026-04-12) — the hero logo PNG
 *          creates a visible rectangular compositing boundary in dark
 *          mode that could not be fixed after multiple sessions.
 *          The toggle returns null but the component export is kept
 *          so existing imports don't break. All dark-mode CSS is
 *          preserved in globals.css / admin-brand.css — re-enable by
 *          restoring the original implementation from git history.
 */
'use client'

export function ThemeToggle() {
  return null
}
