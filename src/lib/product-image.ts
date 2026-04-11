/**
 * @file Product image resolver
 * @summary Shared helper that decides which image URL to use for a
 *          given product. Lives outside ProductCard so the cart and
 *          checkout can reuse the same logic — otherwise we'd get
 *          broken Media URLs leaking into the cart drawer while the
 *          product grid still shows the static override.
 *
 *          Resolution order:
 *            1. Static slug override (ships with the build, always works)
 *            2. Media collection URL (only valid if Vercel Blob is wired)
 *            3. Placeholder (ships with the build)
 *
 *          See: docs/DECISIONS.md ADR-015 (rebrand + Blob sidestep).
 */
// Keys match the `slug` field on the corresponding Products row in
// the database. Filenames in the destination are the case-munged
// versions already on disk in `public/brand/ai/` (Aloelips.jpg,
// AloeFirst.jpg, etc.).
//
// Defensive aliasing: the seed script in `src/lib/seed.ts` uses the
// canonical slug convention (`aloe-lip-balm`, `aloe-toothgel`, …).
// A couple of Hebrew-aligned drift aliases are registered below for
// any hand-edited database rows that may have drifted from the seed
// convention.
//
// Photos NOT covered here fall through to the Media collection URL,
// then to the placeholder — that's the right behavior for honey,
// lavender oil, and any product without a dedicated flat-lay photo.
export const STATIC_IMAGE_OVERRIDES: Record<string, string> = {
  // ─── Canonical seed-script slugs (src/lib/seed.ts) ───
  'aloe-lip-balm': '/brand/ai/Aloelips.jpg',
  'aloe-toothgel': '/brand/ai/AloeToothGel.jpg',
  'aloe-soothing-spray': '/brand/ai/AloeFirst.jpg',
  'aloe-vera-gel': '/brand/ai/AloeGelly.jpg',
  'bee-propolis': '/brand/ai/BeePropolis.jpg',
  'daily-multivitamin': '/brand/ai/DailyMultivitamin.jpg',
  'aloe-body-duo-gift-set': '/brand/ai/BodylotionNwsh.jpg',

  // ─── Drift aliases for hand-edited databases ───
  'aloe-lips': '/brand/ai/Aloelips.jpg',
  'aloe-first': '/brand/ai/AloeFirst.jpg',
  'aloe-vera-gelly': '/brand/ai/AloeGelly.jpg',
  'aloe-body-perfect-match': '/brand/ai/BodylotionNwsh.jpg',
}

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
  const staticOverride = STATIC_IMAGE_OVERRIDES[product.slug]
  if (staticOverride) return staticOverride

  const firstImage = product.images?.[0]?.image
  const mediaUrl =
    firstImage && typeof firstImage === 'object' ? firstImage.url : undefined
  if (mediaUrl) return mediaUrl

  return PRODUCT_PLACEHOLDER
}
