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
 *          2026-04-11 late QA: fetches SiteSettings via the shared
 *          `getResolvedSiteSettings` helper and uses those values for
 *          social links + WhatsApp. Falls back to `brand.config.ts`
 *          only for fields Yarit hasn't filled in yet. This fixes the
 *          public footer showing `hello@copaia.example` (the brand
 *          config placeholder) after Yarit had already set her real
 *          email in `/admin/globals/site-settings`.
 *
 *          All copy in `messages/{he,en}.json` under the `footer`
 *          namespace.
 */
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/lib/i18n/navigation'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { NewsletterSignup } from '@/components/layout/NewsletterSignup'
import { Reveal } from '@/components/motion/Reveal'
import { brand } from '@/brand.config'
import { getResolvedSiteSettings } from '@/lib/siteSettings'

export async function Footer() {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')
  const locale = (await getLocale()) as 'he' | 'en'
  const settings = await getResolvedSiteSettings()
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
        {/* Tier-2 T2.2: wrap the 4-column footer grid in a Reveal so it
            fades up as the user reaches the bottom of the page. Uses
            the IntersectionObserver-backed Reveal primitive (not GSAP)
            so it's immune to the ScrollTrigger initialization bug that
            affected the 2026-04-11 hotfix (see 027ebda). */}
        <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div
              className="text-2xl font-bold text-[var(--color-primary-dark)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {brand.name[locale] ?? brand.name.he}
            </div>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-xs">
              {t('brandBlurb')}
            </p>
          </div>

          {/* Shop column. We used to link to /policies/shipping and
              /policies/returns here, but those pages don't exist yet
              (blocked on legal content per docs/NEXT-SESSION.md) and
              a live 404 in the public footer is worse than no link.
              Re-add those entries once the pages ship. */}
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
            </ul>
          </div>

          {/* Learn column. Same story — /faq, /policies/privacy, and
              /policies/terms were removed until the content exists.
              "About" stays because /about is a real page. */}
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
        </Reveal>

        {/* Bottom strip — social + copyright — revealed 180ms after the
            grid above so the two rows arrive in a small cascade. */}
        <Reveal
          delay={180}
          className="pt-8 border-t border-[var(--color-border-brand)] flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <ul className="flex items-center gap-5 text-sm text-[var(--color-muted)]">
            {settings.social.instagram && (
              <li>
                <a
                  href={settings.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  Instagram
                </a>
              </li>
            )}
            {settings.social.facebook && (
              <li>
                <a
                  href={settings.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  Facebook
                </a>
              </li>
            )}
            {settings.social.tiktok && (
              <li>
                <a
                  href={settings.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  TikTok
                </a>
              </li>
            )}
            {settings.contact.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${settings.contact.whatsapp}`}
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
            © {year} {brand.name[locale] ?? brand.name.en} — {t('allRightsReserved')}
          </div>
        </Reveal>
      </Container>
    </footer>
  )
}
