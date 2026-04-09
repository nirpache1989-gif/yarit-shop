/**
 * @file /product/[slug] — product detail page
 * @summary Single-product page with image gallery (primary + thumbs),
 *          title, price, short + full description, type badge, and
 *          an Add to Cart button. Fetches via `payload.find` with
 *          `where.slug` because slugs are unique.
 *
 *          404s if the slug doesn't match a published product.
 */
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { getPayloadClient } from '@/lib/payload'
import { routing, type Locale } from '@/lib/i18n/routing'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import type { ProductCardData } from '@/components/product/ProductCard'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

type ProductData = ProductCardData & {
  description?: unknown // Lexical JSON
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const typedLocale = locale as Locale

  const t = await getTranslations({ locale, namespace: 'product' })
  const payload = await getPayloadClient()

  const res = await payload.find({
    collection: 'products',
    where: {
      and: [
        { status: { equals: 'published' } },
        { slug: { equals: slug } },
      ],
    },
    depth: 2,
    limit: 1,
    locale: typedLocale,
  })

  const product = res.docs[0] as unknown as ProductData | undefined
  if (!product) notFound()

  const images =
    product.images?.map((i) => {
      const img = i.image
      if (img && typeof img === 'object' && img.url) {
        return { url: img.url, alt: img.alt ?? product.title }
      }
      return null
    }).filter((x): x is { url: string; alt: string } => x !== null) ?? []

  const priceText = formatPrice(product.price, typedLocale)
  const compareText = product.compareAtPrice
    ? formatPrice(product.compareAtPrice, typedLocale)
    : null

  return (
    <Container className="py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-brand)] overflow-hidden">
            {images[0] ? (
              <Image
                src={images[0].url}
                alt={images[0].alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-contain p-6"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--color-muted)]">
                —
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-brand)] overflow-hidden"
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="120px"
                    className="object-contain p-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {product.isNew && (
              <Badge tone="accent">{typedLocale === 'he' ? 'חדש' : 'New'}</Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary-dark)] leading-tight">
            {product.title}
          </h1>

          {product.shortDescription && (
            <p className="text-lg text-[var(--color-muted)]">
              {product.shortDescription}
            </p>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[var(--color-primary-dark)]">
              {priceText}
            </span>
            {compareText && (
              <span className="text-lg text-[var(--color-muted)] line-through">
                {compareText}
              </span>
            )}
          </div>

          <AddToCartButton product={product} size="lg" />

          {/* Full description (lexical richtext) — rendered as plain text */}
          {product.description ? (
            <div className="pt-6 border-t border-[var(--color-border-brand)] mt-6">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)] mb-3">
                {t('aboutThisProduct')}
              </h2>
              <LexicalText value={product.description} />
            </div>
          ) : null}
        </div>
      </div>
    </Container>
  )
}

// Minimal Lexical renderer — walks the tree and extracts text nodes.
// Enough for paragraph-only content produced by the seed script. Phase F
// will replace this with a proper Lexical serializer if we ever need
// bold/italics/links/lists in product descriptions.
function LexicalText({ value }: { value: unknown }) {
  const text = extractText(value)
  if (!text) return null
  return <p className="text-base text-[var(--color-foreground)] leading-relaxed whitespace-pre-wrap">{text}</p>
}

function extractText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { type?: string; text?: string; children?: unknown[] }
  if (n.type === 'text' && typeof n.text === 'string') return n.text
  if (Array.isArray(n.children)) {
    return n.children.map(extractText).join(n.type === 'paragraph' ? '\n' : '')
  }
  if ('root' in (n as object)) {
    return extractText((n as { root: unknown }).root)
  }
  return ''
}

function formatPrice(amount: number, locale: 'he' | 'en'): string {
  try {
    return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `₪${amount}`
  }
}
