/**
 * @file /login — customer login page
 * @summary Server component. If the visitor is already logged in,
 *          redirect to /account. Otherwise render the LoginForm
 *          client component inside a centered card.
 *
 *          Wave L motion:
 *            - AuthAmbient adds a dark-mode night-garland background.
 *            - Heading + subheading fade up with a small stagger.
 *            - The form card reveals with a slight delay so the
 *              whole page feels like a curtain lifting.
 */
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Container } from '@/components/ui/Container'
import { LoginForm } from '@/components/account/LoginForm'
import { AuthAmbient } from '@/components/account/AuthAmbient'
import { Reveal } from '@/components/motion/Reveal'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { redirect } from '@/lib/i18n/navigation'
import { routing, type Locale } from '@/lib/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const typedLocale = locale as Locale
  const t = await getTranslations({ locale, namespace: 'auth' })

  const { user } = await getCurrentUser()
  if (user) {
    redirect({ href: '/account', locale: typedLocale })
  }

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
              {t('loginHeading')}
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {t('loginSubheading')}
            </p>
          </Reveal>
        </div>

        <Reveal delay={260}>
          <div className="rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)]/95 p-6 md:p-8 backdrop-blur-sm shadow-[0_24px_60px_-30px_rgba(24,51,41,0.35)]">
            <LoginForm />
          </div>
        </Reveal>
      </Container>
    </>
  )
}
