/**
 * @file /reset-password/[token] — set a new password from a reset link
 * @summary Server component. Reads the token from the URL and passes
 *          it into the ResetPasswordForm client component.
 *          Token validity is enforced server-side by Payload's
 *          `/api/users/reset-password` endpoint — this page does not
 *          need to verify it itself; if the token is invalid the form
 *          surfaces the error inline.
 *
 *          Wave L motion: same ambient + reveal rhythm as /login.
 */
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Container } from '@/components/ui/Container'
import { ResetPasswordForm } from '@/components/account/ResetPasswordForm'
import { AuthAmbient } from '@/components/account/AuthAmbient'
import { Reveal } from '@/components/motion/Reveal'

// Intentionally NO `generateStaticParams`. See the equivalent comment
// on /product/[slug]/page.tsx — declaring it with just `{locale}`
// pins the route to SSG and breaks at runtime with DYNAMIC_SERVER_USAGE
// via next-intl's `setRequestLocale`. Reset-password must be dynamic
// per request anyway (token validity is checked server-side).

type Props = {
  params: Promise<{ locale: string; token: string }>
}

export default async function ResetPasswordPage({ params }: Props) {
  const { locale, token } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'auth' })

  return (
    <>
      <AuthAmbient />
      <Container className="py-16 md:py-20 max-w-md">
        <div className="space-y-2 text-center mb-8">
          <Reveal>
            <h1
              className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary-dark)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('resetPasswordHeading')}
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {t('resetPasswordSubheading')}
            </p>
          </Reveal>
        </div>

        <Reveal delay={260}>
          <div className="rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)]/95 p-6 md:p-8 backdrop-blur-sm shadow-[0_24px_60px_-30px_rgba(24,51,41,0.35)]">
            <ResetPasswordForm token={token} />
          </div>
        </Reveal>
      </Container>
    </>
  )
}
