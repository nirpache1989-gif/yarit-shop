/**
 * @file Language switcher (Header widget)
 * @summary Client component that flips between Hebrew and English
 *          while preserving the current path and searchParams.
 *          Uses next-intl's `usePathname` + `useRouter` so locale
 *          transitions don't require manual URL rewriting.
 */
'use client'

import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/cn'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchTo(next: 'he' | 'en') {
    if (next === locale) return
    router.replace(pathname, { locale: next })
  }

  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      <button
        type="button"
        onClick={() => switchTo('he')}
        className={cn(
          'px-2 py-1 rounded transition-colors',
          locale === 'he'
            ? 'text-[var(--color-primary-dark)]'
            : 'text-[var(--color-muted)] hover:text-[var(--color-primary-dark)]',
        )}
      >
        עב
      </button>
      <span className="text-[var(--color-muted)]">/</span>
      <button
        type="button"
        onClick={() => switchTo('en')}
        className={cn(
          'px-2 py-1 rounded transition-colors',
          locale === 'en'
            ? 'text-[var(--color-primary-dark)]'
            : 'text-[var(--color-muted)] hover:text-[var(--color-primary-dark)]',
        )}
      >
        EN
      </button>
    </div>
  )
}
