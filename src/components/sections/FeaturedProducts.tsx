/**
 * @file Featured products carousel (homepage)
 * @summary Server component that fetches featured products from Payload
 *          and renders them in a horizontally-scrollable grid.
 *
 *          Phase C+ polish: uses the newsletter-bg botanical wash as a
 *          very subtle background layer (per design review punchlist B3)
 *          and a serif SectionHeading with an eyebrow line.
 */
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
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
    <section className="relative overflow-hidden py-16">
      {/* Ambient botanical wash (reusing the unused newsletter-bg asset) */}
      <div className="absolute inset-0 -z-0 opacity-20" aria-hidden>
        <Image
          src="/brand/ai/newsletter-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)] via-transparent to-[var(--color-background)]" />
      </div>

      <Container className="relative">
        <div className="flex items-end justify-between mb-10">
          <SectionHeading
            eyebrow={t('featuredEyebrow')}
            title={t('featuredHeadline')}
            subheading={t('featuredSubheadline')}
            align="start"
          />
          <Button href="/shop" variant="ghost" size="md" className="hidden sm:inline-flex">
            {t('seeAll')} →
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} />
          ))}
        </div>
      </Container>
    </section>
  )
}
