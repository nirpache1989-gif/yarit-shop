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
import { Reveal } from '@/components/motion/Reveal'
import { CategoryGridMotion } from './CategoryGridMotion'
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
    <section className="py-20 md:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('categoriesEyebrow')}
            title={t('categoriesHeadline')}
            className="mb-12"
          />
        </Reveal>
        <CategoryGridMotion className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {categories.map((c, i) => {
            const payloadImg =
              typeof c.image === 'object' && c.image ? c.image : null
            const imgUrl = payloadImg?.url ?? AI_CATEGORY_TILES[c.slug] ?? null
            const num = String(i + 1).padStart(2, '0')
            return (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                data-category-card
                className="group relative aspect-[4/5] rounded-[var(--radius-card)] border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] overflow-hidden flex flex-col justify-end p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-primary)]/40"
              >
                {imgUrl && (
                  <Image
                    src={imgUrl}
                    alt={c.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                  />
                )}
                {/* Soft cream-to-transparent gradient at the bottom only —
                    lighter than the previous black overlay so the tiles
                    feel airy rather than heavy. */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--color-background)]/95 via-[var(--color-background)]/40 to-transparent" />
                <div className="relative flex flex-col gap-1">
                  <span className="eyebrow eyebrow--accent">
                    {num} / {t('categoriesHeadline')}
                  </span>
                  <h3
                    className="text-lg md:text-xl font-bold text-[var(--color-primary-dark)] leading-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {c.title}
                  </h3>
                  {/* Gold hairline that extends on hover — mirrors
                      the nav-link underline treatment. */}
                  <span className="block h-px w-0 bg-[var(--color-accent-deep)] transition-all duration-500 group-hover:w-12" />
                </div>
              </Link>
            )
          })}
        </CategoryGridMotion>
      </Container>
    </section>
  )
}
