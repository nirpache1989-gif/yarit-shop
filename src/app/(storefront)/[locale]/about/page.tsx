/**
 * @file /about — Yarit's personal story page
 * @summary Editorial-luxe about page. Wave B motion: full-bleed
 *          Ken Burns'd hero image, scroll-driven paragraph reveals,
 *          and an oversized serif pull quote. No new i18n keys —
 *          works entirely off the existing `about.*` translations
 *          shipped with F.1.
 *
 *          2026-04-10 trim pass: removed the mid-essay
 *          `about-hands.jpg` image callout per user feedback —
 *          it read as a duplicate of the hero image and made the
 *          page feel longer than needed. Page now goes
 *          hero → body paragraph → pull quote → back link.
 *
 *          Light-mode background stays on the storefront parchment;
 *          the hero illustration carries the seasonal/ambient tone.
 *          Dark mode gets the same treatment but the gradient
 *          overlay intensifies so the hero text stays readable.
 */
import type { Metadata } from 'next'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { routing } from '@/lib/i18n/routing'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/motion/Reveal'
import { KenBurns } from '@/components/motion/KenBurns'
import { AboutMotion } from '@/components/pages/AboutMotion'
// Note: `about-hands.jpg` image callout removed 2026-04-10 per user
// feedback (visually duplicated the hero image). File still lives in
// /public/brand/ai/ for potential reuse in future waves.

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return {
    title: t('title'),
    description: t('body'),
    alternates: {
      canonical: locale === 'he' ? '/about' : '/en/about',
      languages: { he: '/about', en: '/en/about' },
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

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <AboutContent />
}

function AboutContent() {
  const t = useTranslations('about')
  const tCommon = useTranslations('common')

  return (
    <>
      {/* Full-bleed hero — Ken Burns'd about-hero.jpg with a soft
          warm gradient overlay for text legibility. Lives outside
          the Container so it spans edge-to-edge. */}
      <section className="relative isolate overflow-hidden h-[56vh] min-h-[440px] md:h-[68vh] flex items-end">
        <KenBurns variant="bl">
          <Image
            src="/brand/ai/about-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </KenBurns>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_oklab,var(--color-background)_92%,transparent)] via-[color-mix(in_oklab,var(--color-background)_55%,transparent)] to-transparent"
        />
        <Container className="relative z-10 pb-16 md:pb-24">
          <div className="max-w-2xl space-y-4">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-accent-deep)]">
                {t('title')}
              </p>
            </Reveal>
            <Reveal delay={160}>
              <h1
                className="iridescent-heading text-4xl md:text-6xl font-extrabold text-[var(--color-primary-dark)] leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('heading')}
              </h1>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Body essay — GSAP ScrollTrigger reveals via AboutMotion */}
      <AboutMotion
        body={t('body')}
        heading={t('heading')}
        moreComingSoon={t('moreComingSoon')}
        backToHome={tCommon('backToHome')}
      />
    </>
  )
}
