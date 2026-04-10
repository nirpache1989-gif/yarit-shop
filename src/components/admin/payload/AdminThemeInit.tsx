/**
 * @file AdminThemeInit — theme bootstrap for the Payload admin panel
 * @summary Client provider wired via `admin.components.providers`.
 *          Reads the shared `shoresh-theme` localStorage key (same
 *          key the storefront's ThemeToggle writes to) and applies
 *          `data-theme` to `<html>` on mount.
 *
 *          Falls back to `prefers-color-scheme` on first visit and
 *          to light mode if localStorage is blocked (private mode).
 *
 *          Causes a 1-frame flash on first admin load before the
 *          theme kicks in (we can't inject an inline <head> script
 *          into Payload's layout the way the storefront does).
 *          Acceptable for non-public admin.
 */
'use client'

import { useEffect } from 'react'

export function AdminThemeInit() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shoresh-theme')
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches
      const theme = stored || (prefersDark ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', theme)
    } catch {
      /* localStorage blocked (private mode) — fall through to light */
    }
  }, [])
  return null
}
