/**
 * @file CategoryGridMotion — full CategoryGrid section with T1.2 entrance, T2.8 hover tilt, and T2.9 desktop header pin
 * @summary This component owns the entire CategoryGrid section (outer
 *          `<section>`, `<Container>`, heading, and tile grid) so
 *          every moving piece can share one `useGsapScope` and a
 *          single ScrollTrigger graph.
 *
 *          **T1.2 — scroll-triggered entrance.** Each card animates
 *          from `scale: 0.96, y: 24, opacity: 0` → natural state with
 *          a 90ms-per-card stagger (same rhythm as the old
 *          `<StaggeredReveal>`) plus a subtle scale that gives the
 *          row a feeling of "blooming" into place.
 *
 *          **T2.8 — magnetic hover tilt.** Once the entrance has
 *          played, each card listens for `pointermove` and rotates
 *          ±3° in both axes following the cursor, with a small
 *          parallax translate on the inner background image. Same
 *          vocabulary as `ProductCardMotion` (G3) so the "touchable
 *          card" feel is consistent across homepage surfaces. Gated
 *          on `hover: hover` (skip on touch) + reduced-motion.
 *
 *          **T2.9 #4 — desktop header pin.** On `(min-width: 768px)`
 *          the SectionHeading pins to `top: 100px` while the tile
 *          grid scrolls past it, then releases when the section's
 *          bottom reaches 200px from the viewport top. Mobile path
 *          keeps the heading scrolling normally (no pin) but still
 *          fades up. Uses `gsap.matchMedia()` so the pin auto-tears-
 *          down on viewport resize. Same pattern as
 *          `FeaturedProductsMotion.tsx`.
 *
 *          **T2.9 #6 — connective tissue.** The outer `<section>`
 *          carries `data-section="categories"` so the BranchDivider
 *          above it can target this section as its scroll trigger.
 *
 *          Reduced motion: `clearProps: 'all'` snaps every card +
 *          the heading to their final state, and the hover listeners
 *          are never attached. No pin, no stagger, no ScrollTrigger.
 *
 *          Relationship to CategoryGrid.tsx: the server shell
 *          resolves translations + fetches Payload categories and
 *          passes a serializable `tiles[]` shape + labels here.
 *          Same split as Hero → HeroMotion.
 */
'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useGsapScope } from '@/components/motion/GsapScope'

export type CategoryTile = {
  id: string
  slug: string
  title: string
  imgUrl: string | null
  num: string
}

type Props = {
  tiles: CategoryTile[]
  eyebrow: string
  headline: string
}

export function CategoryGridMotion({ tiles, eyebrow, headline }: Props) {
  const scopeRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  useGsapScope(scopeRef, ({ gsap, ScrollTrigger, reduced }) => {
    if (reduced) {
      gsap.set(
        ['[data-category-card]', '[data-category-heading]'],
        { clearProps: 'all' },
      )
      return
    }

    // ─── T1.2 card blooming entrance (unchanged) ─────────────────
    // One scroll-triggered tween on all cards with staggered entry.
    // The 0.96 → 1 scale is small by design — big scale changes feel
    // cartoonish. We pair it with y: 24 for a slight upward lift and
    // opacity for the fade. All three resolve over 0.9s per card
    // with a 0.09s stagger.
    //
    // ⚠ Bug-fix (2026-04-11): `immediateRender: false` + `once: true`
    // keep the cards at their natural state if the ScrollTrigger
    // fails to fire on hydration. See the post-mortem in the old
    // CategoryGridMotion comments for the full failure mode. Same
    // pattern applied to FeaturedProductsMotion + MeetYaritMotion.
    gsap.from('[data-category-card]', {
      scale: 0.96,
      y: 24,
      opacity: 0,
      duration: 0.9,
      stagger: 0.09,
      ease: 'power2.out',
      transformOrigin: 'center center',
      immediateRender: false,
      scrollTrigger: {
        trigger: scopeRef.current,
        // 2026-04-11 QA fix: fire earlier so the `immediateRender: false`
        // snap happens while the cards are still off-screen.
        start: 'top bottom-=40',
        once: true,
      },
    })

    // ─── T2.9 #4 desktop header pin + heading fade-up ────────────
    // matchMedia auto-cleans ScrollTriggers on viewport changes, so
    // a resize from desktop → mobile kills the pin and vice versa.
    // This is cleaner than a raw window.matchMedia gate because GSAP
    // owns the lifecycle.
    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      // Heading fade-up — desktop path runs alongside the pin setup.
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
      // div that would break the grid flow below the section.
      // endTrigger is the section element, so the pin releases when
      // the section bottom approaches the viewport top. The pin is
      // NOT a `gsap.from` entrance — it's an independent
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

    // ─── T2.8 magnetic hover tilt (matches G3 ProductCardMotion) ─
    // Touch-only devices skip — they don't emit reliable hover events
    // and get the CSS `hover:-translate-y-1` fallback instead.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      !window.matchMedia('(hover: hover)').matches
    ) {
      return
    }

    const MAX_TILT_DEG = 3
    const IMAGE_PARALLAX_PX = 4
    const HOVER_DURATION = 0.6
    const LEAVE_DURATION = 0.9

    const cards = Array.from(
      scopeRef.current?.querySelectorAll<HTMLElement>(
        '[data-category-card]',
      ) ?? [],
    )
    const cleanups: Array<() => void> = []

    for (const card of cards) {
      // Each card owns its own image reference (the <Image> that
      // Next.js renders inside the tile's Link). The fallback to
      // null means "no parallax on this tile" which degrades cleanly.
      const image = card.querySelector<HTMLElement>('img')

      const onMove = (e: PointerEvent) => {
        const rect = card.getBoundingClientRect()
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1

        gsap.to(card, {
          rotationY: nx * MAX_TILT_DEG,
          rotationX: -ny * MAX_TILT_DEG,
          duration: HOVER_DURATION,
          ease: 'power2.out',
          transformPerspective: 1000,
          transformOrigin: 'center center',
        })

        if (image) {
          gsap.to(image, {
            x: nx * IMAGE_PARALLAX_PX,
            y: ny * IMAGE_PARALLAX_PX,
            duration: HOVER_DURATION,
            ease: 'power2.out',
          })
        }
      }

      const onLeave = () => {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: LEAVE_DURATION,
          ease: 'power3.out',
        })
        if (image) {
          gsap.to(image, {
            x: 0,
            y: 0,
            duration: LEAVE_DURATION,
            ease: 'power3.out',
          })
        }
      }

      card.addEventListener('pointermove', onMove)
      card.addEventListener('pointerleave', onLeave)
      cleanups.push(() => {
        card.removeEventListener('pointermove', onMove)
        card.removeEventListener('pointerleave', onLeave)
      })
    }

    // useGSAP + useGsapScope handle GSAP timeline cleanup; this
    // return drops our DOM listeners when the scope reverts.
    return () => {
      for (const fn of cleanups) fn()
    }
  })

  return (
    <section
      ref={scopeRef}
      data-section="categories"
      className="py-20 md:py-24"
    >
      <Container>
        <div
          ref={headingRef}
          data-category-heading
          className="mb-12"
        >
          <SectionHeading eyebrow={eyebrow} title={headline} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {tiles.map((tile) => (
            <Link
              key={tile.id}
              href={`/shop?category=${tile.slug}`}
              data-category-card
              className="group relative aspect-[4/5] rounded-[var(--radius-card)] border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] overflow-hidden flex flex-col justify-end p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-primary)]/40"
            >
              {tile.imgUrl && (
                <Image
                  src={tile.imgUrl}
                  alt={tile.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                />
              )}
              {/* Soft cream-to-transparent gradient at the bottom only —
                  lighter than the previous black overlay so the tiles
                  feel airy rather than heavy. */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--color-background)]/95 via-[var(--color-background)]/40 to-transparent" />
              <div className="relative flex flex-col gap-1">
                <span className="eyebrow eyebrow--accent">
                  {tile.num} / {headline}
                </span>
                <h3
                  className="text-lg md:text-xl font-bold text-[var(--color-primary-dark)] leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {tile.title}
                </h3>
                {/* Gold hairline that extends on hover — mirrors
                    the nav-link underline treatment. */}
                <span className="block h-px w-0 bg-[var(--color-accent-deep)] transition-all duration-500 group-hover:w-12" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
