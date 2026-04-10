/**
 * @file CountUp — number that counts up from 0 to its target on mount
 * @summary Tiny client component used by Wave O (order totals) and
 *          Wave D (admin dashboard stat tiles). Renders a span whose
 *          text content interpolates from 0 to `value` over `duration`
 *          ms on first mount (and again if the `value` prop later
 *          changes, which for our current usage doesn't happen —
 *          both the order total and the admin stat tiles come from
 *          server components that render once per request).
 *
 *          Rendering approach:
 *            - Initial state is `value` so SSR and the first paint
 *              show the real number (no hydration mismatch, no brief
 *              flash of "0" for crawler/Reader Mode users).
 *            - On mount the effect schedules `requestAnimationFrame`.
 *              The first tick sets the start time, every subsequent
 *              tick interpolates via an easeOutCubic curve and calls
 *              `setDisplay` — so all setState lives inside the RAF
 *              callback, never the synchronous effect body.
 *            - Under `prefers-reduced-motion` the effect returns
 *              early and the static `value` stays on screen.
 *
 *          IMPORTANT — string props only:
 *            - Parent callers are ALMOST ALWAYS server components
 *              (YaritDashboard, FulfillmentView, /account/orders/[id]).
 *              Server components cannot pass function props to client
 *              components — Next 16 throws
 *              "Functions cannot be passed directly to Client
 *              Components" at runtime. So this component exposes
 *              `prefix`, `suffix`, and `locale` as strings and owns
 *              the `toLocaleString(locale)` call internally.
 */
'use client'

import { useEffect, useState, type CSSProperties } from 'react'

type Props = {
  value: number
  /** Duration in ms. Default 800. Clamped to [300, 1600]. */
  duration?: number
  /** Optional prefix appended before the number (e.g. "₪"). */
  prefix?: string
  /** Optional suffix appended after the number. */
  suffix?: string
  /** BCP 47 locale for `toLocaleString`. Default: 'he-IL'. */
  locale?: string
  /** Passed through. */
  className?: string
  /** Passed through. */
  style?: CSSProperties
}

// cubic-bezier(0.22, 0.61, 0.36, 1) sampled numerically — the same
// curve the rest of the brand uses for reveal animations. Keeping
// the count in sync with the visual vocabulary makes the whole page
// breathe as one.
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function CountUp({
  value,
  duration = 800,
  prefix = '',
  suffix = '',
  locale = 'he-IL',
  className,
  style,
}: Props) {
  const clampedDuration = Math.min(1600, Math.max(300, duration))
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      // Keep the static value; don't animate.
      return
    }

    let raf = 0
    let startTime: number | null = null

    const tick = (now: number) => {
      if (startTime === null) {
        startTime = now
      }
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / clampedDuration)
      const eased = easeOutCubic(t)
      setDisplay(Math.round(eased * value))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [value, clampedDuration])

  return (
    <span className={`count-up ${className ?? ''}`} style={style}>
      {prefix}
      {display.toLocaleString(locale)}
      {suffix}
    </span>
  )
}
