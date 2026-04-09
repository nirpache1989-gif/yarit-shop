/**
 * @file Storefront home page
 * @summary Homepage composition. ForeverSpotlight section was removed
 *          in the post-launch rebrand (Yarit's feedback: minimize any
 *          customer-facing mention of the Forever brand; keep the
 *          internal type discriminator and fulfillment workflow only).
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
      <BranchDivider />
      <FeaturedProducts locale={typedLocale} />
      <BranchDivider />
      <MeetYarit locale={typedLocale} />
      <Testimonials locale={typedLocale} />
      <BranchDivider />
      <CategoryGrid locale={typedLocale} />
    </>
  )
}
