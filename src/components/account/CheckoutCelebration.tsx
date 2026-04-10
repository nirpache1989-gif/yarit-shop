/**
 * @file CheckoutCelebration — mount-fired confetti + drawn checkmark
 * @summary Tiny client component used by /checkout/success. Renders
 *          a brand-palette SVG checkmark that draws itself via
 *          `stroke-dasharray` on mount, and fires a "success" preset
 *          confetti burst from ConfettiTrigger the moment it hydrates.
 *
 *          Kept separate from the success page itself so the page
 *          can stay a server component (it reads the signed token
 *          from searchParams and fetches the order from Payload —
 *          that has to run server-side).
 *
 *          Fires ONCE on mount — there's no re-trigger. A React
 *          Strict Mode double-mount in dev will fire twice; that's
 *          OK, the preset is short and the second burst overlaps
 *          visually with the first.
 */
'use client'

import { useEffect } from 'react'
import { fireConfetti } from '@/components/motion/ConfettiTrigger'

export function CheckoutCelebration() {
  useEffect(() => {
    void fireConfetti('success')
  }, [])

  return (
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary-dark)] relative">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="checkmark-draw"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <style jsx>{`
        /* Draw the check stroke over ~800ms. The path is roughly
           24 units long; setting stroke-dasharray to 30 with an
           initial dashoffset of 30 hides the stroke, then
           animating to 0 reveals it. A tiny bounce at the end
           (scale 1 → 1.08 → 1) makes the check feel more alive. */
        .checkmark-draw path {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: draw-check 780ms cubic-bezier(0.22, 0.61, 0.36, 1) 160ms forwards;
        }
        @keyframes draw-check {
          to {
            stroke-dashoffset: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .checkmark-draw path {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}
