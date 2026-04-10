/**
 * @file LogoutButton — clear the auth cookie and bounce home
 * @summary Client component. Posts to Payload's built-in
 *          `POST /api/users/logout` (which clears the
 *          `payload-token` cookie), then refreshes back to `/`.
 *          The hard refresh is required so the server-rendered
 *          Header re-evaluates the auth state and shows "Login"
 *          again.
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/i18n/navigation'

export function LogoutButton() {
  const t = useTranslations('account')
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleClick() {
    setSubmitting(true)
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      /* swallow — even on network failure we want to send the user home */
    }
    router.replace('/')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      className="btn-lift inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary-dark)] hover:border-[var(--color-primary)] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {submitting ? t('loggingOut') : t('logoutButton')}
    </button>
  )
}
