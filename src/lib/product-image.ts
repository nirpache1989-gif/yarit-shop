/**
 * @file Product image resolver
 * @summary Shared helper that decides which image URL to use for a
 *          given product. Lives outside ProductCard so the cart and
 *          checkout can reuse the same logic — otherwise we'd get
 *          broken Media URLs leaking into the cart drawer while the
 *          product grid still shows the static override.
 *
 *          Resolution order:
 *            1. Media collection URL (first image on product.images)
 *            2. Placeholder (ships with the build)
 *
 *          2026-04-11 Copaia catalog replacement (ADR-020): the old
 *          `STATIC_IMAGE_OVERRIDES` map pointed each canonical slug at
 *          a hand-picked AI-watercolor file in `/brand/ai/`. With the
 *          catalog replaced by 8 Copaia products (3 kept, 4 new, 1
 *          renamed, 3 dropped) and each product now owning 2 or 3 real
 *          Payload Media photos, the static overrides were both stale
 *          and a blocker to the 3-image gallery pipeline (they forced
 *          the detail page to render a single hardcoded image instead
 *          of the full images[] array). Deleting the map entirely lets
 *          the resolver fall through to the Media URL in every surface.
 *
 *          See: docs/DECISIONS.md ADR-015 (original override rationale),
 *          ADR-019 (Forever removal), and the 2026-04-11 Copaia rename
 *          ship entry in docs/STATE.md.
 */

export const PRODUCT_PLACEHOLDER = '/brand/ai/product-placeholder.jpg'

type ProductImageInput = {
  slug: string
  images?: Array<{ image?: { url?: string | null } | null | string | number }>
}

/**
 * Resolve the image URL to use for a product card, cart line, etc.
 * Always returns a string — never undefined — so the caller can pass
 * it straight to next/image without null checks.
 */
export function resolveProductImage(product: ProductImageInput): string {
  const firstImage = product.images?.[0]?.image
  const mediaUrl =
    firstImage && typeof firstImage === 'object' ? firstImage.url : undefined
  if (mediaUrl) return mediaUrl

  return PRODUCT_PLACEHOLDER
}
