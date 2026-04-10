/**
 * @file /shop — product listing page
 * @summary Full product grid with category + brand filter chips.
 *          Fetches products from Payload on the server with locale
 *          applied. Filter state is in the URL (?category=slug,
 *          ?brand=forever|independent) so it's bookmarkable and
 *          shareable.
 */
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Where } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import { routing, type Locale } from '@/lib/i18n/routing'
import { Container } from '@/components/ui/Container'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/cn'
import { Reveal } from '@/components/motion/Reveal'
import { StaggeredReveal } from '@/components/motion/StaggeredReveal'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'shop' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: locale === 'he' ? '/shop' : '/en/shop',
      languages: { he: '/shop', en: '/en/shop' },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale === 'he' ? 'he_IL' : 'en_US',
    },
  }
}

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}

type CategoryData = { id: number | string; slug: string; title: string }

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { category } = await searchParams
  setRequestLocale(locale)
  const typedLocale = locale as Locale

  const t = await getTranslations({ locale, namespace: 'shop' })
  const payload = await getPayloadClient()

  // Fetch categories for the filter chips
  const categoriesRes = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 20,
    sort: 'order',
    locale: typedLocale,
  })
  const categories = categoriesRes.docs as unknown as CategoryData[]

  // Build the product query
  // Note: the `type: forever | independent` discriminator exists on
  // Products but is NEVER exposed to customers as a filter. It's a
  // purely internal signal for fulfillment routing and stock tracking.
  const where: Where = {
    status: { equals: 'published' },
  }
  if (category) {
    const cat = categories.find((c) => c.slug === category)
    if (cat) where.category = { equals: cat.id }
  }

  const productsRes = await payload.find({
    collection: 'products',
    where,
    depth: 1,
    limit: 48,
    sort: '-createdAt',
    locale: typedLocale,
  })
  const products = productsRes.docs as unknown as ProductCardData[]

  return (
    <Container className="py-12 md:py-16">
      <Reveal as="header" className="mb-8">
        <h1
          className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary-dark)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('title')}
        </h1>
        <p className="mt-2 text-[var(--color-muted)] italic" style={{ fontFamily: 'var(--font-display)' }}>
          {t('subtitle', { count: productsRes.totalDocs })}
        </p>
      </Reveal>

      {/* Filter chips — categories only (brand filter removed post-rebrand) */}
      {categories.length > 0 && (
        <StaggeredReveal
          className="mb-10 flex flex-wrap gap-2"
          stagger={70}
        >
          <FilterChip
            href="/shop"
            active={!category}
            label={t('filterAll')}
          />
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              href={`/shop?category=${c.slug}`}
              active={category === c.slug}
              label={c.title}
            />
          ))}
        </StaggeredReveal>
      )}

      {products.length === 0 ? (
        <Reveal>
          <p className="py-16 text-center text-[var(--color-muted)] italic" style={{ fontFamily: 'var(--font-display)' }}>
            {t('empty')}
          </p>
        </Reveal>
      ) : (
        <StaggeredReveal
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          stagger={80}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} locale={typedLocale} />
          ))}
        </StaggeredReveal>
      )}
    </Container>
  )
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 btn-lift',
        active
          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md'
          : 'bg-[var(--color-surface)] border-[var(--color-border-brand)] text-[var(--color-primary-dark)] hover:border-[var(--color-primary)] hover:-translate-y-0.5',
      )}
    >
      {label}
    </Link>
  )
}
