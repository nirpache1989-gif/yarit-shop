/**
 * @file HeroMotion — client-side choreography for the homepage Hero
 * @summary Wave G2 of the GSAP motion strategy. Owns the entire Hero
 *          visual (4 background layers + Container + logo + headline +
 *          subheadline + CTAs) as a client component, so GSAP can
 *          orchestrate a unified master timeline across all of them.
 *
 *          Why the whole Hero moved into this file (vs. a narrow
 *          "just the text block" wrapper):
 *            - The parallax on the botanical background (Layer 1) and
 *              the cream vignette fade (Layer 3) need to be refs owned
 *              by the same scope as the entrance timeline. Keeping
 *              them in the server parent and reaching across the
 *              component boundary via DOM queries would work but
 *              breaks useGSAP's scoped-cleanup guarantees.
 *            - All the pieces this component uses (Container, Button,
 *              KenBurns, next/image) are safe to import from a client
 *              component. The parent Hero.tsx stays a server component
 *              that just fetches translations and hands them over as
 *              strings — honoring the CLAUDE.md rule against passing
 *              function props across the server/client boundary.
 *
 *          Master timeline on mount (runs once, gated on reduced motion):
 *            t=0.00  logo fades up from y=20, 1.1s, power3.out
 *            t=0.30  headline words fade up from y=36, rotateX -8°,
 *                    0.9s each, stagger 0.14s, power2.out
 *            t=1.10  subheadline fades up from y=14, 0.8s, power2.out
 *            t=1.40  CTAs fade up from y=8, 0.65s each, stagger 0.09s,
 *                    power2.out
 *          Total intro ~2.1s — slower than the old SplitWords cascade
 *          (~940ms) but matches the "drift" vocabulary the rest of
 *          the site uses (22s Ken Burns, 720ms reveals, 14s iridescent
 *          drift). Restraint over snap.
 *
 *          Scroll parallax (scrubbed via ScrollTrigger):
 *            - Layer 1 (botanical frame): yPercent 0 → -12 as user
 *              scrolls past the hero. Counter-drift that makes the
 *              foreground feel lifted. Ken Burns CSS keyframe stays
 *              untouched on an INNER wrapper — GSAP controls the
 *              outer wrapper, keyframe controls the image inside.
 *            - Layer 3 (cream vignette): opacity 1 → 0.4 as the hero
 *              exits the viewport. Soft handoff to the TrustBar below.
 *            - scrub: 0.6 — a small delay so the parallax lags the
 *              scroll slightly, feeling softer than hard 1:1 binding.
 *
 *          RTL: the parallax is vertical only. Headline word order
 *          in RTL Hebrew renders visually right-to-left but the DOM
 *          order is left-to-right from the logical first word. GSAP
 *          stagger walks DOM order, so the rightmost-visible word
 *          animates first in Hebrew — which is the correct reading
 *          order and feels natural.
 *
 *          Reduced motion: useGsapScope checks `prefers-reduced-motion`
 *          and skips the entire timeline + ScrollTrigger. Elements
 *          render in their final state (GSAP never touches opacity
 *          or transform) so the Hero looks identical to today's
 *          reduced-motion baseline.
 */
'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { KenBurns } from '@/components/motion/KenBurns'
import { useGsapScope } from '@/components/motion/GsapScope'

type Props = {
  headline: string
  subheadline: string
  cta: string
  secondaryCta: string
  logoAlt: string
}

export function HeroMotion({
  headline,
  subheadline,
  cta,
  secondaryCta,
  logoAlt,
}: Props) {
  const scopeRef = useRef<HTMLDivElement>(null)

  // Split the headline into words for the stagger. We do this on render
  // rather than inside useGSAP so the SSR HTML already contains the
  // word spans — crawlers + no-JS users see the complete headline in
  // the correct order.
  const words = headline.split(/\s+/).filter(Boolean)

  useGsapScope(
    scopeRef,
    ({ gsap, reduced }) => {
      // ScrollTrigger is pre-registered in src/lib/motion/gsap.ts, so
      // `scrollTrigger: {...}` config on gsap.to() works without an
      // explicit plugin reference here.
      if (reduced) {
        // Snap everything to the settled state. `clearProps` wipes any
        // transform/opacity GSAP may have set on a previous pass.
        gsap.set(
          [
            '[data-hero-logo]',
            '[data-hero-word]',
            '[data-hero-sub]',
            '[data-hero-cta]',
            '[data-hero-bg]',
            '[data-hero-vignette]',
          ],
          { clearProps: 'all' },
        )
        return
      }

      // ─── Phase 1: entrance master timeline ────────────────────────
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
      })

      tl.from('[data-hero-logo]', {
        y: 20,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
      })
        .from(
          '[data-hero-word]',
          {
            y: 36,
            opacity: 0,
            rotationX: -8,
            duration: 0.9,
            stagger: 0.14,
            transformOrigin: '50% 100%',
          },
          0.3,
        )
        .from(
          '[data-hero-sub]',
          {
            y: 14,
            opacity: 0,
            duration: 0.8,
          },
          1.1,
        )
        .from(
          '[data-hero-cta]',
          {
            y: 8,
            opacity: 0,
            duration: 0.65,
            stagger: 0.09,
          },
          1.4,
        )

      // ─── Phase 2: scroll parallax (scrubbed) ──────────────────────
      // T2.9 #1 — Hero exit parallax tightening. Bigger drift distance
      // on the botanical frame (-12 → -18), deeper cream-vignette fade
      // (0.4 → 0.25), and `power1.inOut` ease so the scrubbed motion
      // accelerates into the mid-scroll and settles at the end rather
      // than binding 1:1 to the scroll position. Combined with the
      // existing `scrub: 0.6` smoothing timer, this is the "buttery"
      // handoff from Hero to TrustBar that T2.9 calls for.
      //
      // One ScrollTrigger for the botanical background counter-drift.
      // yPercent is relative to the element's own height, which is
      // more stable than hard pixel values across viewports.
      gsap.to('[data-hero-bg]', {
        yPercent: -18,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })

      // One ScrollTrigger for the cream vignette fade. Separate from
      // the bg parallax so they can be tuned independently.
      gsap.to('[data-hero-vignette]', {
        opacity: 0.25,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })
    },
  )

  return (
    <section
      ref={scopeRef}
      className="hero-section relative overflow-hidden py-16 md:py-24 min-h-[560px] md:min-h-[720px]"
    >
      {/* Layer 1 — watercolor botanical frame. Full opacity — the
          image itself is already soft/washed so we don't need to
          dim it. The outer wrapper (data-hero-bg) is what GSAP
          parallaxes; the inner KenBurns is the 22s CSS keyframe
          drift. Both compose cleanly because they target different
          DOM nodes. */}
      <div data-hero-bg className="absolute inset-0 -z-0" aria-hidden>
        <KenBurns variant="tl">
          <Image
            src="/brand/ai/hero-bg-2.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </KenBurns>
        {/* Top + bottom gradient fade so the frame blends into the
            page background seamlessly instead of ending on a hard
            edge. */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)]/20 via-transparent to-[var(--color-background)]/60" />
      </div>

      {/* Layer 2 — DARK MODE ONLY. Gold-leaf stone in counter drift
          (tr) so the two KB layers don't move in sync. Hidden in
          light mode via Tailwind's `hidden dark:block` utility. */}
      <div
        className="absolute inset-0 -z-0 hidden dark:block opacity-25"
        aria-hidden
      >
        <KenBurns variant="tr">
          <Image
            src="/brand/ai/night/night-leaves-1.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </KenBurns>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)]/60 via-[var(--color-background)]/20 to-[var(--color-background)]" />
      </div>

      {/* Layer 3 — cream radial vignette behind the logo + headline
          + subheading + CTAs. data-hero-vignette is the GSAP target. */}
      <div
        data-hero-vignette
        className="absolute inset-x-0 inset-y-[8%] -z-0 mx-auto max-w-3xl pointer-events-none"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_80%,transparent)_40%,color-mix(in_oklab,var(--color-background)_40%,transparent)_65%,transparent_85%)] dark:bg-[radial-gradient(ellipse_at_center,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_70%,transparent)_45%,color-mix(in_oklab,var(--color-background)_30%,transparent)_70%,transparent_90%)]" />
      </div>

      <Container className="relative flex flex-col items-center text-center gap-8 md:gap-10">
        <div data-hero-logo className="logo-halo relative">
          <span className="leaf-breathe inline-block">
            <Image
              src="/brand/logo.png"
              alt={logoAlt}
              width={500}
              height={750}
              priority
              className="h-64 md:h-96 w-auto object-contain relative z-10 drop-shadow-[0_6px_18px_rgba(24,51,41,0.18)]"
            />
          </span>
        </div>
        <div className="space-y-4">
          {/* Hero headline — solid primary-dark color (NOT
              iridescent-heading). The iridescent gradient relies on
              `background-clip: text` on the h1 which doesn't reach
              the word glyphs when we wrap each word in an inline-block
              span (inline-block creates its own painting context and
              the parent's clipped background no longer paints through).
              Stayed on a solid display serif here so the headline is
              actually visible over the botanical-frame hero. Color is
              set via inline style to beat Tailwind's arbitrary-value
              text color utility which was losing to the body color
              cascade at the h1 level. */}
          <h1
            className="hero-headline text-5xl md:text-7xl leading-[1.05] max-w-3xl font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-primary-dark)',
            }}
          >
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                data-hero-word
                className="inline-block"
                style={{ perspective: '600px' }}
              >
                {word}
                {i < words.length - 1 ? '\u00A0' : ''}
              </span>
            ))}
          </h1>
          <p
            data-hero-sub
            className="text-base md:text-lg text-[var(--color-muted)] max-w-2xl mx-auto"
          >
            {subheadline}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <span data-hero-cta className="inline-block">
            <Button href="/shop" variant="primary" size="lg">
              {cta}
            </Button>
          </span>
          <span data-hero-cta className="inline-block">
            <Button href="/about" variant="secondary" size="lg">
              {secondaryCta}
            </Button>
          </span>
        </div>
      </Container>
    </section>
  )
}
