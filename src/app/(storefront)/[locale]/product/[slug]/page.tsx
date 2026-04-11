/**
 * @file /product/[slug] — product detail page
 * @summary Single-product page with image gallery (primary + thumbs),
 *          title, price, short + full description, type badge, and
 *          an Add to Cart button. Fetches via `payload.find` with
 *          `where.slug` because slugs are unique.
 *
 *          404s if the slug doesn't match a published product.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { getPayloadClient } from '@/lib/payload'
import { type Locale } from '@/lib/i18n/routing'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import type { ProductCardData } from '@/components/product/ProductCard'
import { STATIC_IMAGE_OVERRIDES } from '@/lib/product-image'
import { Reveal } from '@/components/motion/Reveal'
import { StaggeredReveal } from '@/components/motion/StaggeredReveal'
import { ProductGalleryMotion } from '@/components/product/ProductGalleryMotion'

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarit-shop.vercel.app'
).replace(/\/+$/, '')

// Intentionally NO `generateStaticParams`. Declaring it with just
// `{locale}` (no slug) pins the route to `●` SSG in Next 16, which
// then bails out with DYNAMIC_SERVER_USAGE at runtime because
// next-intl's `setRequestLocale` reaches `headers()` inside the
// static-generation context. Without a real prerender list (i.e.
// every published slug), this function was strictly harmful. The
// route is now dynamic per request (`ƒ`), which matches the intent:
// products change via the admin panel and never needed prerendering.
// See 2026-04-11 post-deploy incident notes in docs/STATE.md.

async function loadProduct(locale: Locale, slug: string) {
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
    locale,
  })
  return res.docs[0] as unknown as ProductData | undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = locale as Locale
  const product = await loadProduct(typedLocale, slug)
  if (!product) {
    return { title: 'Not found' }
  }

  const description =
    product.shortDescription ??
    (locale === 'he'
      ? 'מוצר מתוך החנות של שורש'
      : 'A product from the Shoresh shop')

  const staticOverride = STATIC_IMAGE_OVERRIDES[product.slug]
  const mediaImages =
    product.images?.map((i) => {
      const img = i.image
      if (img && typeof img === 'object' && img.url) return img.url
      return null
    }).filter((x): x is string => x !== null) ?? []
  const imageUrl = staticOverride ?? mediaImages[0]
  const absoluteImage = imageUrl
    ? imageUrl.startsWith('http')
      ? imageUrl
      : `${SITE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    : undefined

  const canonical =
    locale === 'he' ? `/product/${slug}` : `/en/product/${slug}`

  return {
    title: product.title,
    description,
    alternates: {
      canonical,
      languages: {
        he: `/product/${slug}`,
        en: `/en/product/${slug}`,
      },
    },
    openGraph: {
      title: product.title,
      description,
      type: 'website',
      locale: locale === 'he' ? 'he_IL' : 'en_US',
      images: absoluteImage ? [{ url: absoluteImage }] : undefined,
    },
  }
}

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

type ProductData = ProductCardData & {
  description?: unknown // Lexical JSON
  stock?: number | null
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const typedLocale = locale as Locale

  const t = await getTranslations({ locale, namespace: 'product' })
  const product = await loadProduct(typedLocale, slug)
  if (!product) notFound()

  // If this product has a static slug override, use it as the
  // primary gallery image — otherwise fall through to the Media
  // collection URLs. Keeps the product detail page in sync with the
  // shop grid (both render via /brand/ai/…).
  const staticOverride = STATIC_IMAGE_OVERRIDES[product.slug]
  const mediaImages =
    product.images?.map((i) => {
      const img = i.image
      if (img && typeof img === 'object' && img.url) {
        return { url: img.url, alt: img.alt ?? product.title }
      }
      return null
    }).filter((x): x is { url: string; alt: string } => x !== null) ?? []
  const images = staticOverride
    ? [{ url: staticOverride, alt: product.title }]
    : mediaImages

  const priceText = formatPrice(product.price, typedLocale)
  const compareText = product.compareAtPrice
    ? formatPrice(product.compareAtPrice, typedLocale)
    : null

  // schema.org Product JSON-LD — helps Google render rich snippets
  // (price, availability, image) in search results. Keeping it small
  // and on-page avoids Next's `script` component and keeps the
  // hydration footprint zero.
  const primaryImage = images[0]?.url
  const absoluteImage = primaryImage
    ? primaryImage.startsWith('http')
      ? primaryImage
      : `${SITE_URL}${primaryImage.startsWith('/') ? '' : '/'}${primaryImage}`
    : undefined
  const inStock =
    product.type === 'forever'
      ? true // Forever products are sourced on demand
      : (product.stock ?? 0) > 0
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription ?? undefined,
    image: absoluteImage ? [absoluteImage] : undefined,
    sku: product.slug,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ILS',
      price: String(product.price),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}${
        typedLocale === 'he' ? '' : '/en'
      }/product/${product.slug}`,
    },
  }

  return (
    <Container className="py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery — Tier-1 upgrade T1.7. ProductGalleryMotion (client)
            owns the main image viewport, the thumb row, the hover zoom,
            and the thumb-click Flip morph. The server parent still
            resolves the images array from Payload / static overrides
            and passes a plain {url, alt}[] prop across the boundary. */}
        <Reveal direction="start">
          <ProductGalleryMotion images={images} title={product.title} />
        </Reveal>

        {/* Info — every piece reveals in order: badges, title, short
            description, price row, CTA, full description. */}
        <StaggeredReveal as="div" className="space-y-5" stagger={130}>
          <div className="flex flex-wrap gap-2">
            {product.isNew && (
              <Badge tone="accent">{typedLocale === 'he' ? 'חדש' : 'New'}</Badge>
            )}
          </div>

          <h1
            className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary-dark)] leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {product.title}
          </h1>

          {product.shortDescription && (
            <p
              className="text-lg text-[var(--color-muted)] italic leading-relaxed"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {product.shortDescription}
            </p>
          )}

          <div className="flex items-baseline gap-3 pt-2 border-t border-[var(--color-primary)]/15">
            <span
              className="text-3xl font-bold text-[var(--color-primary-dark)] tabular-nums"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {priceText}
            </span>
            {compareText && (
              <span className="text-lg text-[var(--color-muted)] line-through italic tabular-nums">
                {compareText}
              </span>
            )}
          </div>

          <AddToCartButton product={product} size="lg" />

          {/* Full description (lexical richtext) — rendered as plain text */}
          {product.description ? (
            <div className="pt-6 border-t border-[var(--color-border-brand)] mt-6">
              <h2
                className="text-xl font-bold text-[var(--color-primary-dark)] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('aboutThisProduct')}
              </h2>
              <LexicalText value={product.description} />
            </div>
          ) : null}
        </StaggeredReveal>
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
