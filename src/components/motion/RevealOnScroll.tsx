/**
 * @file RevealOnScroll — GSAP ScrollTrigger adapter for `.g-reveal`
 * @summary Finds every element with class `.g-reveal` in the
 *          document and adds the class `.is-in` when each one
 *          crosses the viewport. CSS (in globals.css) owns the
 *          actual visual transition — `opacity 0 → 1` + `translateY
 *          40px → 0` over 0.8s. Optional cascade via the
 *          `.g-reveal-delay-{1,2,3}` helper classes which add
 *          `transition-delay`.
 *
 *          Uses the shared `useGsapScope` helper so the setup has
 *          automatic cleanup on unmount via `useGSAP`. No
 *          `gsap.from()` call is made — the CSS owns the resting
 *          hidden state, and our `ScrollTrigger.create` with
 *          `once: true` simply adds a class. This satisfies
 *          CLAUDE.md rule #12 (`immediateRender: false + once: true
 *          + start: 'top bottom-=40'`) because there is no render
 *          side-effect and the trigger fires exactly once per
 *          element.
 *
 *          Reduced-motion path: every `.g-reveal` gets `.is-in`
 *          synchronously on mount. The CSS `@media (prefers-
 *          reduced-motion: reduce)` block then strips the
 *          transition so the content is just visible.
 *
 *          Mount once, alongside `GardenAlive`, in the storefront
 *          root layout. DOM query runs at mount; Phase 3 pages
 *          that ship `.g-reveal` content will re-mount this scope
 *          on each client navigation inside the shared layout.
 *
 *          See: docs/DESIGN-LIVING-GARDEN.md §9 #5 "Reveal on scroll"
 */
'use client'

import { useRef } from 'react'
import { useGsapScope } from '@/components/motion/GsapScope'

export function RevealOnScroll() {
  const scopeRef = useRef<HTMLDivElement>(null)

  useGsapScope(
    scopeRef,
    ({ ScrollTrigger, reduced }) => {
      const targets = Array.from(document.querySelectorAll<HTMLElement>('.g-reveal'))

      if (reduced) {
        targets.forEach((el) => el.classList.add('is-in'))
        return
      }

      const triggers = targets.map((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom-=40',
          once: true,
          onEnter: () => el.classList.add('is-in'),
        }),
      )

      return () => {
        triggers.forEach((t) => t.kill())
      }
    },
    [],
  )

  // Invisible scope element — useGsapScope needs a DOM node to
  // anchor its cleanup against. Nothing else renders here; the
  // component's only effect is the class toggling above.
  return <div ref={scopeRef} aria-hidden="true" style={{ display: 'none' }} />
}
