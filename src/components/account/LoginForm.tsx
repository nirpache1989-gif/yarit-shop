/**
 * @file LoginForm — customer-facing login (client component)
 * @summary Posts `{ email, password }` to Payload's built-in
 *          `POST /api/users/login` (mounted via the catch-all in
 *          `src/app/(payload)/api/[...slug]/route.ts`). On success the
 *          server sets the `payload-token` cookie automatically and
 *          we redirect to `/account`.
 *
 *          The "forgot password" CTA is intentionally prominent —
 *          most first-time customers will need it because their
 *          checkout-created account has a random password they have
 *          never seen.
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'

// Wave L — gold hairline focus ring tuned to the brand palette.
// Matches the checkout form pattern so auth + checkout feel like
// one coherent form system.
const inputClass =
  'w-full rounded-xl border border-[var(--color-border-brand)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-foreground)] transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent-deep)] focus:ring-2 focus:ring-[var(--color-accent-deep)]/20'

export function LoginForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        if (res.status === 401) setError(t('invalidCredentials'))
        else setError(t('genericError'))
        setSubmitting(false)
        return
      }
      // Cookie is now set; do a hard refresh of the route so the
      // server-rendered Header re-evaluates the auth state.
      router.replace('/account')
      router.refresh()
    } catch {
      setError(t('genericError'))
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="block text-sm font-semibold text-[var(--color-primary-dark)]"
        >
          {t('emailLabel')}
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="login-password"
          className="block text-sm font-semibold text-[var(--color-primary-dark)]"
        >
          {t('passwordLabel')}
        </label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--color-accent-deep)]/40 bg-[var(--color-accent-deep)]/10 p-3 text-sm font-medium text-[var(--color-accent-deep)]">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full btn-lift"
        disabled={submitting}
      >
        {submitting ? t('loggingIn') : t('loginButton')}
      </Button>

      {/* Wave L — make the "forgot password" CTA visually louder than
          a regular text link because most first-time customers will
          need it (their checkout-created account has a random password
          they have never seen). Hairline pill with gold focus ring, no
          solid fill so it doesn't compete with the primary submit. */}
      <div className="space-y-3 pt-2">
        <Link
          href="/forgot-password"
          className="block text-center text-sm font-semibold text-[var(--color-primary-dark)] rounded-xl border border-[var(--color-border-brand)] bg-[var(--color-background)] px-4 py-2.5 transition-colors duration-200 hover:border-[var(--color-accent-deep)] hover:text-[var(--color-accent-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-deep)]/30"
        >
          {t('forgotPasswordCta')}
        </Link>
        <p className="text-center text-xs text-[var(--color-muted)] leading-relaxed">
          {t('firstTimeHint')}
        </p>
      </div>
    </form>
  )
}
