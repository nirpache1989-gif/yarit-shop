/**
 * @file Storefront home page
 * @summary Homepage composition.
 *
 *          Current order:
 *            Hero → TrustBar → Featured → MeetYarit → Testimonials → Categories
 */
import { setRequestLocale } from 'next-intl/server'

import { routing, type Locale } from '@/lib/i18n/routing'
import { Hero } from '@/components/sections/Hero'
import { TrustBar } from '@/components/sections/TrustBar'
import { FeaturedProducts } from '@/components/sections/FeaturedProducts'
import { MeetYarit } from '@/components/sections/MeetYarit'
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
      {/* T2.9 #6 — each divider binds its draw-in scroll trigger to
          the next section via `dataFor`, so the sprig animates at the
          exact moment the consumer section starts revealing. See
          BranchDivider.tsx for the data-section lookup. */}
      <BranchDivider dataFor="featured" />
      <FeaturedProducts locale={typedLocale} />
      <BranchDivider dataFor="meetyarit" />
      <MeetYarit locale={typedLocale} />
      <Testimonials locale={typedLocale} />
      <BranchDivider dataFor="categories" />
      <CategoryGrid locale={typedLocale} />
    </>
  )
}
