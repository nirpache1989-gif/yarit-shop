/**
 * @file MeetYarit — small personal story strip
 * @summary 2-column strip with a cropped square of `about-hero.jpg`
 *          + a short handwritten-feel Hebrew/English paragraph and
 *          a text link to the About page.
 *
 *          Biggest "empty feeling" fix per the design review. Gives
 *          the homepage a human presence (Yarit) without committing
 *          to a full About section on the home page.
 *
 *          See: docs/DECISIONS.md — design review punchlist F1.
 */
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Container } from '@/components/ui/Container'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'

type Props = {
  locale: Locale
}

export async function MeetYarit({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'meetYarit' })

  return (
    <section className="py-16">
      <Container>
        <div className="grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-2">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-[var(--color-border-brand)]">
              <Image
                src="/brand/ai/about-hero.jpg"
                alt={t('imageAlt')}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/10 via-transparent to-transparent" />
            </div>
          </div>
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] font-semibold italic">
              {t('eyebrow')}
            </p>
            <h2
              className="text-3xl md:text-4xl text-[var(--color-primary-dark)] leading-tight font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('heading')}
            </h2>
            <p className="text-base md:text-lg text-[var(--color-muted)] leading-relaxed">
              {t('body')}
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors"
            >
              {t('readMore')} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
