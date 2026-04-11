/**
 * @file ProductCard — grid card for a single product
 * @summary Wave 2 of the design round: rebuilt as a "museum-label"
 *          card inspired by Aesop / Le Labo / Augustinus Bader —
 *          quiet, understated, editorial restraint instead of
 *          aggressive e-commerce styling.
 *
 *          The card:
 *            - Sits on the lighter parchment `--color-surface-warm`
 *            - 4:5 image viewport (was 1:1) — taller, more editorial
 *            - Image backdrop is pure white so transparent product
 *              PNGs pop out of the warm card
 *            - Tiny uppercase eyebrow with the category (if present)
 *              or brand mark
 *            - Serif product name (Frank Ruhl Libre)
 *            - 1-line italic serif descriptor
 *            - Price next to the name separated by a thin sage rule
 *              (tabular, not bold, smaller than the name)
 *            - Quiet "ADD TO BAG" / "להוסיף לסל" ghost-link CTA that
 *              reveals on hover — no filled button
 *            - `isNew` → tiny italic eyebrow "new arrival" at top-left
 *              (was a pill badge)
 *            - 2px square corners (from --radius-card) — editorial
 *              print feel, not SaaS rounded
 *
 *          See: plan §Track B Move 5.
 */
'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { cn } from '@/lib/cn'
import { resolveProductImage } from '@/lib/product-image'
import { formatILS } from '@/lib/format'
import { ProductCardMotion } from './ProductCardMotion'

type Media = { id: number | string; url?: string; alt?: string }

export type ProductCardData = {
  id: number | string
  type: 'sourced' | 'stocked'
  slug: string
  title: string
  shortDescription?: string
  price: number
  compareAtPrice?: number | null
  isNew?: boolean
  isFeatured?: boolean
  images?: Array<{ image?: Media | null }>
}

type Props = {
  product: ProductCardData
  className?: string
}

export function ProductCard({ product, className }: Props) {
  const t = useTranslations('product')
  const imageUrl = resolveProductImage(product)
  const firstImage = product.images?.[0]?.image
  const imageAlt =
    (firstImage && typeof firstImage === 'object' && firstImage.alt) ||
    product.title

  const priceText = formatILS(product.price)
  const compareText = product.compareAtPrice
    ? formatILS(product.compareAtPrice)
    : null

  return (
    <ProductCardMotion
      className={cn(
        'product-card group relative flex flex-col h-full rounded-[var(--radius-card)] border border-[var(--color-border-brand)]/70 bg-[var(--color-surface-warm)] overflow-hidden',
        className,
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-[4/5] overflow-hidden bg-[var(--color-surface-warm)]"
      >
        {/* .product-image ties into the CSS hover rule in globals.css
            that adds a subtle translate to the existing scale —
            the image now pans slightly instead of just zooming. The
            `overflow-hidden` above keeps the scaled image clipped to
            the viewport so the hover zoom doesn't bleed into the
            card body. 2026-04-11 QA: reduced `p-6` -> `p-4` so the
            cream border around product photos is thinner and the
            hover-zoom transition reads as "settling into place"
            rather than "revealing a hidden white frame". */}
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="product-image object-contain p-4"
        />

        {/* "new arrival" eyebrow — pill badge with a cream backdrop
            + backdrop-blur so it stays legible over any product
            photo regardless of its own background color. Raised to
            `z-20` so it always sits above the image and the hover
            zoom. 2026-04-11 QA: the previous plain-text version got
            visually overlapped by product photos with white
            backgrounds (user report — "שפתון לחות אלוורה וג'וג'ובה"). */}
        {product.isNew && (
          <div className="absolute top-3 start-3 z-20 animate-badge-pop pointer-events-none">
            <span
              className="inline-flex items-center rounded-full bg-[var(--color-surface)]/90 px-3 py-1 text-[11px] italic tracking-[0.1em] text-[var(--color-accent-deep)] shadow-sm backdrop-blur-sm border border-[var(--color-border-brand)]/60"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('newArrival')}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link href={`/product/${product.slug}`} className="flex-1 space-y-2">
          <h3
            className="text-xl font-bold text-[var(--color-primary-dark)] leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {product.title}
          </h3>
          {product.shortDescription && (
            <p
              className="text-sm text-[var(--color-muted)] italic leading-relaxed line-clamp-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {product.shortDescription}
            </p>
          )}
        </Link>

        {/* Price row — tabular, small, NOT bold. Sits next to a thin
            sage divider so it reads like a museum label. */}
        <div className="flex items-baseline gap-3 pt-2 border-t border-[var(--color-primary)]/15">
          <span
            className="text-base text-[var(--color-primary-dark)] tabular-nums"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {priceText}
          </span>
          {compareText && (
            <span className="text-xs text-[var(--color-muted)] line-through italic tabular-nums">
              {compareText}
            </span>
          )}

          {/* Quiet ghost-link CTA — text only, underlined on hover.
              Reveals on group-hover. On touch devices (where :hover
              is weak) we still show it at 70% opacity so it's
              discoverable. */}
          <AddToCartButton
            product={product}
            variant="ghost-link"
            className="ms-auto"
            label={t('addToBag')}
          />
        </div>
      </div>
    </ProductCardMotion>
  )
}

