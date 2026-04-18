/**
 * @file MarqueeBanner — horizontal infinite marquee between hero + featured
 * @summary Renders the translated `marquee.bannerLine` string six times
 *          inside a `.g-banner-track` and lets CSS do the rest:
 *          `@keyframes g-marquee` translates the track 50% over 32s
 *          linearly, `[dir="rtl"] .g-banner-track` reverses direction
 *          so Hebrew users see the text scroll with the reading flow.
 *
 *          Decorative — `role="presentation"` + `aria-hidden` since
 *          the promise copy (free shipping, 30-day returns, hand-
 *          wrapped, ships in 2 days) appears in full on the Shop
 *          and Product pages where screen-reader users can read it
 *          in context. If the user decides the marquee should be
 *          announced, drop `aria-hidden` and render a single visually-
 *          hidden copy for a11y consumers.
 *
 *          Reduced motion: the CSS @media guard in globals.css sets
 *          `.g-banner-track { animation: none !important }` so the
 *          track freezes at its starting position. One copy of the
 *          line remains visible.
 *
 *          Mounted once inside `<main>` at the top of the storefront
 *          layout so every page picks it up. Phase 3 may make this
 *          home-only — for now it's universal so the chrome commits
 *          cleanly.
 */
'use client'

import { useTranslations } from 'next-intl'

const REPEAT_COUNT = 6

export function MarqueeBanner() {
  const t = useTranslations('marquee')
  const line = t('bannerLine')

  return (
    <div className="g-banner" role="presentation" aria-hidden="true">
      <div className="g-banner-track">
        {Array.from({ length: REPEAT_COUNT }, (_, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
    </div>
  )
}
