/**
 * @file Header — sticky site navigation (Living Garden chrome)
 * @summary Async server component that renders the new `.g-nav`
 *          Living Garden header. Keeps every existing integration
 *          (HeaderAccountLink, LanguageSwitcher, ThemeToggle,
 *          CartIcon, MobileNav, HeaderShrinkObserver) — only the
 *          visual shell and nav-list implementation change.
 *
 *          Wordmark: `{brand.name[locale]}<sup>°</sup>` — the
 *          degree mark is a signature Living Garden accent (Caveat
 *          in `--g-ember`; see `.g-nav-brand sup` in globals.css).
 *
 *          The `.g-nav` class intentionally omits its resting
 *          `background-color` — the scroll-scrubbed `#site-header`
 *          rule in globals.css owns bg alpha via
 *          `--header-scroll-progress` (written by the
 *          `HeaderShrinkObserver` client sibling mounted below).
 *
 *          Active-link underline is handled by the new
 *          `HeaderNavLinks` client subcomponent so this component
 *          can stay a server component (same pattern as Footer →
 *          FooterMotion).
 */
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { Link } from '@/lib/i18n/navigation'
import { brand } from '@/brand.config'
import { CartIcon } from '@/components/cart/CartIcon'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { HeaderAccountLink } from '@/components/layout/HeaderAccountLink'
import { MobileNav } from '@/components/layout/MobileNav'
import { HeaderShrinkObserver } from '@/components/layout/HeaderShrinkObserver'
import { HeaderNavLinks } from '@/components/layout/HeaderNavLinks'

export async function Header() {
  const locale = (await getLocale()) as 'he' | 'en'
  const wordmark = brand.name[locale] ?? brand.name.en

  return (
    <>
      {/* Client sibling — writes --header-scroll-progress + data-scrolled
          onto #site-header so globals.css rules can interpolate bg alpha
          and logo shrink smoothly as the user scrolls. */}
      <HeaderShrinkObserver />
      <header id="site-header" className="g-nav">
        <Link href="/" className="g-nav-brand">
          <span className="leaf-breathe">
            <Image
              src="/brand/copaia.png"
              alt={brand.name.en}
              width={48}
              height={72}
              priority
              className="h-8 w-auto object-contain"
            />
          </span>
          <span>{wordmark}</span>
          <sup>°</sup>
        </Link>

        <HeaderNavLinks />

        <div className="g-nav-right">
          <HeaderAccountLink />
          <LanguageSwitcher />
          <div className="hidden md:flex items-center">
            <ThemeToggle />
          </div>
          <CartIcon />
          <MobileNav accountSlot={<HeaderAccountLink variant="mobile" />} />
        </div>
      </header>
    </>
  )
}
