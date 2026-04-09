/**
 * @file Trust bar — 4 value propositions under the hero
 * @summary Uses the rembg-processed watercolor icons from
 *          `public/brand/ai/icon-*.png` (transparent PNGs). Each
 *          icon is shown at 56px, centered, with its label underneath.
 *
 *          If you want to swap icons later, replace the PNG files
 *          keeping the same filenames. No code change needed.
 */
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'

type Item = {
  src: string
  labelKey: 'natural' | 'authorized' | 'shipping' | 'personal'
}

const items: Item[] = [
  { src: '/brand/ai/icon-natural.png', labelKey: 'natural' },
  { src: '/brand/ai/icon-certified.png', labelKey: 'authorized' },
  { src: '/brand/ai/icon-shipping.png', labelKey: 'shipping' },
  { src: '/brand/ai/icon-personal.png', labelKey: 'personal' },
]

export function TrustBar() {
  const t = useTranslations('trustBar')

  return (
    <section className="py-12 border-y border-[var(--color-border-brand)] bg-[var(--color-surface)]/40">
      <Container>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <li
              key={item.labelKey}
              className="flex flex-col items-center text-center gap-3"
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
              <p className="text-sm font-semibold text-[var(--color-primary-dark)]">
                {t(item.labelKey)}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
