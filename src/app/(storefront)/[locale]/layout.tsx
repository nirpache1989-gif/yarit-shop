/**
 * @file Storefront root layout
 * @summary The root layout for everything inside the `(storefront)`
 *          route group. Owns its own `<html>` / `<body>` (isolated
 *          from the Payload admin layout in `(payload)`).
 *
 *          Responsibilities:
 *          - Loads Heebo (hebrew + latin subsets) and Frank Ruhl Libre
 *            via next/font/google, exposing CSS variables that
 *            globals.css and brand.config consume.
 *          - Applies `dir="rtl"` for Hebrew, `dir="ltr"` for English.
 *          - Wraps children in NextIntlClientProvider so client
 *            components can call useTranslations().
 *          - Validates the incoming `locale` param (Next 16: Promise)
 *            and 404s on unknown locales.
 *          - Mounts the Header + Footer shells.
 *
 *          See: plan §1 (Brand Direction), §4 (Homepage Structure).
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Heebo, Bellefair } from 'next/font/google'

import { routing } from '@/lib/i18n/routing'
import { brand } from '@/brand.config'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { DriftingLeaves } from '@/components/ui/DriftingLeaves'

import '@/app/globals.css'

/*
 * Design Round 3 — theme bootstrap (updated 2026-04-11 mobile audit).
 * Runs synchronously in <head> BEFORE React hydration so the
 * correct data-theme is on <html> before the first paint.
 *
 *   1. Check localStorage for an EXPLICIT user preference
 *      (`shoresh-theme` — only set when the user clicks the toggle).
 *   2. If no explicit preference, default to LIGHT mode regardless
 *      of the OS-wide dark-mode setting. We learned from a Redmi
 *      Note Poco X7 user that "it goes dark automatically" felt
 *      like a bug because their phone is set to dark OS-wide; the
 *      brand palette is warmer and more editorial in light mode,
 *      and dark mode should be an opt-in via the ThemeToggle.
 *   3. Fall back to light mode if localStorage is blocked (private
 *      browsing, etc.).
 *
 * Must stay a plain string (not a template literal that references
 * runtime values) so Next.js can serialise it into the server HTML.
 *
 * Wave D — theme-jump fix.
 * Also mirror the resolved theme into the `payload-theme` cookie so
 * that when the user navigates from the storefront to the admin
 * (/admin), Payload's server-side `getRequestTheme` reads the same
 * value and renders matching <html data-theme> on the first paint.
 */
const themeBootstrap = `(function(){try{var s=localStorage.getItem('shoresh-theme');var t=(s==='dark'||s==='light')?s:'light';document.documentElement.setAttribute('data-theme',t);document.cookie='payload-theme='+t+';path=/;max-age=31536000;samesite=lax';}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-heebo',
  display: 'swap',
})

/*
 * Display font — swapped from Frank Ruhl Libre to Bellefair
 * (Design Round 3 follow-up). Bellefair is a higher-contrast
 * Hebrew+Latin serif inspired by Bodoni, with more editorial
 * character than Frank Ruhl Libre's classical restraint.
 * Used by Hebrew fashion/wellness brands that want a more
 * distinctive display face. Single weight (400) is all Bellefair
 * ships — its character comes from the letterforms, not weight.
 * We keep the --font-frank-ruhl variable name for backwards
 * compatibility with admin-brand.css which references it.
 */
const bellefair = Bellefair({
  subsets: ['hebrew', 'latin'],
  weight: ['400'],
  variable: '--font-frank-ruhl',
  display: 'swap',
})

// Static render for both locales.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const t = await getTranslations({ locale, namespace: 'common' })
  return {
    title: {
      default: `${t('shopName')} — ${t('tagline')}`,
      template: `%s — ${t('shopName')}`,
    },
    description: brand.description[locale as 'he' | 'en'] ?? brand.description.en,
  }
}

export default async function StorefrontLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Enable static rendering of translated strings for this request.
  setRequestLocale(locale)

  const dir = locale === 'he' ? 'rtl' : 'ltr'

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${heebo.variable} ${bellefair.variable} h-full antialiased`}
    >
      <head>
        {/* Synchronous theme bootstrap — must run before React hydrates
            so the data-theme attribute is set before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
        {/* Ambient radial gradient layer — shifts focus between two
            brand accent colors over 18s, very subtly. Lives under
            everything else (z-index 0) and doesn't intercept clicks. */}
        <div className="ambient-breathe" aria-hidden />
        <DriftingLeaves />
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1 relative z-10">{children}</main>
          <Footer />
          <CartDrawer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
