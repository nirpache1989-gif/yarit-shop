/**
 * @file Footer — server shell that resolves translations + settings
 * @summary Delegates the full layout + GSAP scroll-reveal animation to
 *          `FooterMotion` (client). Same server→client split pattern as
 *          MeetYarit.tsx / MeetYaritMotion.tsx.
 *
 *          The garland botanical texture, 4-column grid, and bottom
 *          strip now animate in via GSAP ScrollTrigger instead of the
 *          previous IntersectionObserver-backed `<Reveal>` wrappers.
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
      newsletterHeading={t('newsletterHeading')}
      newsletterBody={t('newsletterBody')}
      allRightsReserved={t('allRightsReserved')}
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
