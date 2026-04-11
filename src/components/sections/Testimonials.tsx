/**
 * @file Testimonials — social proof strip (server shell)
 * @summary Resolves the 3 quote translations and hands a serializable
 *          shape to `TestimonialsMotion` (client) which owns the full
 *          JSX + GSAP horizontal cascade.
 *
 *          Why the split: T2.9 #5 swaps the old `<StaggeredReveal>`
 *          vertical stagger for a GSAP cascade where each card slides
 *          in from the RTL-aware start edge. That needs a useGsapScope
 *          + DOM refs, which only work in client components. The
 *          translation lookup stays here on the server side so we
 *          don't pass function props across the server/client
 *          boundary — same pattern as Hero → HeroMotion and
 *          FeaturedProducts → FeaturedProductsMotion.
 *
 *          See: docs/DECISIONS.md — design review punchlist F2.
 */
import { getTranslations } from 'next-intl/server'
import { TestimonialsMotion } from './TestimonialsMotion'
import type { Locale } from '@/lib/i18n/routing'

type Props = {
  locale: Locale
}

export async function Testimonials({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'testimonials' })

  const quotes = [
    { name: t('t1.name'), city: t('t1.city'), quote: t('t1.quote') },
    { name: t('t2.name'), city: t('t2.city'), quote: t('t2.quote') },
    { name: t('t3.name'), city: t('t3.city'), quote: t('t3.quote') },
  ]

  return (
    <TestimonialsMotion
      eyebrow={t('eyebrow')}
      heading={t('heading')}
      subheading={t('subheading')}
      quotes={quotes}
    />
  )
}
