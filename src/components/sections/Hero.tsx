/**
 * @file Homepage hero section
 * @summary Large centered hero with the Shoresh tree logo, headline,
 *          subheadline, and CTAs to /shop and /about.
 *
 *          Features a subtle watercolor botanical background wash
 *          (public/brand/ai/hero-bg-wash.jpg) layered at low opacity
 *          behind the content. The wash is placed in an absolutely
 *          positioned container so it doesn't affect layout.
 */
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { brand } from '@/brand.config'

export function Hero() {
  const t = useTranslations('home')

  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      {/* Background wash — absolute, behind content */}
      <div className="absolute inset-0 -z-0 opacity-40" aria-hidden>
        <Image
          src="/brand/ai/hero-bg-wash.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradient fade to blend the wash into the page bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)]/30 via-transparent to-[var(--color-background)]" />
      </div>

      <Container className="relative flex flex-col items-center text-center gap-8 md:gap-10">
        <Image
          src="/brand/logo.png"
          alt={brand.name.en}
          width={400}
          height={600}
          priority
          className="h-56 md:h-72 w-auto object-contain animate-fade-up"
        />
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h1
            className="text-5xl md:text-7xl text-[var(--color-primary-dark)] leading-[1.05] max-w-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('heroHeadline')}
          </h1>
          <p className="text-base md:text-lg text-[var(--color-muted)] max-w-2xl mx-auto">
            {t('heroSubheadline')}
          </p>
        </div>
        <div
          className="flex flex-col sm:flex-row gap-3 animate-fade-up"
          style={{ animationDelay: '220ms' }}
        >
          <Button href="/shop" variant="primary" size="lg">
            {t('heroCta')}
          </Button>
          <Button href="/about" variant="secondary" size="lg">
            {t('heroSecondaryCta')}
          </Button>
        </div>
      </Container>
    </section>
  )
}
