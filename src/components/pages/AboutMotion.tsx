/**
 * @file AboutMotion — client-side GSAP reveals for the About page body
 * @summary Tier-S GSAP upgrade S3. The About page's body essay section
 *          (below the fold) gets GSAP ScrollTrigger-controlled reveals
 *          instead of the IntersectionObserver-backed `<Reveal>`. The
 *          hero section above the fold stays in the server parent with
 *          its existing `<Reveal>` + `<KenBurns>`.
 *
 *          Four elements cascade in with staggered delays:
 *            1. Body paragraph (first-letter drop cap)
 *            2. Pull quote (oversized italic serif)
 *            3. "More coming soon" sparkle line
 *            4. Back-to-home link
 *
 *          Accessibility: reduced-motion → clearProps: 'all', content
 *          shows immediately.
 */
'use client'

import { useRef } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { Container } from '@/components/ui/Container'
import { useGsapScope } from '@/components/motion/GsapScope'

type AboutMotionProps = {
  body: string
  heading: string
  moreComingSoon: string
  backToHome: string
}

export function AboutMotion({
  body,
  heading,
  moreComingSoon,
  backToHome,
}: AboutMotionProps) {
  const scopeRef = useRef<HTMLDivElement>(null)

  useGsapScope(
    scopeRef,
    ({ gsap, reduced }) => {
      const targets = [
        '[data-about-body]',
        '[data-about-quote]',
        '[data-about-soon]',
        '[data-about-back]',
      ]

      if (reduced) {
        gsap.set(targets, { clearProps: 'all' })
        return
      }

      gsap.from('[data-about-body]', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top bottom-=40',
          once: true,
        },
      })

      gsap.from('[data-about-quote]', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.15,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top bottom-=40',
          once: true,
        },
      })

      gsap.from('[data-about-soon]', {
        y: 16,
        opacity: 0,
        duration: 0.7,
        delay: 0.25,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top bottom-=40',
          once: true,
        },
      })

      gsap.from('[data-about-back]', {
        y: 12,
        opacity: 0,
        duration: 0.6,
        delay: 0.35,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top bottom-=40',
          once: true,
        },
      })
    },
    [],
  )

  return (
    <Container className="py-12 md:py-20 max-w-3xl space-y-12">
      <div ref={scopeRef} className="space-y-12">
        <div data-about-body>
          <p
            className="text-lg md:text-xl text-[var(--color-primary-dark)] leading-[1.85] first-letter:text-5xl first-letter:font-extrabold first-letter:text-[var(--color-primary)] first-letter:me-2 first-letter:float-start first-letter:leading-none first-letter:mt-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {body}
          </p>
        </div>

        {/* Pull quote — oversized italic serif */}
        <div data-about-quote>
          <blockquote className="relative text-center py-6 md:py-10">
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 mx-auto h-px w-24 bg-[var(--color-primary)]/50"
            />
            <p
              className="text-2xl md:text-4xl italic text-[var(--color-primary-dark)] leading-[1.4]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              &ldquo;{heading}&rdquo;
            </p>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 mx-auto h-px w-24 bg-[var(--color-primary)]/50"
            />
          </blockquote>
        </div>

        <div data-about-soon>
          <p className="text-center text-sm text-[var(--color-accent-deep)] italic">
            {moreComingSoon}
          </p>
        </div>

        <div data-about-back className="flex justify-center pt-4">
          <Link
            href="/"
            className="btn-lift inline-flex items-center gap-2 rounded-full border border-[var(--color-border-brand)] bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-dark)] hover:border-[var(--color-primary)] transition-colors"
            aria-label={backToHome}
          >
            <span aria-hidden>&#x2190;</span>
            <span>{backToHome}</span>
          </Link>
        </div>
      </div>
    </Container>
  )
}
