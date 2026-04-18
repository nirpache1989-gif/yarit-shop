/**
 * @file FooterMotion — client-side GSAP wrapper for the Footer
 * @summary Living Garden 5-column dark-ink footer with the existing
 *          GSAP ScrollTrigger timeline preserved:
 *            - `.footer-garland` fades from opacity 0 → CSS resting value
 *            - 5 grid columns stagger upward with 100ms gap
 *            - Bottom strip arrives 400ms after the columns
 *
 *          Scope element hooks `[data-footer-garland]`,
 *          `[data-footer-col]`, `[data-footer-bottom]` are kept
 *          exactly as before so the GSAP setup can target elements
 *          without knowing about the Living Garden classes.
 *
 *          Server shell: `Footer.tsx` resolves translations + site
 *          settings (including `isPlaceholder` guards on contact
 *          fields) and passes primitive props here. Same pattern as
 *          MeetYarit.tsx / MeetYaritMotion.tsx.
 *
 *          The social + WhatsApp links are rendered only when the
 *          corresponding prop is non-empty — the server shell
 *          already strips placeholder values.
 *
 *          Reduced motion: `clearProps: 'all'` on all three targets
 *          so the footer is fully visible immediately.
 */
'use client'

import { useRef } from 'react'
import { Link } from '@/lib/i18n/navigation'
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
  supportLabel: string
  newsletterHeading: string
  newsletterBody: string
  allRightsReserved: string
  madeSlowlyLabel: string
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
  supportLabel,
  newsletterHeading,
  newsletterBody,
  allRightsReserved,
  madeSlowlyLabel,
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

  const hasSupportLinks = Boolean(whatsapp)
  const hasSocial = Boolean(social.instagram || social.facebook || social.tiktok)

  return (
    <footer ref={scopeRef} className="g-footer">
      <div data-footer-garland className="footer-garland" aria-hidden />

      <div className="mx-auto max-w-[1360px] px-6 md:px-12 relative">
        <div className="g-footer-grid mb-10">
          {/* Brand + blurb + newsletter */}
          <div data-footer-col>
            <div className="g-footer-brand">
              {brandName}
              <sup>°</sup>
            </div>
            <p className="g-footer-tagline">{brandBlurb}</p>
            <NewsletterSignup />
          </div>

          {/* Shop */}
          <div data-footer-col>
            <h4>{shopLabel}</h4>
            <ul>
              <li>
                <Link href="/shop">{shopLinkLabel}</Link>
              </li>
              <li>
                <Link href="/contact">{contactLinkLabel}</Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div data-footer-col>
            <h4>{infoLabel}</h4>
            <ul>
              <li>
                <Link href="/about">{aboutLinkLabel}</Link>
              </li>
            </ul>
          </div>

          {/* Support — rendered only when at least one contact exists */}
          {hasSupportLinks && (
            <div data-footer-col>
              <h4>{supportLabel}</h4>
              <ul>
                {whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Newsletter heading + social */}
          <div data-footer-col>
            <h4>{newsletterHeading}</h4>
            <p className="g-footer-tagline">{newsletterBody}</p>
            {hasSocial && (
              <ul className="flex flex-row gap-4 mt-2">
                {social.instagram && (
                  <li>
                    <a href={social.instagram} target="_blank" rel="noopener noreferrer">
                      Instagram
                    </a>
                  </li>
                )}
                {social.facebook && (
                  <li>
                    <a href={social.facebook} target="_blank" rel="noopener noreferrer">
                      Facebook
                    </a>
                  </li>
                )}
                {social.tiktok && (
                  <li>
                    <a href={social.tiktok} target="_blank" rel="noopener noreferrer">
                      TikTok
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div data-footer-bottom className="g-footer-bottom">
          <span>
            &copy; {year} {brandName} — {allRightsReserved}
          </span>
          <span>{madeSlowlyLabel}</span>
        </div>
      </div>
    </footer>
  )
}
