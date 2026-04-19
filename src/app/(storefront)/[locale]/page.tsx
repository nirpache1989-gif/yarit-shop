/**
 * @file Storefront home page
 * @summary Living Garden Phase 3 composition. Renders the seven
 *          Living Garden home sections in reading order:
 *
 *            Hero → [MarqueeBanner mounted in layout] →
 *            FeaturedProducts (grid) → CategoryGarden (tiles) →
 *            StoryStrip → IngredientsRail → Testimonials
 *
 *          The MarqueeBanner + AmbientSoundPill + GardenAlive
 *          motion layers all live in the storefront layout, so this
 *          page only composes the `<main>` content.
 *
 *          The old Night Apothecary components (Hero, TrustBar,
 *          FeaturedProducts, MeetYarit, Testimonials, CategoryGrid,
 *          BranchDivider, ProductCard) remain on disk because shop
 *          / PDP / cart still import them — those pages migrate in
 *          sessions 21+.
 */
import { setRequestLocale } from 'next-intl/server'

import { routing, type Locale } from '@/lib/i18n/routing'
import { HeroLivingGarden } from '@/components/sections/HeroLivingGarden'
import { FeaturedProductsLivingGarden } from '@/components/sections/FeaturedProductsLivingGarden'
import { CategoryGardenLivingGarden } from '@/components/sections/CategoryGardenLivingGarden'
import { StoryStripLivingGarden } from '@/components/sections/StoryStripLivingGarden'
import { IngredientsRailLivingGarden } from '@/components/sections/IngredientsRailLivingGarden'
import { TestimonialsLivingGarden } from '@/components/sections/TestimonialsLivingGarden'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const typedLocale = locale as Locale

  return (
    <>
      <HeroLivingGarden />
      <FeaturedProductsLivingGarden locale={typedLocale} />
      <CategoryGardenLivingGarden locale={typedLocale} />
      <StoryStripLivingGarden />
      <IngredientsRailLivingGarden />
      <TestimonialsLivingGarden />
    </>
  )
}
