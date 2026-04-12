/**
 * @file FooterMotion — client-side GSAP wrapper for the Footer
 * @summary Tier-S GSAP upgrade S1. Replaces the IntersectionObserver-
 *          backed `<Reveal>` wrappers with a single GSAP ScrollTrigger
 *          scope for smoother, timing-controlled entrance:
 *
 *            - `.footer-garland` botanical texture fades from opacity 0
 *              to its CSS resting opacity (0.08 light / 0.18 dark)
 *            - 4 grid columns stagger upward with 100ms gap
 *            - Bottom strip (social + copyright) arrives 400ms after
 *
 *          Server shell: `Footer.tsx` resolves translations + settings
 *          and passes all data as primitive props here. Same pattern as
 *          MeetYarit.tsx / MeetYaritMotion.tsx.
 *
 *          Accessibility: reduced-motion users see the fully-present
 *          footer immediately via `clearProps: 'all'`.
 */
'use client'

import { useRef } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { NewsletterSignup } from '@/components/layout/NewsletterSignup'
import { useGsapScope } from '@/components/motion/GsapScope'

type SocialLinks = {
  instagram: string
  facebook: string
  tiktok: string
}

type FooterMotionProps = {
  brandName: string
  brandBlurb: string
  shopLabel: string
  shopLinkLabel: string
  contactLinkLabel: string
  infoLabel: string
  aboutLinkLabel: string
  newsletterHeading: string
  newsletterBody: string
  allRightsReserved: string
  social: SocialLinks
  whatsapp: string
  year: number
}

export function FooterMotion({
  brandName,
  brandBlurb,
  shopLabel,
  shopLinkLabel,
  contactLinkLabel,
  infoLabel,
  aboutLinkLabel,
  newsletterHeading,
  newsletterBody,
  allRightsReserved,
  social,
  whatsapp,
  year,
}: FooterMotionProps) {
  const scopeRef = useRef<HTMLElement>(null)

  useGsapScope(
    scopeRef,
    ({ gsap, reduced }) => {
      const garland = '[data-footer-garland]'
      const cols = '[data-footer-col]'
      const bottom = '[data-footer-bottom]'

      if (reduced) {
        gsap.set([garland, cols, bottom], { clearProps: 'all' })
        return
      }

      // Garland fade-in — from opacity 0 to CSS resting value
      gsap.from(garland, {
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top bottom-=40',
          once: true,
        },
      })

      // Grid columns stagger
      gsap.from(cols, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top bottom-=40',
          once: true,
        },
      })

      // Bottom strip arrives after columns
      gsap.from(bottom, {
        y: 12,
        opacity: 0,
        duration: 0.7,
        delay: 0.4,
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
    <footer
      ref={scopeRef}
      className="mt-20 md:mt-24 border-t border-[var(--color-border-brand)] bg-[var(--color-background)] relative overflow-hidden"
    >
      <div data-footer-garland className="footer-garland" aria-hidden />

      <Container className="relative py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand column */}
          <div data-footer-col className="col-span-2 md:col-span-1 space-y-3">
            <div
              className="text-2xl font-bold text-[var(--color-primary-dark)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {brandName}
            </div>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-xs">
              {brandBlurb}
            </p>
          </div>

          {/* Shop column */}
          <div data-footer-col>
            <Eyebrow as="h3" className="mb-3">
              {shopLabel}
            </Eyebrow>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <Link href="/shop" className="hover:text-[var(--color-primary-dark)]">
                  {shopLinkLabel}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-primary-dark)]">
                  {contactLinkLabel}
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn column */}
          <div data-footer-col>
            <Eyebrow as="h3" className="mb-3">
              {infoLabel}
            </Eyebrow>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <Link href="/about" className="hover:text-[var(--color-primary-dark)]">
                  {aboutLinkLabel}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter signup column */}
          <div data-footer-col className="col-span-2 md:col-span-1 space-y-3">
            <Eyebrow as="h3" tone="accent">
              {newsletterHeading}
            </Eyebrow>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {newsletterBody}
            </p>
            <NewsletterSignup />
          </div>
        </div>

        {/* Bottom strip — social + copyright */}
        <div
          data-footer-bottom
          className="pt-8 border-t border-[var(--color-border-brand)] flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <ul className="flex items-center gap-5 text-sm text-[var(--color-muted)]">
            {social.instagram && (
              <li>
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  Instagram
                </a>
              </li>
            )}
            {social.facebook && (
              <li>
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  Facebook
                </a>
              </li>
            )}
            {social.tiktok && (
              <li>
                <a
                  href={social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  TikTok
                </a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  WhatsApp
                </a>
              </li>
            )}
          </ul>
          <div className="text-xs text-[var(--color-muted)]">
            &copy; {year} {brandName} &mdash; {allRightsReserved}
          </div>
        </div>
      </Container>
    </footer>
  )
}
