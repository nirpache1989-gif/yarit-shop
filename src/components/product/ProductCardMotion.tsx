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

// Ken Burns entrance (2026-04-11 Track D.2). Scroll-triggered one-shot
// on the product-image: the card's photo pops in at scale 1.08 and
// settles to 1.0 the first time it enters the viewport. Pairs with
// the existing T1.2 card blooming entrance — cards bloom up, and the
// photos inside them breathe down to rest.
const KEN_BURNS_FROM_SCALE = 1.08
const KEN_BURNS_DURATION = 1.4 // seconds, slow Ken Burns settle

export function ProductCardMotion({ children, className }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGsapScope(ref, ({ gsap, reduced }) => {
    if (reduced) return
    const el = ref.current
    if (!el) return

    // Cache the child image reference once. The query stays scoped
    // to the article so sibling cards don't bleed events.
    const image = el.querySelector('.product-image')

    // ─── Ken Burns scroll-into-view (Track D.2) ──────────────────
    // Fires ONCE per card the first time it enters the viewport,
    // on every device (including touch) — unlike the hover tilt
    // below which is hover-only. Uses the 2026-04-11 bug-fix pattern
    // (`immediateRender: false + once: true + start: 'top bottom-=40'`)
    // to avoid the hydration-race blank-card incident. See CLAUDE.md
    // rule #12.
    if (image) {
      gsap.from(image, {
        scale: KEN_BURNS_FROM_SCALE,
        duration: KEN_BURNS_DURATION,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: el,
          start: 'top bottom-=40',
          once: true,
        },
      })
    }

    // Touch-only devices don't emit reliable hover events, so skip
    // the tilt + parallax layer below. Ken Burns above still fires.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      !window.matchMedia('(hover: hover)').matches
    ) {
      return
    }

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
