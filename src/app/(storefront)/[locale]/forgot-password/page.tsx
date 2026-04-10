/**
 * @file /forgot-password — request a password reset email
 * @summary Server component. Renders the ForgotPasswordForm inside
 *          a Suspense boundary because the form calls
 *          `useSearchParams()` to prefill the email from a
 *          `?email=` query param (Next 16 requires Suspense around
 *          any client component that reads search params).
 *
 *          Wave L motion: same ambient + reveal rhythm as /login so
 *          the three auth pages feel like one continuous room.
 */
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Container } from '@/components/ui/Container'
import { ForgotPasswordForm } from '@/components/account/ForgotPasswordForm'
import { AuthAmbient } from '@/components/account/AuthAmbient'
import { Reveal } from '@/components/motion/Reveal'
import { routing } from '@/lib/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params
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
              {t('forgotPasswordHeading')}
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {t('forgotPasswordSubheading')}
            </p>
          </Reveal>
        </div>

        <Reveal delay={260}>
          <div className="rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)]/95 p-6 md:p-8 backdrop-blur-sm shadow-[0_24px_60px_-30px_rgba(24,51,41,0.35)]">
            <Suspense fallback={null}>
              <ForgotPasswordForm />
            </Suspense>
          </div>
        </Reveal>
      </Container>
    </>
  )
}
