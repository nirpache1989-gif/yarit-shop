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
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { cn } from '@/lib/cn'
import { resolveProductImage } from '@/lib/product-image'
import { ProductCardMotion } from './ProductCardMotion'

type Media = { id: number | string; url?: string; alt?: string }

export type ProductCardData = {
  id: number | string
  type: 'forever' | 'independent'
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
  locale: 'he' | 'en'
  className?: string
}

export function ProductCard({ product, locale, className }: Props) {
  const imageUrl = resolveProductImage(product)
  const firstImage = product.images?.[0]?.image
  const imageAlt =
    (firstImage && typeof firstImage === 'object' && firstImage.alt) ||
    product.title

  const priceText = formatPrice(product.price, locale)
  const compareText = product.compareAtPrice
    ? formatPrice(product.compareAtPrice, locale)
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
        className="block relative aspect-[4/5] bg-[var(--color-surface-warm)]"
      >
        {/* .product-image ties into the CSS hover rule in globals.css
            that adds a subtle translate to the existing scale —
            the image now pans slightly instead of just zooming. */}
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="product-image object-contain p-6"
        />

        {/* "new arrival" eyebrow — replaces the old filled badge.
            Only shown when `isNew` is set. Tiny italic, top-start.
            Pops in with the brand badge-pop keyframe. */}
        {product.isNew && (
          <div className="absolute top-4 start-4 z-10 animate-badge-pop">
            <span
              className="italic text-[11px] tracking-[0.1em] text-[var(--color-accent-deep)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {locale === 'he' ? 'חדש בחנות' : 'new arrival'}
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
            label={locale === 'he' ? 'להוסיף לסל' : 'Add to bag'}
          />
        </div>
      </div>
    </ProductCardMotion>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────
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
