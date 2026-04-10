/**
 * @file ForgotPasswordForm — request a password-reset email (client)
 * @summary Posts the email to Payload's built-in
 *          `POST /api/users/forgot-password`. Always shows a generic
 *          success message after submit, regardless of whether the
 *          email exists, to prevent user enumeration. The actual
 *          reset email is sent (or printed to the dev console) by
 *          our shoreshEmailAdapter.
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'

// Wave L — gold hairline focus ring tuned to the brand palette.
const inputClass =
  'w-full rounded-xl border border-[var(--color-border-brand)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-foreground)] transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent-deep)] focus:ring-2 focus:ring-[var(--color-accent-deep)]/20'

export function ForgotPasswordForm() {
  const t = useTranslations('auth')
  // When the "set your password" CTA in the order confirmation
  // email links to /forgot-password?email=..., prefill the input so
  // the customer just clicks submit. No hydration mismatch risk
  // because useSearchParams is client-only in a client component.
  const searchParams = useSearchParams()
  const prefillEmail = searchParams.get('email') ?? ''
  const [email, setEmail] = useState(prefillEmail)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      // We deliberately ignore the response status — Payload returns
      // 200 whether or not the email exists, but even if it returned
      // 4xx we'd show the same generic message to avoid user
      // enumeration.
      await fetch('/api/users/forgot-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      /* swallow — see comment above */
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    // Wave L — gentle fade into the success message so the transition
    // from form → confirmation feels like a breath, not a snap.
    return (
      <div className="space-y-5 text-center animate-fade-up">
        <div className="rounded-xl border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 p-4 text-sm text-[var(--color-primary-dark)]">
          {t('forgotPasswordSuccess')}
        </div>
        <Link
          href="/login"
          className="inline-block text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] underline-offset-4 hover:underline"
        >
          {t('backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="forgot-email"
          className="block text-sm font-semibold text-[var(--color-primary-dark)]"
        >
          {t('emailLabel')}
        </label>
        <input
          id="forgot-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full btn-lift"
        disabled={submitting}
      >
        {submitting ? t('forgotPasswordSending') : t('forgotPasswordButton')}
      </Button>

      <Link
        href="/login"
        className="block text-center text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] underline-offset-4 hover:underline"
      >
        {t('backToLogin')}
      </Link>
    </form>
  )
}
