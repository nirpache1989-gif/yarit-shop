/**
 * @file BranchDivider — decorative section separator (now with draw-in animation)
 * @summary Inline SVG of a hand-drawn sage sprig used between
 *          homepage sections. Centered, muted at ~50% opacity, with
 *          a thin horizontal hairline on either side so the
 *          transition reads as intentional rather than random.
 *
 *          Tier-1 GSAP upgrade T1.3: the SVG now draws itself in as
 *          the divider enters the viewport. The central stem path is
 *          revealed via `stroke-dashoffset` (going from full-length
 *          to zero over ~1.2s), the side hairlines extend from 0 to
 *          their full width via `scaleX`, and the leaves + berries
 *          fade in AFTER the stem has drawn, with a small stagger.
 *          The whole sequence feels like the sprig is being drawn on
 *          handmade paper — very much in the "editorial handmade"
 *          design vocabulary.
 *
 *          Uses currentColor so the stroke picks up the primary
 *          brand color via text-[var(--color-primary)] on the parent.
 *
 *          Reduced motion: `useGsapScope` + `clearProps: 'all'` on
 *          every tweened element. The divider snaps fully visible,
 *          identical to the non-animated baseline.
 *
 *          See: docs/DECISIONS.md — design review punchlist B1.
 *          See: docs/STATE.md — GSAP wave T1.3.
 */
'use client'

import { useRef } from 'react'
import { cn } from '@/lib/cn'
import { useGsapScope } from '@/components/motion/GsapScope'

/** Identifier of the next section below this divider. When set, the
 *  divider's scroll trigger binds to the section's outer element
 *  (via `[data-section="<value>"]`) so the draw-in plays at the
 *  exact moment the next section starts revealing. When omitted,
 *  the divider self-triggers on its own bounds (legacy behavior). */
type DividerFor = 'featured' | 'meetyarit' | 'categories'

type Props = {
  className?: string
  dataFor?: DividerFor
}

export function BranchDivider({ className, dataFor }: Props) {
  const scopeRef = useRef<HTMLDivElement>(null)

  useGsapScope(
    scopeRef,
    ({ gsap, reduced }) => {
      if (reduced) {
        gsap.set(
          [
            '[data-bd-stem]',
            '[data-bd-leaf]',
            '[data-bd-berry]',
            '[data-bd-line]',
          ],
          { clearProps: 'all' },
        )
        return
      }

      // Measure the stem path's total length at setup time so we can
      // set the dasharray/dashoffset to exactly that value. The getTotalLength
      // trick is how SVG "draw" animations work: you set the dasharray
      // equal to the length (so the dashes cover the whole path once)
      // and then animate the dashoffset from `length` → 0, revealing
      // the path character-by-character as the "gap" shrinks.
      const stem = scopeRef.current?.querySelector(
        '[data-bd-stem]',
      ) as SVGPathElement | null
      if (!stem) return
      const stemLength = stem.getTotalLength()
      gsap.set(stem, {
        strokeDasharray: stemLength,
        strokeDashoffset: stemLength,
      })

      // Initial states for the rest of the elements — hidden, ready to
      // be revealed after the stem finishes drawing.
      gsap.set('[data-bd-leaf]', { opacity: 0, scale: 0.9, transformOrigin: 'center center' })
      gsap.set('[data-bd-berry]', { opacity: 0, scale: 0 })
      gsap.set('[data-bd-line]', { scaleX: 0, transformOrigin: 'center center' })

      // T2.9 #6 — connective tissue. When `dataFor` is supplied, find
      // the next section below this divider and use IT as the scroll
      // trigger, with the same `top bottom-=40` start semantics the
      // section itself uses. The divider's draw-in then plays at the
      // exact moment the next section starts revealing, so scrolling
      // the homepage feels like a coordinated narrative rather than
      // a sequence of independent entrance animations. If the lookup
      // fails (no `[data-section="..."]` element found) we fall back
      // to the legacy self-trigger so the divider always animates.
      const nextSection =
        dataFor && typeof document !== 'undefined'
          ? document.querySelector(`[data-section="${dataFor}"]`)
          : null

      const triggerEl: Element | null = nextSection ?? scopeRef.current
      const triggerStart = nextSection ? 'top bottom-=40' : 'top 85%'

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          start: triggerStart,
          // When bound to the next section, play once and drop the
          // reverse behavior — we want the divider to stay drawn after
          // the section reveals, same as the section entrance. When
          // self-triggered (legacy), keep the play/reverse toggle so
          // the original behavior is preserved for any other consumer.
          ...(nextSection
            ? { once: true }
            : { toggleActions: 'play none none reverse' }),
        },
        defaults: { ease: 'power2.out' },
      })

      tl.to('[data-bd-line]', {
        scaleX: 1,
        duration: 0.7,
        stagger: 0.08,
      })
        .to(
          stem,
          {
            strokeDashoffset: 0,
            duration: 1.1,
            ease: 'power1.inOut',
          },
          0.15,
        )
        .to(
          '[data-bd-leaf]',
          {
            opacity: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.08,
          },
          '>-0.3',
        )
        .to(
          '[data-bd-berry]',
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            stagger: 0.1,
          },
          '<0.1',
        )

      // --- Scroll-scrubbed ambient motion (additive, post-entrance) ---
      // A gentle sway on leaves + stem pulse as the user scrolls past.
      // This is a SEPARATE ScrollTrigger from the entrance timeline —
      // removing this block restores the exact pre-change behavior.
      const scrubTrigger = scopeRef.current
      if (!scrubTrigger) return

      gsap.to('[data-bd-leaf]', {
        rotation: 4,
        stagger: { each: 0.05, from: 'edges' },
        scrollTrigger: {
          trigger: scrubTrigger,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1.2,
        },
      })

      gsap.to('[data-bd-stem]', {
        attr: { 'stroke-width': 1.8 },
        scrollTrigger: {
          trigger: scrubTrigger,
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: 1.5,
        },
      })

      gsap.to('[data-bd-berry]', {
        scale: 1.3,
        stagger: 0.04,
        scrollTrigger: {
          trigger: scrubTrigger,
          start: 'top 75%',
          end: 'bottom 25%',
          scrub: 1,
        },
      })
    },
    [dataFor],
  )

  return (
    <div
      ref={scopeRef}
      className={cn(
        'flex items-center justify-center py-4 text-[var(--color-primary)]/50',
        className,
      )}
      aria-hidden
    >
      <span
        data-bd-line
        className="h-px flex-1 max-w-[140px] bg-[var(--color-border-brand)]"
      />
      <svg
        width="120"
        height="40"
        viewBox="0 0 120 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-3"
      >
        {/* central stem — the star of the draw animation */}
        <path data-bd-stem d="M10 20 C 40 14, 80 26, 110 20" />
        {/* leaves — sage-like ovals on alternating sides */}
        <path data-bd-leaf d="M28 18 q 2 -8, 10 -6 q -2 8, -10 6 z" fill="currentColor" fillOpacity="0.25" />
        <path data-bd-leaf d="M44 23 q -2 8, -10 6 q 2 -8, 10 -6 z" fill="currentColor" fillOpacity="0.25" />
        <path data-bd-leaf d="M60 18 q 2 -9, 10 -7 q -2 9, -10 7 z" fill="currentColor" fillOpacity="0.25" />
        <path data-bd-leaf d="M76 22 q -2 8, -10 6 q 2 -8, 10 -6 z" fill="currentColor" fillOpacity="0.25" />
        <path data-bd-leaf d="M92 18 q 2 -8, 10 -6 q -2 8, -10 6 z" fill="currentColor" fillOpacity="0.25" />
        {/* small dot berries */}
        <circle data-bd-berry cx="22" cy="22" r="1.4" fill="currentColor" fillOpacity="0.4" />
        <circle data-bd-berry cx="98" cy="22" r="1.4" fill="currentColor" fillOpacity="0.4" />
      </svg>
      <span
        data-bd-line
        className="h-px flex-1 max-w-[140px] bg-[var(--color-border-brand)]"
      />
    </div>
  )
}
