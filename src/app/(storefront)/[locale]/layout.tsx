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
import { Heebo, Frank_Ruhl_Libre } from 'next/font/google'

import { routing } from '@/lib/i18n/routing'
import { brand } from '@/brand.config'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'

import '@/app/globals.css'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-heebo',
  display: 'swap',
})

const frankRuhl = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  weight: ['500', '700'],
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
      className={`${heebo.variable} ${frankRuhl.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
