/**
 * @file ProductCardMotion — magnetic cursor-tilt wrapper for ProductCard
 * @summary Wave G3 of the GSAP motion strategy. A client component
 *          that renders the `<article>` root of a product card and
 *          gives it a subtle 3D tilt that follows the cursor, with
 *          smooth momentum return on mouseleave. Layers on top of the
 *          existing `.product-card:hover` translateY + shadow CSS —
 *          the CSS still provides the "card lifts off the page"
 *          moment, and this wrapper adds the "the product is alive
 *          under your cursor" moment.
 *
 *          Inspired by Aesop / Le Labo / Augustinus Bader product
 *          cards. Restraint is the key — max tilt is ±3°, not ±8°.
 *
 *          Behavior:
 *            - On pointermove within the card bounds, rotate Y by
 *              normalizedX * 3° and X by normalizedY * -3°.
 *            - The inner `.product-image` (existing CSS class) gets
 *              an additional translate of normalizedX * 4px /
 *              normalizedY * 4px — a small parallax-of-depth inside
 *              the card.
 *            - On pointerleave, tween back to rest over 900ms with
 *              `power3.out` (slower return feels like momentum).
 *
 *          Guardrails:
 *            - Touch devices (no `hover: hover` media): skip entirely.
 *              Touch users already get the CSS lift + CSS image scale.
 *            - prefers-reduced-motion: skip entirely. Same CSS-only
 *              fallback as the CSS hover path.
 *            - RTL: the X-axis is viewport coordinates, not reading
 *              direction, so no flip needed.
 *            - Keyboard focus: unaffected. The `:focus-visible` outline
 *              in globals.css handles keyboard users.
 *
 *          Why this component renders the `<article>` directly (rather
 *          than wrapping it in a div): the grid in `/shop`, featured,
 *          and category pages sets its children as grid items. Adding
 *          a wrapper div between the grid and the article would need
 *          extra `h-full` plumbing to preserve row heights. Owning the
 *          article here is cleaner. The parent (ProductCard.tsx) keeps
 *          all data fetching + the locale-aware `<Link>` intact.
 */
'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useGsapScope } from '@/components/motion/GsapScope'

type Props = {
  children: ReactNode
  className?: string
}

// Tuning constants — kept at the top for easy adjustment without
// re-reading the effect body.
const MAX_TILT_DEG = 3 // ceiling for rotationX/rotationY
const IMAGE_PARALLAX_PX = 4 // translate range on the inner image
const HOVER_DURATION = 0.6 // seconds, tween while cursor moves
const LEAVE_DURATION = 0.9 // seconds, tween back on pointerleave

export function ProductCardMotion({ children, className }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGsapScope(ref, ({ gsap, reduced }) => {
    if (reduced) return
    const el = ref.current
    if (!el) return

    // Touch-only devices don't emit reliable hover events, so skip.
    // This matches the `.product-card:hover` CSS fallback behavior.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      !window.matchMedia('(hover: hover)').matches
    ) {
      return
    }

    // Cache the child image reference once. The query stays scoped
    // to the article so sibling cards don't bleed events.
    const image = el.querySelector('.product-image')

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      // Normalized coordinates: (0, 0) at card center, (±1, ±1) at corners
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1

      gsap.to(el, {
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
      gsap.to(el, {
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

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)

    // useGSAP handles GSAP cleanup; we still need to remove our own
    // DOM listeners on unmount. This return callback is invoked by
    // useGSAP's internal `revert()` call.
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  })

  return (
    <article ref={ref} className={className}>
      {children}
    </article>
  )
}
