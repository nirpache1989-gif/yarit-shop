/**
 * @file CategoryGridMotion — expand-on-enter scroll animation + hover tilt for the category grid
 * @summary Tier-1 GSAP upgrade T1.2 (entrance) + Tier-2 T2.8 (hover
 *          tilt). A thin client-side wrapper that takes the server-
 *          rendered category cards as children and adds two layered
 *          motion effects on top:
 *
 *          **T1.2 — scroll-triggered entrance.** Each card animates
 *          from `scale: 0.96, y: 24, opacity: 0` → natural state
 *          with a 90ms-per-card stagger (same rhythm as the old
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
 *          Why a wrapper instead of a server-side StaggeredReveal:
 *          GSAP with ScrollTrigger gives us precise scale easing and
 *          a single-trigger coordinated stagger that CSS keyframe
 *          stagger can't express cleanly. The CategoryGrid still
 *          fetches data on the server; this wrapper only owns the
 *          entrance animation + hover listeners.
 *
 *          Children contract: every direct child that should animate
 *          must have `data-category-card` set. Non-animated children
 *          (like a wrapper div) are ignored.
 *
 *          Reduced motion: `clearProps: 'all'` snaps every card to
 *          its final state and the hover listeners are never
 *          attached. Same behavior as the rest of the GSAP motion
 *          layer.
 */
'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useGsapScope } from '@/components/motion/GsapScope'

type Props = {
  children: ReactNode
  className?: string
}

export function CategoryGridMotion({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useGsapScope(ref, ({ gsap, reduced }) => {
    if (reduced) {
      gsap.set('[data-category-card]', { clearProps: 'all' })
      return
    }

    // One scroll-triggered tween on all cards with staggered entry.
    // The 0.96 → 1 scale is small by design — big scale changes feel
    // cartoonish. We pair it with y: 24 for a slight upward lift and
    // opacity for the fade. All three resolve over 0.9s per card
    // with a 0.09s stagger.
    //
    // ⚠ Bug-fix (2026-04-11): we use `immediateRender: false` + `once:
    // true` on this tween. The previous version used the default
    // `immediateRender: true` which applied `opacity: 0` to the cards
    // on mount and then relied on ScrollTrigger to fire the animation
    // when the trigger entered the viewport. On production Yarit
    // reported that the entire Categories section rendered blank —
    // the cards were stuck at the GSAP `from` state because the
    // ScrollTrigger didn't fire reliably (flaky init on hydration,
    // scroll restoration, browser back/forward, or slow mobile
    // connections where the trigger element's layout hadn't settled
    // by the time ScrollTrigger measured it). Root-cause eval on
    // https://yarit-shop.vercel.app/ showed all 5 cards at
    // `opacity: 0, transform: matrix(0.96, 0, 0, 0.96, 0, 24)`.
    //
    // `immediateRender: false` means the `from` values are NOT
    // applied until the ScrollTrigger actually fires — cards render
    // at their natural state out of the box, so if the trigger ever
    // fails to fire, they stay visible. `once: true` plays the
    // animation once and then destroys the ScrollTrigger so there's
    // no reverse-on-scroll-up glitch. Same pattern applied to
    // FeaturedProductsMotion and MeetYaritMotion in the same commit.
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
        trigger: ref.current,
        // 2026-04-11 QA fix: fire earlier so the `immediateRender: false`
        // snap happens while the cards are still off-screen. See the
        // matching comment in FeaturedProductsMotion.tsx.
        start: 'top bottom-=40',
        once: true,
      },
    })

    // ─── T2.8 magnetic hover tilt (matches G3 ProductCardMotion) ─────
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
      ref.current?.querySelectorAll<HTMLElement>(
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
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
