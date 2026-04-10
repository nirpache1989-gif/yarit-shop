/**
 * @file Header — sticky site navigation
 * @summary Top bar with the Shoresh logo, primary nav, cart icon,
 *          and language switcher. Uses the transparent logo.png so
 *          it sits cleanly against the parchment background.
 *
 *          The cart icon is a client component (needs access to
 *          Zustand state); everything else is a server component.
 */
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { brand } from '@/brand.config'
import { Container } from '@/components/ui/Container'
import { CartIcon } from '@/components/cart/CartIcon'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export function Header() {
  const t = useTranslations('nav')

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-surface-warm)]/92 backdrop-blur-sm border-b border-[var(--color-primary)]/15">
      <Container className="h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logo.png"
            alt={brand.name.en}
            width={64}
            height={96}
            priority
            className="h-10 w-auto object-contain"
          />
          <span
            className="text-xl md:text-2xl font-bold text-[var(--color-primary-dark)] hidden sm:inline"
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
          <LanguageSwitcher />
          <ThemeToggle />
          <CartIcon />
        </div>
      </Container>
    </header>
  )
}
