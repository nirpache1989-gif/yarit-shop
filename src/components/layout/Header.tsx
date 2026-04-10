/**
 * @file Header — sticky site navigation
 * @summary Top bar with the Shoresh logo, primary nav, cart icon,
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

export async function Header() {
  const t = await getTranslations('nav')

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-surface-warm)]/92 backdrop-blur-sm border-b border-[var(--color-primary)]/15">
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
              src="/brand/logo.png"
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
          {/* Desktop-only utilities — below md they live inside the
              mobile panel instead. */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
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
  )
}
