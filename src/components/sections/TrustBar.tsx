/**
 * @file Trust bar — 4 value propositions under the hero
 * @summary Uses the rembg-processed watercolor icons from
 *          `public/brand/ai/icon-*.png` (transparent PNGs). Each
 *          icon is shown at 64px, centered, with its label underneath.
 *
 *          Note: we tried a single 2x2 sprite from `icons-trust-set.jpg`
 *          (Wave 2 Move B9) but Yarit preferred the previous 4 separate
 *          PNG icons. See plan §B9.
 */
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { StaggeredReveal } from '@/components/motion/StaggeredReveal'

type Item = {
  src: string
  labelKey: 'natural' | 'curated' | 'shipping' | 'personal'
}

const items: Item[] = [
  { src: '/brand/ai/icon-natural.png', labelKey: 'natural' },
  { src: '/brand/ai/icon-certified.png', labelKey: 'curated' },
  { src: '/brand/ai/icon-shipping.png', labelKey: 'shipping' },
  { src: '/brand/ai/icon-personal.png', labelKey: 'personal' },
]

export function TrustBar() {
  const t = useTranslations('trustBar')

  return (
    <section className="py-16 border-y border-[var(--color-border-brand)] bg-[var(--color-surface-warm)]">
      <Container>
        {/* Each item is a <li> and StaggeredReveal clones each child
            with data-reveal + an incremented --reveal-delay. One
            IntersectionObserver on the <ul> drives the whole set. */}
        <StaggeredReveal
          as="ul"
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          stagger={110}
        >
          {items.map((item) => (
            <li
              key={item.labelKey}
              className="flex flex-col items-center text-center gap-3 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="relative w-16 h-16">
                <Image
                  src={item.src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <p className="text-sm font-semibold text-[var(--color-primary-dark)] tracking-wide">
                {t(item.labelKey)}
              </p>
            </li>
          ))}
        </StaggeredReveal>
      </Container>
    </section>
  )
}
