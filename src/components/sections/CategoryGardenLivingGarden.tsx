/**
 * @file CategoryGardenLivingGarden — Living Garden "Browse the
 *       garden" 5-tile category grid.
 * @summary Server component. Fetches the Payload category list
 *          sorted by `order`, batches a per-category count query so
 *          each tile can render `№ 0X items`, and maps each slug to
 *          its prototype flower glyph (falls back to ❦ for any new
 *          category). Rendered as a `.g-cats` 5-col grid of `.g-cat`
 *          tiles that reveal on scroll via the global
 *          `.g-reveal`-based adapter.
 */
import { getTranslations } from 'next-intl/server'
import { Link } from '@/lib/i18n/navigation'
import { getPayloadClient } from '@/lib/payload'
import type { Locale } from '@/lib/i18n/routing'

type Props = {
  locale: Locale
}

type CategoryData = {
  id: number | string
  slug: string
  title: string
}

const CATEGORY_ICONS: Record<string, string> = {
  nutrition: '✿',
  skincare: '❀',
  aloe: '❦',
  beauty: '✾',
  gifts: '❧',
}

const FALLBACK_ICON = '❦'

export async function CategoryGardenLivingGarden({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.categoryGarden' })
  const payload = await getPayloadClient()

  const catsRes = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 6,
    sort: 'order',
    locale,
  })

  const categories = catsRes.docs as unknown as CategoryData[]
  if (categories.length === 0) return null

  // Live product count per category — one cheap count query per tile,
  // batched in parallel so the round trip is a single promise wait.
  const counts = await Promise.all(
    categories.map((c) =>
      payload.count({
        collection: 'products',
        where: {
          and: [
            { status: { equals: 'published' } },
            { category: { equals: c.id } },
          ],
        },
      }),
    ),
  )

  const itemsLabel = t('itemsLabel')

  return (
    <section className="g-section g-wrap" data-section="categories">
      <div className="g-reveal">
        <span className="g-kicker">{t('kicker')}</span>
        <h2 className="g-h2" style={{ marginTop: 20 }}>
          {t('title')}
        </h2>
      </div>

      <div className="g-cats">
        {categories.map((c, i) => {
          const count = counts[i]?.totalDocs ?? 0
          const icon = CATEGORY_ICONS[c.slug] ?? FALLBACK_ICON
          return (
            <Link
              key={c.id}
              href={{ pathname: '/shop', query: { cat: c.slug } }}
              className="g-cat g-reveal"
            >
              <div>
                <div className="g-cat-count">
                  № {String(count).padStart(2, '0')} {itemsLabel}
                </div>
                <div className="g-cat-name" style={{ marginTop: 6 }}>
                  {c.title}
                </div>
              </div>
              <span className="g-cat-icon" aria-hidden="true">
                {icon}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
