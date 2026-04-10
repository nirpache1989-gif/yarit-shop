/**
 * @file ResetPasswordForm — set a new password from a reset token (client)
 * @summary Posts `{ token, password }` to Payload's built-in
 *          `POST /api/users/reset-password`. On success, immediately
 *          calls `POST /api/users/login` to log the user in (Payload's
 *          reset endpoint authenticates the user but the storefront
 *          fetch may not pick up the response cookie reliably across
 *          all browsers — re-authenticating with the new password is
 *          a safe, predictable second step).
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'

// Wave L — gold hairline focus ring tuned to the brand palette.
const inputClass =
  'w-full rounded-xl border border-[var(--color-border-brand)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-foreground)] transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent-deep)] focus:ring-2 focus:ring-[var(--color-accent-deep)]/20'

type Props = {
  token: string
}

export function ResetPasswordForm({ token }: Props) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError(t('passwordTooShort'))
      return
    }
    if (password !== confirm) {
      setError(t('passwordMismatch'))
      return
    }

    setSubmitting(true)

    try {
      // 1. Submit the reset.
      const resetRes = await fetch('/api/users/reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!resetRes.ok) {
        setError(t('invalidOrExpiredToken'))
        setSubmitting(false)
        return
      }

      // 2. Pull the email back out of the reset response so we can
      //    immediately log in. Payload returns the user object on
      //    success.
      let email = ''
      try {
        const data = (await resetRes.clone().json()) as {
          user?: { email?: string }
        }
        email = data?.user?.email ?? ''
      } catch {
        /* shape may vary; the login fallback below still works */
      }

      // 3. Log in with the new password to guarantee the cookie is
      //    set in the browser.
      if (email) {
        await fetch('/api/users/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
      }

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
          htmlFor="reset-password"
          className="block text-sm font-semibold text-[var(--color-primary-dark)]"
        >
          {t('newPasswordLabel')}
        </label>
        <input
          id="reset-password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="reset-confirm"
          className="block text-sm font-semibold text-[var(--color-primary-dark)]"
        >
          {t('confirmPasswordLabel')}
        </label>
        <input
          id="reset-confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
          minLength={8}
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
        {submitting ? t('resetPasswordSubmitting') : t('resetPasswordButton')}
      </Button>
    </form>
  )
}
