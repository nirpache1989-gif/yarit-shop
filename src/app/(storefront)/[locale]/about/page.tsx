/**
 * @file /about — Yarit's personal story page
 * @summary Editorial-luxe about page. Wave B motion: full-bleed
 *          Ken Burns'd hero image, scroll-driven paragraph reveals,
 *          an image callout between paragraphs, and an oversized
 *          serif pull quote. No new i18n keys — works entirely off
 *          the existing `about.*` translations shipped with F.1.
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
import { Link } from '@/lib/i18n/navigation'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/motion/Reveal'
import { KenBurns } from '@/components/motion/KenBurns'

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

      {/* Body essay */}
      <Container className="py-16 md:py-24 max-w-3xl space-y-16">
        <Reveal>
          <p
            className="text-lg md:text-xl text-[var(--color-primary-dark)] leading-[1.85] first-letter:text-5xl first-letter:font-extrabold first-letter:text-[var(--color-primary)] first-letter:me-2 first-letter:float-start first-letter:leading-none first-letter:mt-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('body')}
          </p>
        </Reveal>

        {/* Image callout — about-hands with a slower Ken Burns */}
        <Reveal delay={100}>
          <figure className="relative overflow-hidden rounded-3xl border border-[var(--color-border-brand)] aspect-[16/9] shadow-[0_24px_60px_-30px_rgba(24,51,41,0.35)]">
            <KenBurns variant="tr">
              <Image
                src="/brand/ai/about-hands.jpg"
                alt=""
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
              />
            </KenBurns>
          </figure>
        </Reveal>

        {/* Pull quote — oversized italic serif, reuses the heading
            as an editorial restatement of the brand promise. */}
        <Reveal delay={120}>
          <blockquote className="relative text-center py-6 md:py-10">
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 mx-auto h-px w-24 bg-[var(--color-primary)]/50"
            />
            <p
              className="text-2xl md:text-4xl italic text-[var(--color-primary-dark)] leading-[1.4]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              &ldquo;{t('heading')}&rdquo;
            </p>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 mx-auto h-px w-24 bg-[var(--color-primary)]/50"
            />
          </blockquote>
        </Reveal>

        {/* More coming soon — tiny sparkle, gentle fade in */}
        <Reveal delay={140}>
          <p className="text-center text-sm text-[var(--color-accent-deep)] italic">
            {t('moreComingSoon')}
          </p>
        </Reveal>

        {/* Back link — accessible name stays the same as Wave B4 */}
        <Reveal delay={200}>
          <div className="flex justify-center pt-4">
            <Link
              href="/"
              className="btn-lift inline-flex items-center gap-2 rounded-full border border-[var(--color-border-brand)] bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-dark)] hover:border-[var(--color-primary)] transition-colors"
              aria-label={tCommon('backToHome')}
            >
              <span aria-hidden>←</span>
              <span>{tCommon('backToHome')}</span>
            </Link>
          </div>
        </Reveal>
      </Container>
    </>
  )
}
