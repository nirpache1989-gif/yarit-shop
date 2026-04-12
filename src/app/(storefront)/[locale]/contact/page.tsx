/**
 * @file /contact — contact methods page
 * @summary Shows contact methods (WhatsApp, email, phone) pulled from
 *          SiteSettings. Server shell resolves translations + settings,
 *          delegates layout + GSAP animation to ContactMotion (client).
 *
 *          GSAP upgrade S4: header cascade, card stagger with scale
 *          entrance, icon glow pulse, closing quote + back link reveal.
 */
import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { routing } from '@/lib/i18n/routing'
import { getResolvedSiteSettings } from '@/lib/siteSettings'
import { ContactMotion } from '@/components/pages/ContactMotion'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  return {
    title: t('title'),
    description: t('body'),
    alternates: {
      canonical: locale === 'he' ? '/contact' : '/en/contact',
      languages: { he: '/contact', en: '/en/contact' },
    },
    openGraph: {
      title: t('heading'),
      description: t('body'),
      type: 'website',
      locale: locale === 'he' ? 'he_IL' : 'en_US',
    },
  }
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const settings = await getResolvedSiteSettings()
  return (
    <ContactContent
      whatsapp={settings.contact.whatsapp}
      email={settings.contact.email}
      phone={settings.contact.phone}
    />
  )
}

type ContactContentProps = {
  whatsapp: string
  email: string
  phone: string
}

function ContactContent({ whatsapp, email, phone }: ContactContentProps) {
  const t = useTranslations('contact')
  const tCommon = useTranslations('common')

  return (
    <ContactMotion
      title={t('title')}
      heading={t('heading')}
      body={t('body')}
      comingSoon={t('comingSoon')}
      backToHome={tCommon('backToHome')}
      whatsappLabel={t('whatsapp')}
      emailLabel={t('email')}
      phoneLabel={t('phone')}
      whatsapp={whatsapp}
      email={email}
      phone={phone}
    />
  )
}
