/**
 * @file Featured products carousel (homepage)
 * @summary Server component that fetches featured products from Payload
 *          and hands them off to `<FeaturedProductsMotion>` (client).
 *
 *          Why the split: Tier-1 GSAP upgrade T1.4 pins the heading
 *          row to the viewport while cards scroll past it. That
 *          requires a coordinated ScrollTrigger that owns the whole
 *          section as a useGsapScope — which means a client component
 *          with DOM refs. Keeping the Payload fetch + translations in
 *          the server parent and passing already-resolved strings +
 *          data down honors the CLAUDE.md rule against passing
 *          function props from server to client components.
 *
 *          Same data-flow pattern as `Hero.tsx` → `HeroMotion.tsx`.
 *
 *          If the query returns zero featured products, we render
 *          nothing (same behavior as before the split).
 */
import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'
import { type ProductCardData } from '@/components/product/ProductCard'
import { FeaturedProductsMotion } from './FeaturedProductsMotion'
import type { Locale } from '@/lib/i18n/routing'

type Props = {
  locale: Locale
}

export async function FeaturedProducts({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home' })
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

  const products = res.docs as unknown as ProductCardData[]
  if (products.length === 0) return null

  return (
    <FeaturedProductsMotion
      products={products}
      eyebrow={t('featuredEyebrow')}
      headline={t('featuredHeadline')}
      subheadline={t('featuredSubheadline')}
      seeAllLabel={t('seeAll')}
    />
  )
}
