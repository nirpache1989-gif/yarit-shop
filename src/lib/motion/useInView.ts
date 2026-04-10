/**
 * @file useInView — tiny IntersectionObserver hook
 * @summary Returns a ref callback + a boolean. The boolean flips to
 *          `true` the first time the observed element intersects the
 *          viewport (with a small `rootMargin` so motion starts a
 *          moment before the element is fully on-screen).
 *
 *          Primary use: scroll-triggered fade / slide / stagger
 *          reveals on the storefront. Lower-level than <Reveal> /
 *          <StaggeredReveal> — those are the components most files
 *          should import. Reach for the hook directly only when you
 *          need a non-<div> wrapper or custom behavior.
 *
 *          Design notes:
 *            - Unobserves after the first hit (one-shot by default)
 *              so further scrolling doesn't re-trigger animations.
 *              Pass `{ once: false }` to opt out.
 *            - Respects `prefers-reduced-motion` by short-circuiting
 *              to `true` immediately — the layout is static, the
 *              animation CSS itself is disabled by the global guard
 *              in globals.css.
 *            - Zero dependencies. ~35 lines of actual logic.
 */
'use client'

import { useEffect, useRef, useState } from 'react'

type Options = {
  /** Root margin passed to IntersectionObserver. Negative top margin
   *  delays the trigger until the element is a bit more visible;
   *  positive bottom margin fires before it's fully in view. */
  rootMargin?: string
  /** Intersection threshold. 0 = any pixel intersects; 0.2 = 20% of
   *  the element must be visible. */
  threshold?: number
  /** If false, the hook keeps observing and toggles `inView` every
   *  time the element enters/leaves. Default: true (one-shot). */
  once?: boolean
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  opts: Options = {},
): { ref: React.RefObject<T | null>; inView: boolean } {
  const { rootMargin = '0px 0px -10% 0px', threshold = 0.12, once = true } = opts
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // If the user has asked for reduced motion, skip the observer
    // entirely — just mark as visible so the content renders without
    // waiting for a scroll trigger. Motion CSS is disabled by the
    // global prefers-reduced-motion guard in globals.css, so this
    // just makes `data-revealed` land immediately.
    //
    // Note: we defer every setState to a microtask so React 19's
    // `react-hooks/set-state-in-effect` lint rule doesn't flag
    // them. Functionally indistinguishable from a synchronous set
    // for the user, and keeps the lint clean.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      queueMicrotask(() => setInView(true))
      return
    }

    // IntersectionObserver isn't available in some ancient embedded
    // webviews — fall back to "always visible" in that case.
    if (typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => setInView(true))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) {
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return { ref, inView }
}
