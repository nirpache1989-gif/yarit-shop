/**
 * @file CategoryGridMotion — expand-on-enter scroll animation for the category grid
 * @summary Tier-1 GSAP upgrade T1.2. A thin client-side wrapper that
 *          takes the server-rendered category cards as children and
 *          adds a scroll-triggered "expand into view" effect on top
 *          of the existing fade-up stagger. Each card animates from
 *          `scale: 0.96, y: 24, opacity: 0` → natural state with a
 *          90ms-per-card stagger (same rhythm as the old
 *          `<StaggeredReveal>`) plus a subtle scale component that
 *          gives the row a feeling of "blooming" into place.
 *
 *          Why a wrapper instead of a server-side StaggeredReveal:
 *          GSAP with ScrollTrigger gives us precise scale easing and
 *          a single-trigger coordinated stagger that CSS keyframe
 *          stagger can't express cleanly. The CategoryGrid still
 *          fetches data on the server; this wrapper only owns the
 *          entrance animation.
 *
 *          Children contract: every direct child that should animate
 *          must have `data-category-card` set. Non-animated children
 *          (like a wrapper div) are ignored.
 *
 *          Reduced motion: `clearProps: 'all'` snaps every card to
 *          its final state. Same behavior as the rest of the GSAP
 *          motion layer.
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
    gsap.from('[data-category-card]', {
      scale: 0.96,
      y: 24,
      opacity: 0,
      duration: 0.9,
      stagger: 0.09,
      ease: 'power2.out',
      transformOrigin: 'center center',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      },
    })
  })

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
