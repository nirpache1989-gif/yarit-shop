/**
 * @file TestimonialsMotion — client-side horizontal cascade for the Testimonials strip
 * @summary Tier-2 GSAP upgrade T2.9 #5. Wraps the existing
 *          Testimonials layout and swaps the old `<StaggeredReveal>`
 *          vertical stagger for a GSAP horizontal cascade where each
 *          card slides in from the RTL-aware start edge.
 *
 *          Why GSAP and not a CSS-only variant: the "start edge"
 *          concept is `inset-inline-start`, which CSS transforms
 *          don't have a native RTL-aware version of. A CSS
 *          `translateX(-60px)` animates cards leftward regardless of
 *          direction, which reads backwards in RTL. Reading
 *          `document.documentElement.dir` at setup time and picking
 *          the sign deterministically is easier and more predictable
 *          than a CSS variable gymnastic.
 *
 *          Relationship to existing motion primitives: this component
 *          REPLACES the `<StaggeredReveal>` on Testimonials ONLY.
 *          Every other consumer is untouched. Same pattern as
 *          `FeaturedProductsMotion` replaced `<Reveal>` +
 *          `<StaggeredReveal>` on the FeaturedProducts strip only.
 *          The section heading still uses `<Reveal>` (outside the
 *          GSAP scope) — only the 3 cards move to GSAP.
 *
 *          ⚠ Bug-fix (2026-04-11) pattern applied: `immediateRender:
 *          false` + `once: true` + `start: 'top bottom-=40'` so the
 *          GSAP `from` state never leaks into the visible paint.
 *          This is non-negotiable — see CategoryGridMotion /
 *          FeaturedProductsMotion / MeetYaritMotion for the
 *          post-mortem comments on the hydration race failure mode.
 *
 *          Reduced motion: `clearProps: 'all'` on the cards — no
 *          slide, no stagger, ScrollTrigger never created. The
 *          section heading's `<Reveal>` wrapper handles its own
 *          reduced-motion path via the global CSS guard.
 */
'use client'

import { useRef } from 'react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/motion/Reveal'
import { useGsapScope } from '@/components/motion/GsapScope'

type Quote = { name: string; city: string; quote: string }

type Props = {
  eyebrow: string
  heading: string
  subheading: string
  quotes: Quote[]
}

export function TestimonialsMotion({
  eyebrow,
  heading,
  subheading,
  quotes,
}: Props) {
  const scopeRef = useRef<HTMLElement>(null)

  useGsapScope(scopeRef, ({ gsap, reduced }) => {
    if (reduced) {
      gsap.set('[data-testimonial-card]', { clearProps: 'all' })
      return
    }

    // Read the effective document direction once at setup time. In
    // Hebrew (RTL, the default locale), the first grid cell sits on
    // the right — "start edge" is right — so each card should begin
    // further right (+x) and slide toward its settled position. In
    // English LTR the first cell sits on the left, so cards begin
    // further left (-x). ±60px is enough travel to read as a
    // deliberate cascade without feeling showy.
    const rtl =
      typeof document !== 'undefined' &&
      document.documentElement.dir === 'rtl'
    const startX = rtl ? 60 : -60

    // ⚠ Bug-fix (2026-04-11): immediateRender:false + once:true so
    // the from-state never sticks on hydration, and start:'top
    // bottom-=40' fires while the cards are still off-screen so
    // the snap to from-state happens invisibly. See
    // CategoryGridMotion.tsx for the full post-mortem comment.
    gsap.from('[data-testimonial-card]', {
      x: startX,
      opacity: 0,
      duration: 1.0,
      stagger: 0.15,
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
      className="py-20 md:py-24 bg-[var(--color-surface-warm)]"
    >
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subheading={subheading}
            className="mb-12"
          />
        </Reveal>
        <ul className="grid md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <li
              key={i}
              data-testimonial-card
              className="relative rounded-[var(--radius-card)] border border-[var(--color-border-brand)] bg-[var(--color-background)] p-7 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)]/40 hover:shadow-lg"
            >
              {/* corner sprig flourish */}
              <svg
                className="absolute top-3 start-3 text-[var(--color-primary)]/30"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4 20 C 8 14, 14 10, 20 8" />
                <path d="M8 17 q 2 -4, 6 -5" />
              </svg>
              {/* stars */}
              <div className="flex gap-0.5 text-[var(--color-accent)] ps-8">
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg
                    key={si}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
                  </svg>
                ))}
              </div>
              <blockquote
                className="text-lg italic text-[var(--color-foreground)] leading-relaxed"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                &ldquo;{q.quote}&rdquo;
              </blockquote>
              <div className="mt-auto pt-2 border-t border-[var(--color-border-brand)]">
                <p className="text-sm font-bold text-[var(--color-primary-dark)]">
                  {q.name}
                </p>
                <p className="text-xs text-[var(--color-muted)]">{q.city}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
