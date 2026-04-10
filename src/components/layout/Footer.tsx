/**
 * @file Footer — editorial 4-column layout with botanical texture
 * @summary Wave 2 of the design round: added a subtle watercolor
 *          garland texture at the top of the footer (from Prompt 14 —
 *          `footer-garland.jpg`), converted to a 4-column editorial
 *          layout, added a quiet newsletter signup column with cream
 *          input + sage outline. No promo copy, no "10% off" carrot —
 *          premium wellness shops let customers come to the signup
 *          organically.
 *
 *          Uses `brand.config.ts` for contact details — unconfigured
 *          channels are hidden. All copy in `messages/{he,en}.json`
 *          under the `footer` namespace.
 */
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { NewsletterSignup } from '@/components/layout/NewsletterSignup'
import { brand } from '@/brand.config'

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 md:mt-24 border-t border-[var(--color-border-brand)] bg-[var(--color-background)] relative overflow-hidden">
      {/* Botanical garland texture at the top edge, very low opacity
          so it reads as a faint brand stamp rather than a graphic. */}
      {/* Styled by `.footer-garland` in globals.css so [data-theme="dark"]
          can override the blend mode — `multiply` goes nearly invisible
          on near-black backgrounds, so dark mode switches to `overlay`. */}
      <div className="footer-garland" aria-hidden />

      <Container className="relative py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div
              className="text-2xl font-bold text-[var(--color-primary-dark)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {brand.name.he}
            </div>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-xs">
              {t('brandBlurb')}
            </p>
          </div>

          {/* Shop column */}
          <div>
            <Eyebrow as="h3" className="mb-3">
              {t('shop')}
            </Eyebrow>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <Link href="/shop" className="hover:text-[var(--color-primary-dark)]">
                  {tNav('shop')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-primary-dark)]">
                  {tNav('contact')}
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-[var(--color-primary-dark)]">
                  {t('shipping')}
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-[var(--color-primary-dark)]">
                  {t('returns')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn column */}
          <div>
            <Eyebrow as="h3" className="mb-3">
              {t('information')}
            </Eyebrow>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <Link href="/about" className="hover:text-[var(--color-primary-dark)]">
                  {tNav('about')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[var(--color-primary-dark)]">
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-[var(--color-primary-dark)]">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-[var(--color-primary-dark)]">
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter signup column */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Eyebrow as="h3" tone="accent">
              {t('newsletterHeading')}
            </Eyebrow>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {t('newsletterBody')}
            </p>
            <NewsletterSignup />
          </div>
        </div>

        {/* Bottom strip — social + copyright */}
        <div className="pt-8 border-t border-[var(--color-border-brand)] flex flex-col md:flex-row items-center justify-between gap-4">
          <ul className="flex items-center gap-5 text-sm text-[var(--color-muted)]">
            {brand.social.instagram && (
              <li>
                <a
                  href={brand.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  Instagram
                </a>
              </li>
            )}
            {brand.social.facebook && (
              <li>
                <a
                  href={brand.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  Facebook
                </a>
              </li>
            )}
            {brand.social.tiktok && (
              <li>
                <a
                  href={brand.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  TikTok
                </a>
              </li>
            )}
            {brand.contact.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${brand.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  WhatsApp
                </a>
              </li>
            )}
          </ul>
          <div className="text-xs text-[var(--color-muted)]">
            © {year} {brand.name.en} — {t('allRightsReserved')}
          </div>
        </div>
      </Container>
    </footer>
  )
}
