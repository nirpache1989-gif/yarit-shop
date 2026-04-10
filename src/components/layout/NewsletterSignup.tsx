/**
 * @file NewsletterSignup — quiet "coming soon" notice
 * @summary Used to be an interactive form that "submitted" by calling
 *          `setSubmitted(true)` with no backend at all — which gave
 *          users a false sense that they had signed up. That was
 *          flagged as a P2 issue in the round-4 review: a fake
 *          success is worse than not shipping the feature.
 *
 *          Now it's a single-line placeholder that keeps the footer
 *          column's visual weight the same but makes no promises.
 *          When a real newsletter backend (Resend audience,
 *          Mailchimp, etc.) is wired up in a later phase, the
 *          interactive form can come back — but please actually send
 *          the POST this time.
 */
import { useTranslations } from 'next-intl'

export function NewsletterSignup() {
  const t = useTranslations('footer')
  return (
    <p
      className="pt-1 text-sm italic text-[var(--color-muted)] leading-relaxed"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {t('newsletterComingSoon')}
    </p>
  )
}
