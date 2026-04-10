/**
 * @file ProductCard — grid card for a single product
 * @summary Rendered from /shop grid and homepage featured carousel.
 *          Features:
 *          - watercolor sprig flourish in the top-start corner
 *          - hover lift + shadow (via .product-card class in globals.css)
 *          - type-aware badge (accent for Forever, primary for in-stock)
 *          - image viewport is pure white so the product pops out of the
 *            warmer parchment card body
 *          - serif (Frank Ruhl Libre) price for a hand-curated feel
 *          - "New" indicator badge
 *
 *          See: docs/DECISIONS.md ADR-010 (design uplift), punchlist
 *               D1 (bg invert), D2 (corner sprig), D3 (serif price).
 */
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { Badge } from '@/components/ui/Badge'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { cn } from '@/lib/cn'
import { resolveProductImage } from '@/lib/product-image'

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
    <article
      className={cn(
        'product-card group relative flex flex-col h-full rounded-2xl border border-[var(--color-border-brand)]/70 bg-[var(--color-background)] overflow-hidden',
        className,
      )}
    >
      {/* Corner sprig flourish — sits on top of the image viewport */}
      <svg
        className="absolute top-2.5 start-2.5 z-10 text-[var(--color-primary)]/50"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 20 C 8 14, 14 10, 20 8" />
        <path d="M8 17 q 2 -4, 6 -5" />
        <path d="M12 14 q 2 -4, 6 -4" />
      </svg>

      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-square bg-[var(--color-surface)]"
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />

        {/* Badges — top-end (opposite corner from the sprig).
            Post-rebrand: no longer reveals Forever vs independent
            to the customer. Only the "New" flag is shown when set. */}
        <div className="absolute top-3 end-3 flex flex-col gap-1 items-end">
          {product.isNew && (
            <Badge tone="accent">{locale === 'he' ? 'חדש' : 'New'}</Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/product/${product.slug}`} className="flex-1">
          <h3 className="text-base font-bold text-[var(--color-primary-dark)] line-clamp-2 leading-snug group-hover:text-[var(--color-primary)] transition-colors">
            {product.title}
          </h3>
          {product.shortDescription && (
            <p className="mt-1 text-sm text-[var(--color-muted)] line-clamp-2">
              {product.shortDescription}
            </p>
          )}
        </Link>

        <div className="flex items-baseline gap-2 justify-between">
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-[var(--color-primary-dark)] leading-none"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {priceText}
            </span>
            {compareText && (
              <span className="text-sm text-[var(--color-muted)] line-through italic">
                {compareText}
              </span>
            )}
          </div>
        </div>

        <AddToCartButton product={product} className="mt-2" />
      </div>
    </article>
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
