/**
 * @file /contact — placeholder contact page
 * @summary Shows contact methods (WhatsApp, email, phone) pulled from
 *          brand.config.ts. Each link is rendered only when the
 *          corresponding contact value is set — an unconfigured
 *          channel just isn't shown.
 *
 *          Phase F will add a real contact form that pipes into
 *          Resend for email delivery.
 */
import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

import { brand } from '@/brand.config'
import { routing } from '@/lib/i18n/routing'
import { Link } from '@/lib/i18n/navigation'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ContactContent />
}

function ContactContent() {
  const t = useTranslations('contact')
  const { whatsapp, email, phone } = brand.contact

  return (
    <section className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary-dark)]">
        {t('title')}
      </h1>
      <h2 className="text-xl md:text-2xl text-[var(--color-primary)]">
        {t('heading')}
      </h2>
      <p className="text-base md:text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed">
        {t('body')}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            {t('whatsapp')}
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="rounded-full border border-[var(--color-border-brand)] bg-[var(--color-surface)] px-6 py-3 text-sm text-[var(--color-accent-deep)] hover:border-[var(--color-primary)] transition-colors"
          >
            {t('email')}
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="rounded-full border border-[var(--color-border-brand)] bg-[var(--color-surface)] px-6 py-3 text-sm text-[var(--color-accent-deep)] hover:border-[var(--color-primary)] transition-colors"
          >
            {t('phone')}
          </a>
        )}
      </div>

      <p className="mt-4 text-sm text-[var(--color-muted)]">{t('comingSoon')}</p>

      <Link
        href="/"
        className="mt-2 text-sm text-[var(--color-accent-deep)] underline"
      >
        ←
      </Link>
    </section>
  )
}
