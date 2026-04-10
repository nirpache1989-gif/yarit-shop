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
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/motion/Reveal'
import { StaggeredReveal } from '@/components/motion/StaggeredReveal'
import { KenBurns } from '@/components/motion/KenBurns'

type Props = {
  locale: Locale
}

export async function MeetYarit({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'meetYarit' })

  return (
    <section className="py-20 md:py-28 bg-[var(--color-surface-warm)]">
      <Container>
        <div className="grid md:grid-cols-5 gap-10 md:gap-12 items-center">
          {/* Image column — slides in from the start edge + a slow
              Ken Burns (br) loop on the photo itself so it drifts
              even when the viewport is still. */}
          <Reveal direction="start" as="div" className="md:col-span-2">
            <div className="relative aspect-[4/5] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-border-brand)]">
              <KenBurns variant="br">
                <Image
                  src="/brand/ai/about-hero.jpg"
                  alt={t('imageAlt')}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </KenBurns>
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/10 via-transparent to-transparent" />
            </div>
          </Reveal>

          {/* Text column — each line reveals one after another
              (eyebrow → heading → body → link). */}
          <StaggeredReveal
            as="div"
            className="md:col-span-3 space-y-5"
            stagger={140}
          >
            <Eyebrow as="p" tone="accent">
              {t('eyebrow')}
            </Eyebrow>
            <h2
              className="text-4xl md:text-5xl text-[var(--color-primary-dark)] leading-tight font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('heading')}
            </h2>
            <p
              className="text-lg md:text-xl text-[var(--color-foreground)]/80 leading-relaxed italic"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('body')}
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors uppercase"
            >
              {t('readMore')} <span aria-hidden>→</span>
            </Link>
          </StaggeredReveal>
        </div>
      </Container>
    </section>
  )
}
