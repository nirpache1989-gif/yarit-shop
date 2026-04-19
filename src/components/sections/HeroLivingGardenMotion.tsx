/**
 * @file HeroLivingGardenMotion — client choreography for the Living
 *       Garden homepage hero.
 * @summary Renders the `.g-hero` DOM (1.3fr / 1fr grid, kicker +
 *          mixed-italic headline + lead + CTA row + dashed meta
 *          strip on the left; plate-visual + two float badges +
 *          handwritten note on the right) and orchestrates a short
 *          GSAP entrance timeline that mirrors the cadence of the
 *          old HeroMotion (kicker → headline words stagger → lead →
 *          CTAs → meta → floaters) so the rhythm feels consistent
 *          with the rest of the site.
 *
 *          GSAP is entry-only — no scroll parallax here (the hero
 *          sits above the fold). `useGsapScope` handles cleanup +
 *          reduced-motion (if `reduced`, we snap everything visible
 *          instead of animating).
 *
 *          Reveal-on-scroll after initial entry is handled by
 *          `RevealOnScroll` via the `.g-reveal` class on the outer
 *          section (added in Slice H polish).
 */
'use client'

import { useRef } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { useGsapScope } from '@/components/motion/GsapScope'

type Props = {
  kicker: string
  title1: string
  title2: string
  title3: string
  lead: string
  cta1: string
  cta2: string
  handwrittenNote: string
  statYears: string
  statProducts: string
  statHands: string
  plateTag: string
  badgeNatural: string
  badgeSmallBatch: string
  visualNote: string
}

export function HeroLivingGardenMotion({
  kicker,
  title1,
  title2,
  title3,
  lead,
  cta1,
  cta2,
  handwrittenNote,
  statYears,
  statProducts,
  statHands,
  plateTag,
  badgeNatural,
  badgeSmallBatch,
  visualNote,
}: Props) {
  const scopeRef = useRef<HTMLElement>(null)

  useGsapScope(scopeRef, ({ gsap, reduced }) => {
    if (reduced) {
      // Snap to final state — no timeline, no stagger.
      gsap.set(
        [
          '[data-hero-kicker]',
          '[data-hero-word]',
          '[data-hero-lead]',
          '[data-hero-cta] > *',
          '[data-hero-meta] > div',
          '[data-hero-visual]',
          '[data-hero-float]',
        ],
        { clearProps: 'all' },
      )
      return
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.from('[data-hero-kicker]', { opacity: 0, y: 14, duration: 0.6 }, 0)
      .from(
        '[data-hero-word]',
        {
          opacity: 0,
          y: 36,
          rotationX: -8,
          duration: 0.9,
          stagger: 0.08,
        },
        0.25,
      )
      .from(
        '[data-hero-visual]',
        { opacity: 0, scale: 0.96, duration: 1.2, ease: 'power3.out' },
        0.5,
      )
      .from('[data-hero-lead]', { opacity: 0, y: 14, duration: 0.8 }, 1.05)
      .from(
        '[data-hero-cta] > *',
        { opacity: 0, y: 8, duration: 0.65, stagger: 0.09 },
        1.35,
      )
      .from(
        '[data-hero-meta] > div',
        { opacity: 0, y: 8, duration: 0.5, stagger: 0.08 },
        1.6,
      )
      .from(
        '[data-hero-float]',
        {
          opacity: 0,
          scale: 0.85,
          duration: 0.55,
          stagger: 0.1,
          ease: 'back.out(1.6)',
        },
        1.8,
      )
  })

  return (
    <section
      ref={scopeRef}
      className="g-hero g-wrap g-reveal"
      data-section="hero"
    >
      <div className="g-hero-grid">
        <div>
          <span className="g-kicker" data-hero-kicker>
            {kicker}
          </span>
          <h1 className="g-h1">
            <span data-hero-word>{title1}</span>{' '}
            <em data-hero-word>
              <span className="g-under">{title2}</span>
            </em>
            <span data-hero-word>{title3}</span>
          </h1>
          <p className="g-hero-lead" data-hero-lead>
            {lead}
          </p>
          <div className="g-hero-cta" data-hero-cta>
            <Link href="/shop" className="g-btn g-btn-leaf">
              {cta1}
            </Link>
            <Link href="/about" className="g-btn g-btn-ghost">
              {cta2}
            </Link>
            <span className="g-note" style={{ marginInlineStart: 12 }}>
              {handwrittenNote} →
            </span>
          </div>
          <div className="g-hero-meta" data-hero-meta>
            <div>
              <strong>17</strong>
              <span>{statYears}</span>
            </div>
            <div>
              <strong>34</strong>
              <span>{statProducts}</span>
            </div>
            <div>
              <strong>Yarit</strong>
              <span>{statHands}</span>
            </div>
          </div>
        </div>

        <div className="g-hero-visual" data-hero-visual>
          <div className="g-plate g-plate-leaf">
            <span className="g-plate-tag">{plateTag}</span>
            <span className="g-plate-specimen">№ 001</span>
          </div>
          <span
            className="g-float-badge"
            data-hero-float
            style={{ top: 30, insetInlineEnd: -30 }}
          >
            <span className="dot" />
            {badgeNatural}
          </span>
          <span
            className="g-float-badge ember"
            data-hero-float
            style={{ bottom: 80, insetInlineStart: -40 }}
          >
            <span className="dot" />
            {badgeSmallBatch}
          </span>
          <span
            className="g-hero-note"
            data-hero-float
            style={{ bottom: 20, insetInlineEnd: 30 }}
          >
            {visualNote}
          </span>
        </div>
      </div>
    </section>
  )
}
