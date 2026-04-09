/**
 * @file Storefront home page
 * @summary Phase C + post-design-review homepage. Composes all section
 *          components with BranchDivider separators between them so
 *          the page has visual connective tissue.
 *
 *          Order: Hero → TrustBar → Featured → MeetYarit → Forever
 *                 Spotlight → Testimonials → Categories
 *
 *          All data fetching happens inside each section server
 *          component. This file stays declarative and easy to reorder.
 */
import { setRequestLocale } from 'next-intl/server'

import { routing, type Locale } from '@/lib/i18n/routing'
import { Hero } from '@/components/sections/Hero'
import { TrustBar } from '@/components/sections/TrustBar'
import { FeaturedProducts } from '@/components/sections/FeaturedProducts'
import { MeetYarit } from '@/components/sections/MeetYarit'
import { ForeverSpotlight } from '@/components/sections/ForeverSpotlight'
import { Testimonials } from '@/components/sections/Testimonials'
import { CategoryGrid } from '@/components/sections/CategoryGrid'
import { BranchDivider } from '@/components/ui/BranchDivider'

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
      <Hero />
      <TrustBar />
      <BranchDivider />
      <FeaturedProducts locale={typedLocale} />
      <BranchDivider />
      <MeetYarit locale={typedLocale} />
      <ForeverSpotlight locale={typedLocale} />
      <Testimonials locale={typedLocale} />
      <BranchDivider />
      <CategoryGrid locale={typedLocale} />
    </>
  )
}
