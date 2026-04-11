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
import { Reveal } from '@/components/motion/Reveal'
import { StaggeredReveal } from '@/components/motion/StaggeredReveal'
import { ProductGalleryMotion } from '@/components/product/ProductGalleryMotion'
import { formatILS } from '@/lib/format'

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
      ? 'מוצר מתוך החנות של קופאה'
      : 'A product from the Copaia shop')

  // 2026-04-11 Copaia catalog: STATIC_IMAGE_OVERRIDES is gone. Use
  // the first Media URL directly for OG metadata.
  const mediaImages =
    product.images?.map((i) => {
      const img = i.image
      if (img && typeof img === 'object' && img.url) return img.url
      return null
    }).filter((x): x is string => x !== null) ?? []
  const imageUrl = mediaImages[0]
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

  // 2026-04-11 Copaia catalog: STATIC_IMAGE_OVERRIDES is gone.
  // Every product now has 2-3 real Media images. The gallery gets
  // the full list; the JSON-LD `image` field also gets the full
  // list per Google Rich Results' recommendation for Product schema.
  const images: { url: string; alt: string }[] =
    product.images?.flatMap((i) => {
      const img = i.image
      if (img && typeof img === 'object' && img.url) {
        return [{ url: img.url, alt: img.alt ?? product.title }]
      }
      return []
    }) ?? []

  const priceText = formatILS(product.price)
  const compareText = product.compareAtPrice
    ? formatILS(product.compareAtPrice)
    : null

  // schema.org Product JSON-LD — helps Google render rich snippets
  // (price, availability, image) in search results. Keeping it small
  // and on-page avoids Next's `script` component and keeps the
  // hydration footprint zero.
  //
  // 2026-04-11 A.6 upgrade: emit the FULL image array (previously
  // only the first image was emitted) — Google Rich Results docs
  // recommend an array so the knowledge panel can rotate photos.
  const toAbsolute = (u: string): string =>
    u.startsWith('http')
      ? u
      : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`
  const absoluteImages = images.map((i) => toAbsolute(i.url))
  const inStock =
    product.type === 'sourced'
      ? true // Sourced items are ordered from the supplier per-order
      : (product.stock ?? 0) > 0
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription ?? undefined,
    image: absoluteImages.length > 0 ? absoluteImages : undefined,
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

// Lexical → JSX renderer. Handles the node types Payload's default
// Lexical editor can produce: root, paragraph, heading (h1-h6), text
// (with format bitmask for bold/italic/underline/strikethrough/code),
// link, list (bullet/number/check), listitem, and line break.
//
// The format bitmask convention is Lexical's:
//   1  bold
//   2  italic
//   4  strikethrough
//   8  underline
//   16 code
//
// Unknown node types render their children (if any) so future Payload
// upgrades that add new node types don't silently drop content. Falls
// back to a minimal text-only path if the input isn't an object.
//
// Upgraded from the original text-extraction-only version in the
// 2026-04-11 polish pass so Yarit can use Payload's rich-text tools
// (bold, italic, headings, lists, links) and have them render on the
// customer-facing product page.
import type { JSX, ReactNode } from 'react'

type LexicalNode = {
  type?: string
  text?: string
  format?: number | string
  url?: string
  tag?: string
  listType?: 'bullet' | 'number' | 'check'
  children?: LexicalNode[]
  rel?: string
  target?: string
}

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKE = 4
const FORMAT_UNDERLINE = 8
const FORMAT_CODE = 16

function renderInlineText(node: LexicalNode, key: string | number): ReactNode {
  if (typeof node.text !== 'string') return null
  const format = typeof node.format === 'number' ? node.format : 0
  let el: ReactNode = node.text
  if (format & FORMAT_CODE) {
    el = (
      <code className="rounded bg-[var(--color-surface-warm)] px-1.5 py-0.5 text-sm font-mono text-[var(--color-primary-dark)]">
        {el}
      </code>
    )
  }
  if (format & FORMAT_STRIKE) el = <s>{el}</s>
  if (format & FORMAT_UNDERLINE) el = <u>{el}</u>
  if (format & FORMAT_ITALIC) el = <em>{el}</em>
  if (format & FORMAT_BOLD) el = <strong>{el}</strong>
  return <span key={key}>{el}</span>
}

function renderChildren(nodes: LexicalNode[] | undefined): ReactNode[] {
  if (!Array.isArray(nodes)) return []
  return nodes.map((child, i) => renderNode(child, i))
}

function renderNode(node: LexicalNode, key: string | number): ReactNode {
  if (!node || typeof node !== 'object') return null

  switch (node.type) {
    case 'text':
      return renderInlineText(node, key)

    case 'linebreak':
      return <br key={key} />

    case 'paragraph':
      return (
        <p
          key={key}
          className="text-base text-[var(--color-foreground)] leading-relaxed mb-3 last:mb-0"
        >
          {renderChildren(node.children)}
        </p>
      )

    case 'heading': {
      const level = (node.tag ?? 'h3').toLowerCase() as
        | 'h1'
        | 'h2'
        | 'h3'
        | 'h4'
        | 'h5'
        | 'h6'
      const sizes: Record<string, string> = {
        h1: 'text-2xl font-bold mt-5 mb-3',
        h2: 'text-xl font-bold mt-5 mb-3',
        h3: 'text-lg font-bold mt-4 mb-2',
        h4: 'text-base font-bold mt-4 mb-2',
        h5: 'text-sm font-bold mt-3 mb-2',
        h6: 'text-sm font-semibold mt-3 mb-2',
      }
      const Tag = level as keyof JSX.IntrinsicElements
      return (
        <Tag
          key={key}
          className={`${sizes[level] ?? sizes.h3} text-[var(--color-primary-dark)]`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {renderChildren(node.children)}
        </Tag>
      )
    }

    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      const listClass =
        node.listType === 'number'
          ? 'list-decimal ps-6 mb-3 space-y-1'
          : 'list-disc ps-6 mb-3 space-y-1'
      return (
        <Tag key={key} className={listClass}>
          {renderChildren(node.children)}
        </Tag>
      )
    }

    case 'listitem':
      return (
        <li
          key={key}
          className="text-base text-[var(--color-foreground)] leading-relaxed"
        >
          {renderChildren(node.children)}
        </li>
      )

    case 'link':
    case 'autolink': {
      const href = node.url ?? '#'
      const isExternal = /^https?:\/\//i.test(href)
      return (
        <a
          key={key}
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-[var(--color-primary)] underline underline-offset-2 hover:text-[var(--color-primary-dark)]"
        >
          {renderChildren(node.children)}
        </a>
      )
    }

    case 'quote':
      return (
        <blockquote
          key={key}
          className="border-s-4 border-[var(--color-primary)]/30 ps-4 italic text-[var(--color-muted)] my-4"
        >
          {renderChildren(node.children)}
        </blockquote>
      )

    default:
      // Unknown node type — render children if any, so future Payload
      // upgrades don't silently drop content.
      if (Array.isArray(node.children)) {
        return <span key={key}>{renderChildren(node.children)}</span>
      }
      return null
  }
}

function LexicalText({ value }: { value: unknown }) {
  if (!value || typeof value !== 'object') return null
  // Payload's rich-text field wraps the tree in `{ root: { children: [...] } }`.
  const root = (value as { root?: LexicalNode }).root
  if (!root || !Array.isArray(root.children)) return null
  return (
    <div className="lexical-body">{renderChildren(root.children)}</div>
  )
}

