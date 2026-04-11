/**
 * @file FeaturedProductsMotion — client-side choreography for the homepage FeaturedProducts strip
 * @summary Tier-1 GSAP upgrade T1.4. Receives pre-resolved props from
 *          the server parent (`FeaturedProducts.tsx`) and renders the
 *          same visual layout as before — ambient newsletter-bg wash,
 *          Container, heading row (SectionHeading + "See all" button),
 *          grid of ProductCards — but adds two scroll-triggered GSAP
 *          effects on top:
 *
 *            1. **Heading pin (desktop only).** As the user scrolls
 *               into the section the heading row pins to the top of
 *               the viewport (100px margin) and stays there while the
 *               cards slide up past it. Once the section bottom hits
 *               200px from the viewport top, the heading unpins and
 *               scrolls away with the page. Classic editorial pin —
 *               Aesop, Le Labo, Augustinus Bader all use it.
 *               Desktop gate is a `gsap.matchMedia('(min-width: 768px)')`
 *               scope so the pin is automatically torn down and re-set
 *               up on viewport resize.
 *
 *            2. **Card entrance stagger (every viewport).** Each card
 *               fades up from y:32, opacity:0 with a 110ms stagger as
 *               the section enters the viewport. `data-featured-card`
 *               is the selector target. Runs on mobile too.
 *
 *          On reduced motion: `gsap.set` with `clearProps: 'all'` on
 *          the heading row + every card, then early-return. No pin,
 *          no stagger, no ScrollTrigger — identical to the pre-GSAP
 *          baseline for users who prefer reduced motion.
 *
 *          Relationship to existing motion primitives: this component
 *          replaces the `<Reveal>`+`<StaggeredReveal>` usage INSIDE
 *          this file only. Every other consumer of those primitives
 *          is untouched — same pattern as HeroMotion replaced
 *          SplitWords on the Hero only.
 */
'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import {
  ProductCard,
  type ProductCardData,
} from '@/components/product/ProductCard'
import { useGsapScope } from '@/components/motion/GsapScope'

type Props = {
  products: ProductCardData[]
  eyebrow: string
  headline: string
  subheadline: string
  seeAllLabel: string
}

export function FeaturedProductsMotion({
  products,
  eyebrow,
  headline,
  subheadline,
  seeAllLabel,
}: Props) {
  const scopeRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  useGsapScope(scopeRef, ({ gsap, ScrollTrigger, reduced }) => {
    if (reduced) {
      // Snap to settled state — no pin, no stagger.
      gsap.set(['[data-featured-heading]', '[data-featured-card]'], {
        clearProps: 'all',
      })
      return
    }

    // ─── Card entrance stagger — runs on every viewport ──────────────
    // This is outside the matchMedia block so the cards animate in on
    // mobile + tablet + desktop. Only the pin is desktop-gated.
    //
    // ⚠ Bug-fix (2026-04-11): `immediateRender: false` + `once: true`
    // keeps cards at their natural state if the ScrollTrigger fails
    // to fire on hydration. Same failure mode as CategoryGridMotion
    // — Yarit reported the Featured strip rendering as empty boxes
    // on production. See CategoryGridMotion.tsx for the full post-
    // mortem comment.
    gsap.from('[data-featured-card]', {
      y: 32,
      opacity: 0,
      duration: 0.8,
      stagger: 0.11,
      ease: 'power2.out',
      immediateRender: false,
      scrollTrigger: {
        trigger: scopeRef.current,
        // 2026-04-11 QA fix: fire before the cards are visible.
        // Previously `top 75%` fired mid-viewport, which meant that
        // with `immediateRender: false` the cards first snapped to
        // the `from` state and then animated back, producing a
        // visible "flash" on refresh. `top bottom-=40` fires the
        // moment the top of the section reaches 40px above the
        // viewport bottom — the cards are still off-screen, so the
        // snap happens invisibly and only the animation-back is
        // visible as the user scrolls down.
        start: 'top bottom-=40',
        once: true,
      },
    })

    // ─── Heading fade-up + desktop pin ───────────────────────────────
    // matchMedia auto-cleans ScrollTriggers on viewport changes, so a
    // resize from desktop → mobile kills the pin and vice versa. This
    // is cleaner than a raw window.matchMedia gate because GSAP owns
    // the lifecycle.
    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      // Heading fade-up — on desktop, runs alongside the pin setup.
      gsap.from(headingRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top 85%',
          once: true,
        },
      })

      // The pin itself. pinSpacing:false avoids an injected pin-spacer
      // div that would break the Next.js + Tailwind grid flow below
      // the section. endTrigger is the section element, so the pin
      // releases when the section bottom approaches the viewport top.
      // The pin is NOT a `gsap.from` entrance — it's an independent
      // ScrollTrigger that positions the heading while the user
      // scrolls past the section, so it doesn't need the
      // `immediateRender: false` guard.
      ScrollTrigger.create({
        trigger: headingRef.current,
        start: 'top 100px',
        endTrigger: scopeRef.current,
        end: 'bottom 200px',
        pin: headingRef.current,
        pinSpacing: false,
      })
    })

    mm.add('(max-width: 767px)', () => {
      // Mobile path: no pin, but the heading still fades up the same
      // way so the entrance feels consistent across viewports.
      gsap.from(headingRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top 85%',
          once: true,
        },
      })
    })

    // useGSAP + useGsapScope auto-kill tweens/ScrollTriggers on unmount.
    // gsap.matchMedia contexts are killed alongside the scope. No manual
    // cleanup needed here.
  })

  return (
    <section
      ref={scopeRef}
      className="relative py-16"
    >
      {/* Ambient botanical wash (reusing the unused newsletter-bg asset).
          The overflow-hidden lives on this wrapper — NOT on the section —
          because the section has to keep overflow:visible so ScrollTrigger's
          pinned heading (position:fixed under the hood) can escape its
          parent bounds. A parent with overflow:hidden breaks position:fixed
          on descendants. See prompt gotcha #4. */}
      <div
        className="absolute inset-0 -z-0 overflow-hidden opacity-20"
        aria-hidden
      >
        <Image
          src="/brand/ai/newsletter-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)] via-transparent to-[var(--color-background)]" />
      </div>

      <Container className="relative">
        <div
          ref={headingRef}
          data-featured-heading
          className="flex items-end justify-between mb-10"
        >
          <SectionHeading
            eyebrow={eyebrow}
            title={headline}
            subheading={subheadline}
            align="start"
          />
          <Button
            href="/shop"
            variant="ghost"
            size="md"
            className="hidden sm:inline-flex"
          >
            {seeAllLabel} →
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            // 2026-04-11 QA fix: `h-full` on the wrapper + `flex` on
            // the card propagates the tallest row height to every
            // card in the same row, so the 3-up grid is visually
            // even when product titles or descriptions vary in
            // length. Without this the wrapper divs sized to their
            // own content and the grid looked ragged.
            <div key={p.id} data-featured-card className="h-full flex">
              <ProductCard product={p} className="w-full" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
