/**
 * @file /about — minimal brand story page
 * @summary Placeholder "About" page with a short brand story. Phase F
 *          will expand this with Yarit's personal story, a photo,
 *          Forever Living background, and trust signals.
 */
import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

import { routing } from '@/lib/i18n/routing'
import { Link } from '@/lib/i18n/navigation'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <AboutContent />
}

function AboutContent() {
  const t = useTranslations('about')

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
      <p className="mt-2 text-sm text-[var(--color-accent-deep)]">
        {t('moreComingSoon')}
      </p>
      <Link
        href="/"
        className="mt-4 rounded-full border border-[var(--color-border-brand)] bg-[var(--color-surface)] px-6 py-3 text-sm text-[var(--color-accent-deep)] hover:border-[var(--color-primary)] transition-colors"
      >
        ←
      </Link>
    </section>
  )
}
