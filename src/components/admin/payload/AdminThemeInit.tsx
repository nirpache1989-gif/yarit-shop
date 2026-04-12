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
 *
 *          IMPORTANT: Payload's NestProviders
 *          (`@payloadcms/next/dist/layouts/Root/NestProviders.js`)
 *          wraps admin providers in a chain:
 *            <Provider0>
 *              <Provider1>
 *                <Provider2>{admin content}</Provider2>
 *              </Provider1>
 *            </Provider0>
 *          Every provider MUST accept `children` and render it as-is
 *          or the chain breaks and everything nested below gets
 *          dropped (including the entire admin UI). This component
 *          was accidentally shipped without the `children` prop in
 *          Design Round 3 — it happened to work because it was the
 *          ONLY provider at the time (nothing below it to drop).
 *          Round 4 added AdminToaster + AdminDriftingLeaves +
 *          OnboardingTour, which broke the chain. Fixed by
 *          propagating `children` in every provider.
 */
'use client'

import { useEffect, type ReactNode } from 'react'

type Props = {
  children?: ReactNode
}

/**
 * Dark mode disabled (2026-04-12) — always force light mode.
 * Original theme detection logic preserved in git history.
 */
export function AdminThemeInit({ children }: Props) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    document.cookie = 'payload-theme=light;path=/;max-age=31536000;samesite=lax'
  }, [])
  return <>{children}</>
}
