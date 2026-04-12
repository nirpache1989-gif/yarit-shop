/**
 * @file DriftingLeaves — decorative animated background layer
 * @summary 5 SVG sage leaves that slowly drift + rotate in place.
 *          Mounted directly under <body> in the storefront layout,
 *          BEFORE the main content, so it sits at the very bottom
 *          of the z-stack.
 *
 *          Accessibility + performance:
 *            - pointer-events: none — clicks pass through
 *            - aria-hidden — invisible to screen readers
 *            - Only transform + opacity are animated (GPU-composited)
 *            - 5 leaves max — observed sweet spot, 8+ frame drops
 *            - will-change: transform — hints compositor layer
 *            - @media (prefers-reduced-motion: reduce) disables it
 *
 *          In dark mode leaves switch from marine-forest to luminous
 *          jade (via --color-accent) and gain a subtle drop-shadow
 *          glow — see the [data-theme="dark"] .drifting-leaves block
 *          in src/app/globals.css.
 *
 *          NOT mounted in the admin (<AdminThemeInit> is the only
 *          theme infrastructure there — the admin is content-dense
 *          and drifting leaves behind forms would be distracting).
 *
 *          GSAP scroll-responsive layer (2026-04-12): leaves react to
 *          scroll velocity — fall faster when scrolling down, slow/rise
 *          when scrolling up. The GSAP y transform stacks on top of the
 *          CSS keyframe transforms (matrix3d vs matrix composition).
 *          Removing the useGsapScope block restores the original behavior.
 *
 *          See: plan §Track Y.
 */
'use client'

import { useRef } from 'react'
import { useGsapScope } from '@/components/motion/GsapScope'

export function DriftingLeaves() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGsapScope(
    containerRef,
    ({ gsap, ScrollTrigger, reduced }) => {
      if (reduced) return

      const leaves = containerRef.current?.querySelectorAll('.leaf')
      if (!leaves?.length) return

      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          // Normalize velocity: typical scroll is ~300-2000 px/s
          const velocity = self.getVelocity() / 1000
          const clamped = gsap.utils.clamp(-3, 3, velocity)

          // Skip tiny movements to avoid constant micro-tweens
          if (Math.abs(clamped) < 0.15) return

          gsap.to(leaves, {
            y: `+=${clamped * 6}`,
            rotation: `+=${clamped * 1.5}`,
            duration: 0.8,
            ease: 'power2.out',
            overwrite: 'auto',
            stagger: 0.05,
          })
        },
      })

      // Gentle return to baseline when scroll settles — a slow tween
      // that continuously nudges leaves back toward y:0 so the GSAP
      // offset doesn't accumulate infinitely over long scrolling sessions.
      const resetTween = gsap.to(leaves, {
        y: 0,
        rotation: 0,
        duration: 4,
        ease: 'power1.inOut',
        paused: true,
        overwrite: false,
        stagger: 0.08,
      })

      // Play the reset whenever ScrollTrigger reports the page is idle.
      ScrollTrigger.addEventListener('scrollEnd', () => {
        resetTween.restart()
      })

      return () => {
        ScrollTrigger.removeEventListener('scrollEnd', () => {
          resetTween.restart()
        })
      }
    },
    [],
  )

  return (
    <div ref={containerRef} className="drifting-leaves" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`leaf leaf--${i}`}
          viewBox="0 0 40 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 2 C 6 12, 2 30, 10 50 C 14 58, 26 58, 30 50 C 38 30, 34 12, 20 2 Z"
            fill="currentColor"
            opacity="0.85"
          />
          <path
            d="M20 4 L 20 54"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.35"
            fill="none"
          />
        </svg>
      ))}
    </div>
  )
}
