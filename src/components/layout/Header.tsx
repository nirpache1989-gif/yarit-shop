/**
 * @file Header — sticky site navigation
 * @summary Top bar with the Copaia logo, primary nav, cart icon,
 *          language switcher, and the customer account link.
 *
 *          Async server component because `HeaderAccountLink` calls
 *          `getCurrentUser()` to decide whether to show "Login" or
 *          "My account". The cart icon stays a client component
 *          (Zustand state); everything else is server-rendered.
 */
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/lib/i18n/navigation'
import { brand } from '@/brand.config'
import { Container } from '@/components/ui/Container'
import { CartIcon } from '@/components/cart/CartIcon'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { HeaderAccountLink } from '@/components/layout/HeaderAccountLink'
import { MobileNav } from '@/components/layout/MobileNav'
import { HeaderShrinkObserver } from '@/components/layout/HeaderShrinkObserver'

export async function Header() {
  const t = await getTranslations('nav')

  return (
    <>
      {/* Tier-1 upgrade T1.5: client sibling that watches window scroll
          and toggles `data-scrolled` on the header element below. The
          CSS in globals.css (`header#site-header[data-scrolled="true"]`)
          handles the shrink transition. No GSAP — plain useEffect +
          rAF throttled scroll listener. */}
      <HeaderShrinkObserver />
      <header
        id="site-header"
        className="sticky top-0 z-30 bg-[var(--color-surface-warm)]/92 backdrop-blur-sm border-b border-[var(--color-primary)]/15"
      >
        <Container className="h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-transform duration-300 ease-out hover:scale-[1.015]"
          >
            {/* The logo's little leaf breathes (5.5s scale loop).
                Transform origin is tuned so the leaf scales, not the
                whole wordmark. See .leaf-breathe in globals.css. */}
            <span className="leaf-breathe">
              <Image
                src="/brand/copaia.png"
                alt={brand.name.en}
                width={64}
                height={96}
                priority
                className="h-10 w-auto object-contain"
              />
            </span>
            <span
              className="text-xl md:text-2xl font-bold text-[var(--color-primary-dark)] hidden sm:inline transition-colors duration-300 group-hover:text-[var(--color-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {brand.name.he}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link href="/shop" className="nav-link text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors uppercase tracking-wider">
              {t('shop')}
            </Link>
            <Link href="/about" className="nav-link text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors uppercase tracking-wider">
              {t('about')}
            </Link>
            <Link href="/contact" className="nav-link text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors uppercase tracking-wider">
              {t('contact')}
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Desktop account link — hidden below sm (via HeaderAccountLink's
                own responsive classes). */}
            <HeaderAccountLink />
            {/* Language switcher — ALWAYS visible, every breakpoint.
                Moved out of the `hidden md:flex` group because mobile
                visitors (esp. Hebrew-default users wanting English)
                could not find it when it only lived inside the
                hamburger panel. Compact "עב / EN" takes minimal
                horizontal space. See 2026-04-11 mobile audit. */}
            <LanguageSwitcher />
            {/* Theme toggle stays desktop-only in the top bar — it's
                also mirrored inside the mobile hamburger panel so
                mobile users can still flip themes if they want. */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
            </div>
            {/* Cart is always visible (it's a quick-access shortcut). */}
            <CartIcon />
            {/* Hamburger + slide-in panel, visible only below md. The
                mobile account row is server-rendered so it stays aware
                of logged-in state without the client having to call
                getCurrentUser again. */}
            <MobileNav
              accountSlot={<HeaderAccountLink variant="mobile" />}
            />
          </div>
        </Container>
      </header>
    </>
  )
}
