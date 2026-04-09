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

export function Header() {
  const t = useTranslations('nav')

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-background)]/90 backdrop-blur-sm border-b border-[var(--color-border-brand)]">
      <Container className="py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logo.png"
            alt={brand.name.en}
            width={64}
            height={96}
            priority
            className="h-12 w-auto object-contain"
          />
          <span className="text-xl md:text-2xl font-bold text-[var(--color-primary-dark)] hidden sm:inline">
            {brand.name.he}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link href="/shop" className="nav-link text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
            {t('shop')}
          </Link>
          <Link href="/shop?brand=forever" className="nav-link text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
            {t('forever')}
          </Link>
          <Link href="/shop?brand=independent" className="nav-link text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
            {t('natural')}
          </Link>
          <Link href="/about" className="nav-link text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
            {t('about')}
          </Link>
          <Link href="/contact" className="nav-link text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
            {t('contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <LanguageSwitcher />
          <CartIcon />
        </div>
      </Container>
    </header>
  )
}
