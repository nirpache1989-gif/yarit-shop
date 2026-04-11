/**
 * @file ProductThumbnailCell — custom list-view cell for the Products collection
 * @summary 2026-04-11 Track B.1. Server component rendered by Payload
 *          inside the products list view as the cell for the `images`
 *          field. Pulls the first image's URL off the row data and
 *          renders a small rounded thumbnail so Yarit can visually
 *          scan the catalog without clicking into each product.
 *
 *          Wired via `admin.components.Cell` on the `images` field
 *          in `src/collections/Products.ts`. The list view shows this
 *          column alongside `title`, `type`, `price`, `category`,
 *          `status` (the collection's `defaultColumns`).
 *
 *          Depth fallback: Payload's list view fetches with a default
 *          depth that may leave the `images[].image` relationship as
 *          a bare ID (not a populated object) when the list view
 *          query doesn't drill deep enough. We detect this case and
 *          fall back to `payload.findByID({ collection: 'media', id })`
 *          so the cell still renders a real thumbnail. Yes, this is
 *          an extra N+1 query per row, but list pages are 10-20 rows
 *          max and this is admin-only — no customer-facing perf cost.
 *
 *          Falls back gracefully:
 *            - If the row has no images → renders a soft placeholder
 *            - If the fallback findByID fails → renders the placeholder
 *            - If the URL points at Vercel Blob (production) → still
 *              works via the plain <img> tag
 *
 *          Styled via `.yarit-thumb-cell` rules in admin-brand.css.
 */
import type { DefaultServerCellComponentProps } from 'payload'

// Shape of the `images` field value as it lands in `rowData`. The
// inner `image` can be either an object (depth populated), a numeric
// or string ID (depth too shallow), or null. We handle all three.
type ImagesArray = Array<{
  image?:
    | {
        id?: number | string
        url?: string | null
        alt?: string | null
      }
    | null
    | string
    | number
}>

type Props = DefaultServerCellComponentProps & {
  rowData?: {
    images?: ImagesArray
    title?: string
    slug?: string
  }
}

export async function ProductThumbnailCell(props: Props) {
  const rowData = props.rowData
  const images = rowData?.images ?? []
  const firstImage = images[0]?.image

  let url: string | null = null
  let alt: string = rowData?.title ?? 'product'

  if (firstImage && typeof firstImage === 'object') {
    // Depth already populated — happy path.
    url = firstImage.url ?? null
    alt = firstImage.alt || alt
  } else if (firstImage && (typeof firstImage === 'number' || typeof firstImage === 'string')) {
    // Depth too shallow for the list view — fetch the media doc by ID.
    // This is the only extra query per row; it's acceptable because
    // the admin list is always a small page.
    try {
      const media = await props.payload.findByID({
        collection: 'media',
        id: firstImage,
        depth: 0,
      })
      url = (media as { url?: string | null })?.url ?? null
      alt = (media as { alt?: string | null })?.alt || alt
    } catch (err) {
      // Leave url null — the placeholder branch below will render.
      console.warn(
        'ProductThumbnailCell: media fallback fetch failed',
        err instanceof Error ? err.message : err,
      )
    }
  }

  if (!url) {
    return (
      <span
        className="yarit-thumb-cell yarit-thumb-cell--empty"
        aria-label="ללא תמונה"
      >
        —
      </span>
    )
  }

  // Plain <img> (not next/image) because Payload's list view is
  // inside the admin shell where next/image optimization isn't wired
  // through the same CSS scope as the storefront. A 48px thumbnail
  // is too small to benefit from optimization anyway.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className="yarit-thumb-cell"
      width={48}
      height={48}
      loading="lazy"
    />
  )
}
