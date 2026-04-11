/**
 * @file HeaderShrinkObserver — client-only scroll observer that toggles `data-scrolled` on the site header
 * @summary Tier-1 upgrade T1.5. A tiny client component that watches
 *          `window.scrollY` and writes `data-scrolled="true"` onto
 *          `#site-header` when the user has scrolled past 80px,
 *          `"false"` otherwise. The CSS in `globals.css` picks up the
 *          attribute and animates background opacity, box-shadow, and
 *          logo size over 280ms.
 *
 *          Why a dedicated client sibling instead of `useGsapScope`:
 *          this is a boolean DOM-attribute toggle, not a tween
 *          timeline. Pulling GSAP in just to flip a string attribute
 *          is overkill — plain `useEffect` + rAF-throttled scroll
 *          listener is 40 lines and has zero bundle cost beyond React
 *          itself.
 *
 *          The parent `Header.tsx` stays a server component. This
 *          file is mounted as a client sibling inside the same React
 *          fragment so the observer hooks onto the rendered header
 *          element by id.
 *
 *          RTL: the observer is purely vertical, so RTL is irrelevant.
 *          Mobile: the CSS rule is gated behind a min-width media
 *          query, so on narrow viewports the attribute is still
 *          written but the visual transition is skipped. See
 *          `globals.css` header#site-header block.
 *          Reduced motion: the CSS transition is disabled in the
 *          existing `@media (prefers-reduced-motion: reduce)` block,
 *          so the shrink snaps instantly — no JS change needed.
 *
 *          Returns `null` — no visible output, just the attribute
 *          side-effect.
 */
'use client'

import { useEffect } from 'react'

// 80px is the threshold the user crosses before the shrink kicks in.
// Kept as a module constant so the value is findable via grep if the
// design team wants it tuned later.
const SCROLL_THRESHOLD = 80

export function HeaderShrinkObserver() {
  useEffect(() => {
    const el = document.getElementById('site-header')
    if (!el) return

    // Cache the last-written state so we only call setAttribute when
    // the boolean actually flips. Avoids writing the same string to
    // the DOM on every scroll frame.
    let scrolled: boolean | null = null
    let rafId: number | null = null

    const applyState = () => {
      rafId = null
      const next = window.scrollY > SCROLL_THRESHOLD
      if (next === scrolled) return
      scrolled = next
      el.setAttribute('data-scrolled', next ? 'true' : 'false')
    }

    const onScroll = () => {
      // rAF-throttle — at most one DOM write per paint frame, no
      // matter how fast the scroll events come in.
      if (rafId != null) return
      rafId = requestAnimationFrame(applyState)
    }

    // Run once on mount so a page that loaded already scrolled gets
    // the right initial attribute without waiting for the first user
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
