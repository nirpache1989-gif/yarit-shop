/**
 * @file HeaderShrinkObserver — client-only scroll observer that drives sticky-header compression
 * @summary Tier-1 upgrade T1.5 + 2026-04-11 Track D.1 scroll-scrubbed
 *          upgrade. Watches `window.scrollY` and writes TWO things on
 *          `#site-header` on every paint frame:
 *
 *          1. `data-scrolled="true|false"` — binary attribute, flipped
 *             once the user crosses `SCROLL_THRESHOLD_END`. Kept as
 *             the reduced-motion fallback + as a CSS hook for rules
 *             that want a hard on/off state (e.g. blur enabled/disabled).
 *
 *          2. `--header-scroll-progress: {0..1}` — a CSS custom
 *             property that smoothly interpolates from 0 (top of
 *             page) to 1 (past `SCROLL_THRESHOLD_END`). CSS rules in
 *             globals.css use this with `calc()` to drive a continuous
 *             shrink of the logo, a continuous bg alpha ramp, and a
 *             continuous box-shadow ramp — so the compression feels
 *             like a smooth scrub rather than a 280ms binary snap at
 *             a single scroll point.
 *
 *          Why a dedicated client sibling instead of `useGsapScope`:
 *          we only need a scalar 0→1 value written onto an element.
 *          Pulling GSAP in just for a rAF-throttled DOM write is
 *          overkill — plain useEffect + rAF is 50 lines and has zero
 *          bundle cost beyond React itself. The CSS does all the
 *          interpolation via calc().
 *
 *          The parent `Header.tsx` stays a server component. This
 *          file is mounted as a client sibling inside the same React
 *          fragment so the observer hooks onto the rendered header
 *          element by id.
 *
 *          RTL: purely vertical, RTL is irrelevant.
 *          Mobile: the CSS interpolation rules are gated on
 *          `min-width: 768px`, so on narrow viewports the progress
 *          value is still written but has no visual effect.
 *          Reduced motion: the CSS `prefers-reduced-motion: reduce`
 *          block overrides the interpolation with a static
 *          `data-scrolled="true"` snap. No JS change needed.
 *
 *          Returns `null` — no visible output, just the DOM side-effects.
 */
'use client'

import { useEffect } from 'react'

// Scroll-scrub range. Progress is 0 at scrollY <= START, 1 at
// scrollY >= END, linear between. END also doubles as the threshold
// for the binary `data-scrolled` attribute so the two stay in sync.
const SCROLL_THRESHOLD_START = 0
const SCROLL_THRESHOLD_END = 120

export function HeaderShrinkObserver() {
  useEffect(() => {
    const el = document.getElementById('site-header')
    if (!el) return

    // Cache the last-written state so we avoid no-op DOM writes. The
    // progress value is rounded to 3 decimal places before comparison
    // so sub-pixel scroll jitter doesn't spam setProperty on every
    // frame.
    let lastProgress = -1
    let lastScrolled: boolean | null = null
    let rafId: number | null = null

    const applyState = () => {
      rafId = null
      const scrollY = window.scrollY
      const raw =
        (scrollY - SCROLL_THRESHOLD_START) /
        (SCROLL_THRESHOLD_END - SCROLL_THRESHOLD_START)
      const progress = Math.max(0, Math.min(1, raw))
      const rounded = Math.round(progress * 1000) / 1000

      if (rounded !== lastProgress) {
        lastProgress = rounded
        el.style.setProperty('--header-scroll-progress', String(rounded))
      }

      const scrolled = scrollY > SCROLL_THRESHOLD_END
      if (scrolled !== lastScrolled) {
        lastScrolled = scrolled
        el.setAttribute('data-scrolled', scrolled ? 'true' : 'false')
      }
    }

    const onScroll = () => {
      // rAF-throttle — at most one DOM write per paint frame, no
      // matter how fast the scroll events come in.
      if (rafId != null) return
      rafId = requestAnimationFrame(applyState)
    }

    // Run once on mount so a page that loaded already scrolled gets
    // the right initial state without waiting for the first user
    // scroll event.
    applyState()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}
