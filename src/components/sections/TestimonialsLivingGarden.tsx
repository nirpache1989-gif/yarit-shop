/**
 * @file TestimonialsLivingGarden — Living Garden "From the garden
 *       notebook" testimonial grid.
 * @summary Server component. Three `.g-quote` cards with an
 *          oversized 96px Fraunces opening quote (CSS ::before),
 *          italic Fraunces body, and a small leaf-green avatar +
 *          name + city line.
 *
 *          All copy from `home.quotes.*` (three `{ text, who, where
 *          }` triples). Avatars are solid leaf circles for this
 *          session — real photos land in Phase 4 polish.
 */
import { getTranslations } from 'next-intl/server'

const QUOTE_KEYS = ['q1', 'q2', 'q3'] as const

export async function TestimonialsLivingGarden() {
  const t = await getTranslations('home.quotes')

  return (
    <section className="g-section g-wrap" data-section="quotes">
      <div className="g-reveal" style={{ marginBottom: 40 }}>
        <span className="g-kicker">{t('kicker')}</span>
      </div>

      <div className="g-grid-3">
        {QUOTE_KEYS.map((key, i) => (
          <div key={key} className={`g-quote g-reveal g-reveal-delay-${i + 1}`}>
            <p>{t(`${key}.text`)}</p>
            <div className="g-quote-author">
              <div className="g-quote-avatar" aria-hidden="true" />
              <div>
                <strong>{t(`${key}.who`)}</strong>
                <span>{t(`${key}.where`)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
