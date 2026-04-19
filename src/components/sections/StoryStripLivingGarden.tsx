/**
 * @file StoryStripLivingGarden — Living Garden "One gardener, eight
 *       hundred kinds of patience" story strip.
 * @summary Server component. Two-column `.g-story-grid` with a
 *          cream-plate visual on the lead edge and a long-form body
 *          column on the trailing edge. The first paragraph picks up
 *          the 72px ember Fraunces drop cap purely via CSS
 *          (`.g-story-body p:first-of-type::first-letter` in
 *          globals.css — RTL-flipped via a `[dir="rtl"]` sibling
 *          rule).
 *
 *          No client behaviors — reveal-on-scroll is handled by the
 *          global `.g-reveal` adapter via RevealOnScroll.
 */
import { getTranslations } from 'next-intl/server'
import { Link } from '@/lib/i18n/navigation'

export async function StoryStripLivingGarden() {
  const t = await getTranslations('home.story')

  return (
    <section className="g-section g-wrap" data-section="story">
      <div className="g-story-grid">
        <div className="g-story-visual g-reveal">
          <div className="g-plate g-plate-cream" />
        </div>
        <div className="g-story-body g-reveal g-reveal-delay-1">
          <span className="g-kicker">{t('kicker')}</span>
          <h2 className="g-h2" style={{ margin: '22px 0 28px' }}>
            <span>{t('title1')}</span>{' '}
            <em>{t('titleItalic')}</em>{' '}
            <span>{t('title2')}</span>
          </h2>
          <p>{t('p1')}</p>
          <p>{t('p2')}</p>
          <Link
            href="/about"
            className="g-btn g-btn-ghost"
            style={{ marginTop: 16 }}
          >
            {t('readMore')} →
          </Link>
        </div>
      </div>
    </section>
  )
}
