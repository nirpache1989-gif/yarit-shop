/**
 * @file ProductCardLivingGarden — grid card for a product in the
 *       Living Garden design system.
 * @summary Renders the prototype `.g-card` structure: parchment tile
 *          with a 4:5 aspect plate (gradient placeholder or real
 *          product image), spinning bloom glyph corner, mono
 *          category eyebrow, Fraunces name, description, and a
 *          dashed-rule price + add-button row.
 *
 *          The `.g-card` class is all GardenAlive needs — its
 *          pointermove listener writes `--mx / --my / --tx / --ty`
 *          CSS custom properties on hover, which the `:hover` rule
 *          in globals.css picks up for the radial glow + perspective
 *          tilt.
 *
 *          For session 20 the "+ Add" button links to the PDP instead
 *          of dispatching the cart store directly (keeps the card
 *          server-renderable and matches the prototype's visual
 *          pattern). Real cart-add on the grid can land alongside the
 *          PDP rebuild in session 22.
 */
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { resolveProductImage, PRODUCT_PLACEHOLDER } from '@/lib/product-image'
import { formatILS } from '@/lib/format'
import type { ProductCardData } from '@/components/product/ProductCard'

type Props = {
  product: ProductCardData
  /** 0-based grid index — drives the alternating plate colorway. */
  index: number
  /** Localized category label (uppercased by the card). Optional. */
  categoryLabel?: string
  /** Localized "Add" label for the pill button. */
  addLabel: string
}

const PLATE_COLORWAYS = ['g-plate-leaf', 'g-plate-ember', 'g-plate-cream', ''] as const

export function ProductCardLivingGarden({
  product,
  index,
  categoryLabel,
  addLabel,
}: Props) {
  const imageUrl = resolveProductImage(product)
  const hasRealImage = imageUrl !== PRODUCT_PLACEHOLDER
  const plateClass = PLATE_COLORWAYS[index % PLATE_COLORWAYS.length]
  const firstImage = product.images?.[0]?.image
  const imageAlt =
    (firstImage && typeof firstImage === 'object' && firstImage.alt) ||
    product.title
  const specimenNumber = String(index + 1).padStart(3, '0')

  return (
    <Link href={`/product/${product.slug}`} className="g-card block">
      <div className="g-card-img">
        <div className={`g-plate ${plateClass}`.trim()}>
          {hasRealImage && (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          )}
          <span className="g-plate-specimen">№ {specimenNumber}</span>
        </div>
        <span className="g-card-bloom" aria-hidden="true">
          ❀
        </span>
      </div>

      <div className="g-card-body">
        {categoryLabel && (
          <div className="g-card-cat">{categoryLabel}</div>
        )}
        <h3 className="g-card-name">{product.title}</h3>
        {product.shortDescription && (
          <p className="g-card-desc">{product.shortDescription}</p>
        )}
        <div className="g-card-row">
          <span className="g-price">{formatILS(product.price)}</span>
          <span className="g-add-btn" aria-hidden="true">
            + {addLabel}
          </span>
        </div>
      </div>
    </Link>
  )
}
