/**
 * @file Forever Living spotlight section
 * @summary Visually distinct section promoting Yarit's Forever Living
 *          catalog. Watercolor background at 45% opacity (design review
 *          E2: deepened from 30% for more distinction from other
 *          sections). Uses SectionHeading with a serif title.
 */
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
import type { Locale } from '@/lib/i18n/routing'

type Props = {
  locale: Locale
}

export async function ForeverSpotlight({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home' })
  const payload = await getPayloadClient()

  const res = await payload.find({
    collection: 'products',
    where: {
      and: [
        { status: { equals: 'published' } },
        { type: { equals: 'forever' } },
      ],
    },
    depth: 1,
    limit: 4,
    locale,
    sort: '-createdAt',
  })

  const products = res.docs as unknown as ProductCardData[]
  if (products.length === 0) return null

  return (
    <section className="relative overflow-hidden py-20 border-y border-[var(--color-border-brand)]">
      {/* Background wash — deepened opacity per design review E2 */}
      <div className="absolute inset-0 -z-0 opacity-45" aria-hidden>
        <Image
          src="/brand/ai/forever-spotlight-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)]/70 via-[var(--color-background)]/30 to-[var(--color-background)]/70" />
      </div>

      <Container className="relative">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1 space-y-4">
            <span className="inline-flex items-center rounded-full bg-[var(--color-accent)]/20 px-3 py-1 text-xs font-bold text-[var(--color-accent-deep)] uppercase tracking-wider">
              Forever Living
            </span>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl leading-tight font-bold text-[var(--color-primary-dark)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('foreverHeadline')}
            </h2>
            <p className="text-base text-[var(--color-muted)] leading-relaxed">
              {t('foreverBody')}
            </p>
            <Button href="/shop?brand=forever" variant="primary" size="md">
              {t('foreverCta')}
            </Button>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
