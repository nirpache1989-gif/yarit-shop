/**
 * @file HeaderNavLinks — client-side nav list with active-link detection
 * @summary Renders the three primary storefront nav links (Shop /
 *          About / Contact) inside the `.g-nav-links` container.
 *          Uses `usePathname()` from `@/lib/i18n/navigation` to add
 *          the `is-active` class on whichever link matches the
 *          current route — the CSS `.g-nav-links a.is-active::after`
 *          rule in globals.css draws the ember skewed underline.
 *
 *          Split into its own file so the parent `Header.tsx` can
 *          stay an async server component (it needs `getTranslations`
 *          and `getLocale`, and the account link is server-rendered).
 *          Same pattern as Footer → FooterMotion.
 *
 *          RTL-safe: the skewX(-8deg) underline is a visual transform
 *          and renders identically in both directions.
 */
'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { cn } from '@/lib/cn'

const LINKS = [
  { href: '/shop', key: 'shop' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const

export function HeaderNavLinks() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <div className="g-nav-links">
      {LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`)
        return (
          <Link key={l.href} href={l.href} className={cn(active && 'is-active')}>
            {t(l.key)}
          </Link>
        )
      })}
    </div>
  )
}
