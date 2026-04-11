/**
 * @file MeetYaritMotion — client-side converge animation for the MeetYarit strip
 * @summary Tier-1 GSAP upgrade T1.1. The MeetYarit section is a
 *          2-column editorial strip (image + text). This component
 *          takes the pre-translated strings from the server parent
 *          (`MeetYarit.tsx`) and renders the same layout, but adds a
 *          GSAP ScrollTrigger that slides the two columns toward each
 *          other from opposite edges as the section enters the
 *          viewport. Very subtle — ~40px of horizontal travel — but
 *          it adds a "coming into place" quality that the previous
 *          single-direction `<Reveal>` approach couldn't do.
 *
 *          RTL awareness: in Hebrew (the default locale), the
 *          `md:col-span-2` image column visually sits on the RIGHT
 *          and the `md:col-span-3` text column on the LEFT because
 *          CSS grid flow reverses under `dir="rtl"`. So the image
 *          should slide FROM the right edge (`+40px`) and the text
 *          FROM the left edge (`-40px`). In LTR English the mapping
 *          flips. We read `document.documentElement.dir` at setup
 *          time and derive the sign accordingly.
 *
 *          Relationship to existing Reveal/StaggeredReveal primitives:
 *          this component REPLACES them on the MeetYarit section
 *          ONLY. Every other consumer of `<Reveal>` /
 *          `<StaggeredReveal>` is untouched. Same pattern as
 *          `HeroMotion.tsx` replaced `<SplitWords>` on the Hero only.
 *
 *          Accessibility: gated on `useGsapScope`'s reduced-motion
 *          check. When reduced, we snap everything to the settled
 *          state via `clearProps: 'all'` — the reader sees a fully
 *          present section exactly as before the GSAP sprint started.
 */
'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { KenBurns } from '@/components/motion/KenBurns'
import { useGsapScope } from '@/components/motion/GsapScope'

type Props = {
  eyebrow: string
  heading: string
  body: string
  readMore: string
  imageAlt: string
}

export function MeetYaritMotion({
  eyebrow,
  heading,
  body,
  readMore,
  imageAlt,
}: Props) {
  const scopeRef = useRef<HTMLElement>(null)

  useGsapScope(scopeRef, ({ gsap, reduced }) => {
    if (reduced) {
      gsap.set(
        [
          '[data-meet-image]',
          '[data-meet-text-block]',
        ],
        { clearProps: 'all' },
      )
      return
    }

    // Read the document direction once at setup time — this is the
    // effective direction when the component mounts and it doesn't
    // change during the lifetime of the scroll trigger. RTL means
    // the image column is visually on the right (grid flow reversed).
    const rtl =
      typeof document !== 'undefined' &&
      document.documentElement.dir === 'rtl'
    const imageStartX = rtl ? 40 : -40
    const textStartX = rtl ? -40 : 40

    // The whole entrance is one scroll-triggered tween per column.
    // `start: 'top 80%'` means the animation fires when the top of
    // the section hits 80% down the viewport (slightly before it's
    // fully in view), same trigger point the rest of the site's
    // reveals use.
    //
    // ⚠ Bug-fix (2026-04-11): `immediateRender: false` + `once: true`
    // keeps the columns at their natural state if the ScrollTrigger
    // fails to fire on initial hydration (see the matching comment
    // in CategoryGridMotion.tsx for the full post-mortem — same
    // failure mode affected multiple homepage motion sections on
    // production).
    gsap.from('[data-meet-image]', {
      x: imageStartX,
      opacity: 0,
      duration: 1.0,
      ease: 'power2.out',
      immediateRender: false,
      scrollTrigger: {
        trigger: scopeRef.current,
        // 2026-04-11 QA fix: fire earlier to hide the `immediateRender:
        // false` snap off-screen. See CategoryGridMotion and
        // FeaturedProductsMotion for the matching comments.
        start: 'top bottom-=40',
        once: true,
      },
    })

    gsap.from('[data-meet-text-block]', {
      x: textStartX,
      opacity: 0,
      duration: 1.0,
      stagger: 0.12,
      ease: 'power2.out',
      immediateRender: false,
      scrollTrigger: {
        trigger: scopeRef.current,
        start: 'top bottom-=40',
        once: true,
      },
    })
  })

  return (
    <section
      ref={scopeRef}
      className="py-20 md:py-28 bg-[var(--color-surface-warm)]"
    >
      <Container>
        <div className="grid md:grid-cols-5 gap-10 md:gap-12 items-center">
          {/* Image column */}
          <div data-meet-image className="md:col-span-2">
            <div className="relative aspect-[4/5] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-border-brand)]">
              <KenBurns variant="br">
                <Image
                  src="/brand/ai/about-hero.jpg"
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </KenBurns>
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/10 via-transparent to-transparent" />
            </div>
          </div>

          {/* Text column — every direct child is a data-meet-text-block
              so the stagger walks them one at a time. Same rhythm as
              the old StaggeredReveal (140ms → 120ms, the slightly
              tighter pace feels more deliberate when paired with the
              horizontal travel). */}
          <div className="md:col-span-3 space-y-5">
            <div data-meet-text-block>
              <Eyebrow as="p" tone="accent">
                {eyebrow}
              </Eyebrow>
            </div>
            <h2
              data-meet-text-block
              className="text-4xl md:text-5xl text-[var(--color-primary-dark)] leading-tight font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {heading}
            </h2>
            <p
              data-meet-text-block
              className="text-lg md:text-xl text-[var(--color-foreground)]/80 leading-relaxed italic"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {body}
            </p>
            <div data-meet-text-block>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors uppercase"
              >
                {readMore} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
