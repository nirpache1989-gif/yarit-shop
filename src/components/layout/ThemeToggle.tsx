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

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'

type Theme = 'light' | 'dark'

export function ThemeToggle() {
  const t = useTranslations('theme')
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Read whatever the bootstrap script set on first paint
  useEffect(() => {
    const current =
      (document.documentElement.getAttribute('data-theme') as Theme) ?? 'light'
    setTheme(current)
    setMounted(true)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('shoresh-theme', next)
    } catch {
      /* localStorage blocked (private mode) — fall through */
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
