/**
 * @file Category grid section (homepage)
 * @summary Grid of category cards. Uses SectionHeading for the title
 *          and falls back to AI-generated category tiles when Payload
 *          categories don't have uploaded images yet.
 */
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Link } from '@/lib/i18n/navigation'
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

  return (
    <section className="py-16">
      <Container>
        <SectionHeading
          eyebrow={t('categoriesEyebrow')}
          title={t('categoriesHeadline')}
          className="mb-10"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c) => {
            const payloadImg =
              typeof c.image === 'object' && c.image ? c.image : null
            const imgUrl = payloadImg?.url ?? AI_CATEGORY_TILES[c.slug] ?? null
            return (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="group relative aspect-square rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface)] overflow-hidden flex items-end p-5 transition-shadow hover:shadow-lg"
              >
                {imgUrl && (
                  <Image
                    src={imgUrl}
                    alt={c.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <h3
                  className="relative text-xl font-extrabold text-white drop-shadow-md"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {c.title}
                </h3>
              </Link>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
