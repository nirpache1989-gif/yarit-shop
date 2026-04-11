/**
 * @file GsapScope — central GSAP + reduced-motion helper hook
 * @summary Every client component that wants to use GSAP repeats the
 *          same boilerplate: (1) check reduced motion, (2) call
 *          `useGSAP()` from `@gsap/react` with a scope ref so the
 *          timeline cleans up on unmount, (3) if reduced motion is
 *          preferred, snap everything to the final state instead of
 *          animating. This hook bundles all three into a single call.
 *
 *          Usage:
 *
 *              const scopeRef = useRef<HTMLDivElement>(null)
 *              useGsapScope(
 *                scopeRef,
 *                ({ gsap, reduced }) => {
 *                  if (reduced) {
 *                    gsap.set('[data-anim]', { clearProps: 'all' })
 *                    return
 *                  }
 *                  gsap.from('[data-anim]', { y: 20, opacity: 0 })
 *                },
 *                [] // dependency array, same shape as useGSAP
 *              )
 *
 *          Inside the callback you get:
 *            - `gsap` — the shared GSAP instance from `@/lib/motion/gsap`
 *              (ScrollTrigger is pre-registered)
 *            - `ScrollTrigger` — for scroll-linked animations
 *            - `reduced` — `true` if the user prefers reduced motion
 *
 *          Cleanup is automatic via `useGSAP`. Any tween, timeline, or
 *          ScrollTrigger created inside the callback is killed when the
 *          component unmounts or when the dependency array changes.
 *
 *          This is a hook, not a component — the filename just keeps
 *          the `GsapScope` name from the plan for searchability. Living
 *          in `src/components/motion/` alongside `Reveal.tsx` etc. keeps
 *          all motion helpers co-located for new contributors.
 */
'use client'

import type { DependencyList, RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/motion/gsap'
import { useGsapReducedMotion } from '@/lib/motion/useGsapReducedMotion'

type SetupContext = {
  gsap: typeof gsap
  ScrollTrigger: typeof ScrollTrigger
  reduced: boolean
}

type CleanupFn = () => void
type SetupFn = (ctx: SetupContext) => void | CleanupFn

export function useGsapScope(
  scopeRef: RefObject<HTMLElement | null>,
  setup: SetupFn,
  deps: DependencyList = [],
): void {
  const reduced = useGsapReducedMotion()

  useGSAP(
    () => {
      // The setup may return a cleanup function for anything that
      // useGSAP doesn't auto-clean (DOM event listeners, timers,
      // custom observers). useGSAP runs our returned cleanup on
      // unmount or when dependencies change, same shape as useEffect.
      return setup({ gsap, ScrollTrigger, reduced })
    },
    // `scope` is how useGSAP scopes selector strings + auto-cleanup.
    // Including `reduced` in dependencies re-runs the setup if the
    // user toggles their OS reduced-motion preference mid-session.
    { scope: scopeRef, dependencies: [reduced, ...deps] },
  )
}
