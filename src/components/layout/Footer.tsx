/**
 * @file Footer — expanded 4-column footer
 * @summary Shop links, customer service links, information links,
 *          social icons, brand line, copyright. Uses `brand.config.ts`
 *          for contact details — unconfigured channels are hidden.
 */
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { Container } from '@/components/ui/Container'
import { brand } from '@/brand.config'

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-[var(--color-border-brand)] bg-[var(--color-background)]">
      <Container className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-primary-dark)] mb-3">
              {t('shop')}
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li><Link href="/shop" className="hover:text-[var(--color-primary-dark)]">{tNav('shop')}</Link></li>
              <li><Link href="/shop?brand=forever" className="hover:text-[var(--color-primary-dark)]">Forever Living</Link></li>
              <li><Link href="/shop?brand=independent" className="hover:text-[var(--color-primary-dark)]">{tNav('natural')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[var(--color-primary-dark)] mb-3">
              {t('customerService')}
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li><Link href="/contact" className="hover:text-[var(--color-primary-dark)]">{tNav('contact')}</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--color-primary-dark)]">{t('faq')}</Link></li>
              <li><Link href="/policies/shipping" className="hover:text-[var(--color-primary-dark)]">{t('shipping')}</Link></li>
              <li><Link href="/policies/returns" className="hover:text-[var(--color-primary-dark)]">{t('returns')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[var(--color-primary-dark)] mb-3">
              {t('information')}
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li><Link href="/about" className="hover:text-[var(--color-primary-dark)]">{tNav('about')}</Link></li>
              <li><Link href="/policies/privacy" className="hover:text-[var(--color-primary-dark)]">{t('privacy')}</Link></li>
              <li><Link href="/policies/terms" className="hover:text-[var(--color-primary-dark)]">{t('terms')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[var(--color-primary-dark)] mb-3">
              {t('social')}
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              {brand.social.instagram && (
                <li><a href={brand.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-dark)]">Instagram</a></li>
              )}
              {brand.social.facebook && (
                <li><a href={brand.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-dark)]">Facebook</a></li>
              )}
              {brand.social.tiktok && (
                <li><a href={brand.social.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-dark)]">TikTok</a></li>
              )}
              {brand.contact.whatsapp && (
                <li><a href={`https://wa.me/${brand.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-dark)]">WhatsApp</a></li>
              )}
              {brand.contact.email && (
                <li><a href={`mailto:${brand.contact.email}`} className="hover:text-[var(--color-primary-dark)]">{brand.contact.email}</a></li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--color-border-brand)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-lg font-bold text-[var(--color-primary-dark)]">
            {brand.name.en}
          </div>
          <div className="text-xs text-[var(--color-muted)]">
            © {year} {brand.name.en} — {t('allRightsReserved')}
          </div>
        </div>
      </Container>
    </footer>
  )
}
