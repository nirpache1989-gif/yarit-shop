/**
 * @file Category grid section (homepage)
 * @summary Server data shell. Fetches the category list from Payload,
 *          resolves the AI-fallback tile image URLs, and hands a
 *          serializable `tiles[]` shape to `CategoryGridMotion`
 *          (client) which owns the full layout + motion.
 *
 *          Same split pattern as Hero → HeroMotion and
 *          FeaturedProducts → FeaturedProductsMotion. Keeps the
 *          Payload fetch + translations server-side and passes
 *          already-resolved strings across the client boundary in
 *          accordance with the CLAUDE.md rule against function props.
 *
 *          T2.9 #4 restructure: before T2.9 this file rendered the
 *          `<section>` + heading JSX and wrapped only the grid in
 *          `CategoryGridMotion`. The T2.9 desktop header pin needed
 *          the heading inside the motion scope, so the full layout
 *          moved down into the motion component and this shell now
 *          just passes data.
 */
import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'
import { CategoryGridMotion, type CategoryTile } from './CategoryGridMotion'
import type { Locale } from '@/lib/i18n/routing'

type Props = {
  locale: Locale
}

type CategoryData = {
  id: number | string
  slug: string
  title: string
  image?: { url?: string; alt?: string } | number | null
}

const AI_CATEGORY_TILES: Record<string, string> = {
  nutrition: '/brand/ai/cat-nutrition.jpg',
  skincare: '/brand/ai/cat-skincare.jpg',
  aloe: '/brand/ai/cat-aloe.jpg',
  beauty: '/brand/ai/cat-beauty.jpg',
  gifts: '/brand/ai/cat-gifts.jpg',
}

export async function CategoryGrid({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home' })
  const payload = await getPayloadClient()

  const res = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 6,
    sort: 'order',
    locale,
  })

  const categories = res.docs as unknown as CategoryData[]
  if (categories.length === 0) return null

  const tiles: CategoryTile[] = categories.map((c, i) => {
    const payloadImg =
      typeof c.image === 'object' && c.image ? c.image : null
    const imgUrl = payloadImg?.url ?? AI_CATEGORY_TILES[c.slug] ?? null
    return {
      id: String(c.id),
      slug: c.slug,
      title: c.title,
      imgUrl,
      num: String(i + 1).padStart(2, '0'),
    }
  })

  return (
    <CategoryGridMotion
      tiles={tiles}
      eyebrow={t('categoriesEyebrow')}
      headline={t('categoriesHeadline')}
    />
  )
}
