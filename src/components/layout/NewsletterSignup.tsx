/**
 * @file NewsletterSignup — quiet newsletter input + join button
 * @summary Client component wrapped by the Footer's newsletter column.
 *          Currently a no-op on submit (we prevent default + log) —
 *          a real signup backend will be wired up in a later phase.
 *
 *          Separated from Footer.tsx so Footer can remain a server
 *          component (server components can't have onSubmit handlers).
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function NewsletterSignup() {
  const t = useTranslations('footer')
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // TODO: wire up a real newsletter backend (Resend, Mailchimp, etc.)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <p
        className="text-sm italic text-[var(--color-primary-dark)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        ✓ {t('newsletterCta')}
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row md:flex-col gap-2 pt-1"
    >
      <label className="sr-only" htmlFor="footer-newsletter-email">
        {t('newsletterPlaceholder')}
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('newsletterPlaceholder')}
        className="flex-1 rounded-[var(--radius-card)] border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] px-4 py-2.5 text-sm text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-muted)]"
      />
      <button
        type="submit"
        className="btn-lift inline-flex items-center justify-center rounded-full px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold tracking-wider uppercase hover:bg-[var(--color-primary-dark)] transition-colors"
      >
        {t('newsletterCta')}
      </button>
    </form>
  )
}
