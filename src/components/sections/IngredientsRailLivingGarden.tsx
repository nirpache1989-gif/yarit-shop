/**
 * @file IngredientsRailLivingGarden — Living Garden "Four ingredients
 *       we come back to" card rail.
 * @summary Server component. Pure i18n copy — no Payload schema for
 *          ingredients this session. Four `.g-ing` cards, each with
 *          a 46px italic Fraunces mark (decorative Latin initial
 *          that stays the same in HE), Fraunces name, and short
 *          description.
 *
 *          Reveals stagger 1 → 3 via `.g-reveal .g-reveal-delay-{1,
 *          2,3}` on each card. On hover cards lift and tilt -1° via
 *          the CSS rule in globals.css.
 */
import { getTranslations } from 'next-intl/server'

const INGREDIENTS = [
  { mark: 'a', nameKey: 'aloeName', descKey: 'aloeDesc' },
  { mark: 'h', nameKey: 'honeyName', descKey: 'honeyDesc' },
  { mark: 'p', nameKey: 'propolisName', descKey: 'propolisDesc' },
  { mark: 'o', nameKey: 'oliveName', descKey: 'oliveDesc' },
] as const

export async function IngredientsRailLivingGarden() {
  const t = await getTranslations('home.ingredients')

  return (
    <section className="g-section g-wrap" data-section="ingredients">
      <div className="g-reveal" style={{ textAlign: 'center' }}>
        <span className="g-kicker">{t('kicker')}</span>
        <h2 className="g-h2" style={{ marginTop: 20 }}>
          {t('title')}
        </h2>
      </div>

      <div className="g-ing-rail">
        {INGREDIENTS.map((ing, idx) => (
          <div
            key={ing.mark}
            className={`g-ing g-reveal g-reveal-delay-${(idx % 3) + 1}`}
          >
            <span className="g-ing-mark" aria-hidden="true">
              {ing.mark}
            </span>
            <h3 className="g-ing-name">{t(ing.nameKey)}</h3>
            <p className="g-ing-desc">{t(ing.descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
