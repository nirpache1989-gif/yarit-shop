/**
 * @file FeaturedProductsLivingGarden — Living Garden homepage
 *       "This week's harvest" grid.
 * @summary Server component. Queries Payload for `isFeatured = true`
 *          published products (same shape as the legacy
 *          FeaturedProducts.tsx), slices to the first 8, and renders
 *          a 4-column `.g-grid-4` of `ProductCardLivingGarden`.
 *
 *          The heading row sits in a `.g-row-between .g-reveal`
 *          so it fades in via the global RevealOnScroll adapter.
 *          Cards individually rely on GardenAlive's card parallax
 *          (cursor hover writes --mx/--my/--tx/--ty CSS custom
 *          properties on the `.g-card` element).
 *
 *          If the catalog has zero featured products, returns null
 *          (same as the legacy implementation).
 */
import { getTranslations } from 'next-intl/server'
import { Link } from '@/lib/i18n/navigation'
import { getPayloadClient } from '@/lib/payload'
import { ProductCardLivingGarden } from '@/components/product/ProductCardLivingGarden'
import type { ProductCardData } from '@/components/product/ProductCard'
import type { Locale } from '@/lib/i18n/routing'

type Props = {
  locale: Locale
}

type ProductWithCategory = ProductCardData & {
  category?: {
    title?: string
    slug?: string
  } | number | string | null
}

export async function FeaturedProductsLivingGarden({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.featured' })
  const payload = await getPayloadClient()

  const res = await payload.find({
    collection: 'products',
    where: {
      and: [
        { status: { equals: 'published' } },
        { isFeatured: { equals: true } },
      ],
    },
    depth: 1,
    limit: 12,
    locale,
  })

  const products = res.docs as unknown as ProductWithCategory[]
  if (products.length === 0) return null

  const featured = products.slice(0, 8)

  return (
    <section className="g-section g-wrap" data-section="featured">
      <div
        className="g-row-between g-reveal"
        style={{ alignItems: 'flex-end', marginBottom: 48 }}
      >
        <div>
          <span className="g-kicker">{t('kicker')}</span>
          <h2 className="g-h2" style={{ marginTop: 20 }}>
            <span>{t('title1')}</span>{' '}
            <em>{t('titleItalic')}</em>{' '}
            <span className="g-under">{t('title2')}</span>
          </h2>
          <p
            style={{
              color: 'var(--g-mute)',
              margin: '12px 0 0',
              maxWidth: 480,
            }}
          >
            {t('lead')}
          </p>
        </div>
        <Link href="/shop" className="g-btn g-btn-ghost">
          {t('seeAll')} →
        </Link>
      </div>

      <div className="g-grid-4">
        {featured.map((product, i) => {
          const category =
            product.category && typeof product.category === 'object'
              ? product.category
              : null
          const categoryLabel = category?.title
            ? category.title.toUpperCase()
            : undefined
          return (
            <ProductCardLivingGarden
              key={product.id}
              product={product}
              index={i}
              categoryLabel={categoryLabel}
              addLabel={t('cardAdd')}
            />
          )
        })}
      </div>
    </section>
  )
}
