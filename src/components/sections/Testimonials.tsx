/**
 * @file Testimonials — social proof strip
 * @summary 3 placeholder customer testimonials. All content comes from
 *          i18n — when Yarit wants to swap in real quotes, she edits
 *          `messages/he.json` and `en.json`. Phase G bonus: move these
 *          into Payload so she can add/remove via the admin panel.
 *
 *          See: docs/DECISIONS.md — design review punchlist F2.
 */
import { getTranslations } from 'next-intl/server'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Locale } from '@/lib/i18n/routing'

type Props = {
  locale: Locale
}

export async function Testimonials({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'testimonials' })

  const quotes: Array<{ name: string; city: string; quote: string }> = [
    { name: t('t1.name'), city: t('t1.city'), quote: t('t1.quote') },
    { name: t('t2.name'), city: t('t2.city'), quote: t('t2.quote') },
    { name: t('t3.name'), city: t('t3.city'), quote: t('t3.quote') },
  ]

  return (
    <section className="py-16 bg-[var(--color-surface)]/40">
      <Container>
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('heading')}
          subheading={t('subheading')}
          className="mb-10"
        />
        <ul className="grid md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <li
              key={i}
              className="relative rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-background)] p-6 flex flex-col gap-4"
            >
              {/* corner sprig flourish */}
              <svg
                className="absolute top-3 start-3 text-[var(--color-primary)]/30"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4 20 C 8 14, 14 10, 20 8" />
                <path d="M8 17 q 2 -4, 6 -5" />
              </svg>
              {/* stars */}
              <div className="flex gap-0.5 text-[var(--color-accent)] ps-8">
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg
                    key={si}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-base text-[var(--color-foreground)] leading-relaxed">
                &ldquo;{q.quote}&rdquo;
              </blockquote>
              <div className="mt-auto pt-2 border-t border-[var(--color-border-brand)]">
                <p className="text-sm font-bold text-[var(--color-primary-dark)]">
                  {q.name}
                </p>
                <p className="text-xs text-[var(--color-muted)]">{q.city}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
