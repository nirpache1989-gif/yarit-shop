/**
 * @file SkipLink — accessibility "skip to main content" keyboard affordance
 * @summary Invisible until a keyboard user tabs into it (the first
 *          focusable element on the page), then appears in the top
 *          start corner. Jumps focus to `#main-content` which is the
 *          `<main>` element in `layout.tsx`. WCAG 2.1 SC 2.4.1.
 *
 *          Server component — reads the existing `common.skipToContent`
 *          message key via next-intl server. No client JS needed.
 */
import { getTranslations } from 'next-intl/server'

export async function SkipLink() {
  const t = await getTranslations('common')
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:rounded-full focus:bg-[var(--color-primary)] focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-accent-deep)]"
    >
      {t('skipToContent')}
    </a>
  )
}
