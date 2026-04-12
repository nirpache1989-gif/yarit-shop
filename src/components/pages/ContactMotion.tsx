/**
 * @file ContactMotion — client-side GSAP wrapper for the Contact page
 * @summary Tier-S GSAP upgrade S4. Replaces the IntersectionObserver-
 *          backed `<Reveal>` + `<StaggeredReveal>` with GSAP
 *          ScrollTrigger for the full contact page:
 *
 *            - Header cascade: eyebrow → heading → body (120ms gap)
 *            - Contact cards stagger from y:28 + scale:0.97 (120ms gap)
 *            - Icon circles get a single soft glow pulse after entrance
 *            - Closing quote + back link with delay
 *
 *          SVG icon components and ContactCard are co-located here since
 *          they are presentational and part of the motion scope.
 *
 *          Accessibility: reduced-motion → clearProps: 'all', all
 *          content visible immediately.
 */
'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { Container } from '@/components/ui/Container'
import { useGsapScope } from '@/components/motion/GsapScope'

// ─── Inline SVG icons ───────────────────────────────────────────────
// Hand-rolled so we don't pull in react-icons. Each icon is 24x24 in
// brand sage (currentColor), matched to the card text color.

function WhatsappIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="currentColor"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.76.46 3.47 1.33 4.97L2 22l5.25-1.37a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.83 9.83 0 0 0 12.04 2Zm0 18.13h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.78.96-.14.17-.29.19-.54.07-.25-.13-1.05-.39-2-1.24a7.5 7.5 0 0 1-1.38-1.71c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.47-.01a.9.9 0 0 0-.65.31c-.22.25-.86.84-.86 2.05 0 1.21.88 2.37 1 2.54.12.17 1.74 2.66 4.21 3.73.59.26 1.05.41 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2c-9.39 0-17-7.61-17-17 0-1.1.9-2 2-2Z" />
    </svg>
  )
}

// Shared card shell — matches the existing .product-card hover
// vocabulary (lift + shadow + border glow) for brand consistency.
function ContactCard({
  href,
  icon,
  label,
  value,
  external,
}: {
  href: string
  icon: React.ReactNode
  label: string
  value: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      data-contact-card
      className="group relative flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)]/60 hover:shadow-[0_24px_50px_-28px_rgba(24,51,41,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-deep)]/30"
    >
      <span
        data-icon-circle
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] transition-transform duration-300 group-hover:scale-110"
      >
        {icon}
      </span>
      <span className="space-y-1">
        <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {label}
        </span>
        <span
          className="block text-lg font-bold text-[var(--color-primary-dark)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {value}
        </span>
      </span>
      {/* Hairline glow underline, grows from the center on hover. */}
      <span
        aria-hidden
        className="absolute inset-x-8 bottom-4 h-px origin-center scale-x-0 bg-[var(--color-primary)]/40 transition-transform duration-500 group-hover:scale-x-100"
      />
    </a>
  )
}

// ─── Props ──────────────────────────────────────────────────────────

type ContactMotionProps = {
  title: string
  heading: string
  body: string
  comingSoon: string
  backToHome: string
  whatsappLabel: string
  emailLabel: string
  phoneLabel: string
  whatsapp: string
  email: string
  phone: string
}

export function ContactMotion({
  title,
  heading,
  body,
  comingSoon,
  backToHome,
  whatsappLabel,
  emailLabel,
  phoneLabel,
  whatsapp,
  email,
  phone,
}: ContactMotionProps) {
  const scopeRef = useRef<HTMLElement>(null)

  useGsapScope(
    scopeRef,
    ({ gsap, reduced }) => {
      const allTargets = [
        '[data-contact-eyebrow]',
        '[data-contact-heading]',
        '[data-contact-body]',
        '[data-contact-card]',
        '[data-contact-quote]',
        '[data-contact-back]',
      ]

      if (reduced) {
        gsap.set(allTargets, { clearProps: 'all' })
        return
      }

      // Header cascade
      gsap.from('[data-contact-eyebrow]', {
        y: 16,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top bottom-=40',
          once: true,
        },
      })

      gsap.from('[data-contact-heading]', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.12,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top bottom-=40',
          once: true,
        },
      })

      gsap.from('[data-contact-body]', {
        y: 14,
        opacity: 0,
        duration: 0.7,
        delay: 0.24,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: scopeRef.current,
          start: 'top bottom-=40',
          once: true,
        },
      })

      // Contact cards stagger
      gsap.from('[data-contact-card]', {
        y: 28,
        opacity: 0,
        scale: 0.97,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: '[data-contact-card]',
          start: 'top bottom-=40',
          once: true,
        },
      })

      // Icon circle glow pulse — fires once after cards land
      gsap.to('[data-icon-circle]', {
        boxShadow: '0 0 20px 4px var(--color-primary)',
        duration: 1.2,
        repeat: 1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.0,
        scrollTrigger: {
          trigger: '[data-contact-card]',
          start: 'top bottom-=40',
          once: true,
        },
      })

      // Closing quote
      gsap.from('[data-contact-quote]', {
        y: 16,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: '[data-contact-quote]',
          start: 'top bottom-=40',
          once: true,
        },
      })

      // Back link
      gsap.from('[data-contact-back]', {
        y: 12,
        opacity: 0,
        duration: 0.6,
        delay: 0.6,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: '[data-contact-back]',
          start: 'top bottom-=40',
          once: true,
        },
      })
    },
    [],
  )

  return (
    <section ref={scopeRef} className="relative overflow-hidden">
      {/* Ambient watercolor backdrop */}
      <div className="absolute inset-0 -z-0 opacity-[0.55]" aria-hidden>
        <Image
          src="/brand/ai/ContactBG1.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)] via-transparent to-[var(--color-background)]" />
      </div>

      <Container className="relative py-16 md:py-24 max-w-4xl">
        <header className="text-center space-y-4 mb-12 md:mb-16">
          <p
            data-contact-eyebrow
            className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-accent-deep)]"
          >
            {title}
          </p>
          <h1
            data-contact-heading
            className="iridescent-heading text-4xl md:text-5xl font-extrabold text-[var(--color-primary-dark)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {heading}
          </h1>
          <p
            data-contact-body
            className="text-base md:text-lg italic text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            {body}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {whatsapp && (
            <ContactCard
              href={`https://wa.me/${whatsapp}`}
              external
              icon={<WhatsappIcon />}
              label={whatsappLabel}
              value={whatsapp}
            />
          )}
          {email && (
            <ContactCard
              href={`mailto:${email}`}
              icon={<EmailIcon />}
              label={emailLabel}
              value={email}
            />
          )}
          {phone && (
            <ContactCard
              href={`tel:${phone}`}
              icon={<PhoneIcon />}
              label={phoneLabel}
              value={phone}
            />
          )}
        </div>

        <p
          data-contact-quote
          className="mt-16 text-center text-2xl md:text-3xl italic text-[var(--color-primary-dark)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {comingSoon}
        </p>

        <div data-contact-back className="mt-10 flex justify-center">
          <Link
            href="/"
            className="btn-lift inline-flex items-center gap-2 rounded-full border border-[var(--color-border-brand)] bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-dark)] hover:border-[var(--color-primary)] transition-colors"
            aria-label={backToHome}
          >
            <span aria-hidden>&#x2190;</span>
            <span>{backToHome}</span>
          </Link>
        </div>
      </Container>
    </section>
  )
}
