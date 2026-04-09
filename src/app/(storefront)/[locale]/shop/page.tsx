/**
 * @file /shop — product listing page
 * @summary Full product grid with category + brand filter chips.
 *          Fetches products from Payload on the server with locale
 *          applied. Filter state is in the URL (?category=slug,
 *          ?brand=forever|independent) so it's bookmarkable and
 *          shareable.
 */
import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Where } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import { routing, type Locale } from '@/lib/i18n/routing'
import { Container } from '@/components/ui/Container'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/cn'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; brand?: string }>
}

type CategoryData = { id: number | string; slug: string; title: string }

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { category, brand } = await searchParams
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
  const where: Where = {
    status: { equals: 'published' },
  }
  if (category) {
    const cat = categories.find((c) => c.slug === category)
    if (cat) where.category = { equals: cat.id }
  }
  if (brand === 'forever' || brand === 'independent') {
    where.type = { equals: brand }
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
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary-dark)]">
          {t('title')}
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          {t('subtitle', { count: productsRes.totalDocs })}
        </p>
      </header>

      {/* Filter chips — brand */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip
          href="/shop"
          active={!brand && !category}
          label={t('filterAll')}
        />
        <FilterChip
          href="/shop?brand=forever"
          active={brand === 'forever'}
          label="Forever"
        />
        <FilterChip
          href="/shop?brand=independent"
          active={brand === 'independent'}
          label={t('filterIndependent')}
        />
      </div>

      {/* Filter chips — categories */}
      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              href={`/shop?category=${c.slug}`}
              active={category === c.slug}
              label={c.title}
            />
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="py-16 text-center text-[var(--color-muted)]">
          {t('empty')}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} locale={typedLocale} />
          ))}
        </div>
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
        'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
        active
          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
          : 'bg-[var(--color-surface)] border-[var(--color-border-brand)] text-[var(--color-primary-dark)] hover:border-[var(--color-primary)]',
      )}
    >
      {label}
    </Link>
  )
}
