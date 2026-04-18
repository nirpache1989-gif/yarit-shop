/**
 * @file Footer — server shell that resolves translations + settings
 * @summary Delegates the full layout + GSAP scroll-reveal animation to
 *          `FooterMotion` (client). Same server→client split pattern as
 *          MeetYarit.tsx / MeetYaritMotion.tsx.
 *
 *          Living Garden chrome: the visual shell is a 5-column dark
 *          ink grid (see `.g-footer` in globals.css). The GSAP
 *          ScrollTrigger timeline (garland fade + column stagger +
 *          bottom strip delay) is preserved inside FooterMotion.
 *
 *          Placeholder guards: `getResolvedSiteSettings` strips any
 *          contact / social field whose value is a known placeholder
 *          so the FooterMotion client only sees "real" values. Empty
 *          strings skip rendering the corresponding link entirely.
 */
import { getLocale, getTranslations } from 'next-intl/server'
import { brand } from '@/brand.config'
import { getResolvedSiteSettings } from '@/lib/siteSettings'
import { FooterMotion } from './FooterMotion'

export async function Footer() {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')
  const locale = (await getLocale()) as 'he' | 'en'
  const settings = await getResolvedSiteSettings()

  return (
    <FooterMotion
      brandName={brand.name[locale] ?? brand.name.he}
      brandBlurb={t('brandBlurb')}
      shopLabel={t('shop')}
      shopLinkLabel={tNav('shop')}
      contactLinkLabel={tNav('contact')}
      infoLabel={t('information')}
      aboutLinkLabel={tNav('about')}
      supportLabel={t('support')}
      newsletterHeading={t('newsletterHeading')}
      newsletterBody={t('newsletterBody')}
      allRightsReserved={t('allRightsReserved')}
      madeSlowlyLabel={t('madeSlowly')}
      social={{
        instagram: settings.social.instagram,
        facebook: settings.social.facebook,
        tiktok: settings.social.tiktok,
      }}
      whatsapp={settings.contact.whatsapp}
      year={new Date().getFullYear()}
    />
  )
}
