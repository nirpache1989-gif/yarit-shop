/**
 * @file ThemeToggle — light/dark mode switcher for the Header
 * @summary Client component that mirrors the LanguageSwitcher pattern.
 *          Reads the current `data-theme` attribute (set by the inline
 *          FOUC bootstrap script in (storefront)/[locale]/layout.tsx),
 *          toggles it on click, persists the choice to localStorage
 *          under the `shoresh-theme` key.
 *
 *          The admin panel shares the same localStorage key via
 *          AdminThemeInit.tsx, so toggling here carries across the
 *          storefront ↔ admin boundary.
 *
 *          Accessibility:
 *            - <button> element (Space/Enter to activate)
 *            - aria-label changes with current state
 *            - aria-pressed reports boolean current state
 *            - Visible focus ring via focus-visible
 *
 *          The initial render returns a placeholder div of the same
 *          size so the server HTML matches the client-hydrated DOM
 *          exactly (no layout shift on the toggle itself).
 */
'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'
import { useHasMounted } from '@/lib/useHasMounted'

type Theme = 'light' | 'dark'

/**
 * Subscribe to `<html data-theme="...">` changes via a
 * MutationObserver. Instead of mirroring the attribute into React
 * state with a `useEffect(setState)` we treat the DOM attribute as
 * the source of truth and `useSyncExternalStore` keeps the render
 * in sync. This avoids the `react-hooks/set-state-in-effect`
 * anti-pattern entirely.
 */
function subscribeToTheme(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  return () => observer.disconnect()
}

function getThemeSnapshot(): Theme {
  if (typeof document === 'undefined') return 'light'
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'dark' ? 'dark' : 'light'
}

function getThemeServerSnapshot(): Theme {
  return 'light'
}

export function ThemeToggle() {
  const t = useTranslations('theme')
  const mounted = useHasMounted()
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  )

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('shoresh-theme', next)
    } catch {
      /* localStorage blocked (private mode) — fall through */
    }
    // Wave D — mirror the choice into the `payload-theme` cookie so
    // when the user hops to /admin, Payload's server-side theme
    // detection reads the same value and renders the first paint
    // in the correct palette (no flash of light → dark).
    try {
      document.cookie = `payload-theme=${next};path=/;max-age=31536000;samesite=lax`
    } catch {
      /* cookie blocked — storefront still works, admin may flash */
    }
  }

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden="true" />
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
      aria-pressed={theme === 'dark'}
      className={cn(
        'h-9 w-9 grid place-items-center rounded-full text-base leading-none',
        'text-[var(--color-primary-dark)] hover:bg-[var(--color-surface-warm)]',
        'border border-[var(--color-border-brand)]',
        'transition-colors',
        'focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2',
      )}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  )
}
