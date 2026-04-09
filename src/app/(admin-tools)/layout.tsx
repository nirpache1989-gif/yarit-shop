/**
 * @file Admin-tools root layout
 * @summary Root layout for the `(admin-tools)` route group — a small
 *          branded admin surface separate from Payload's built-in
 *          admin UI. Hosts the Fulfillment Dashboard and any other
 *          Yarit-facing custom views we add later.
 *
 *          Why a separate route group:
 *          - `(payload)/admin/[[...segments]]/page.tsx` is Payload's
 *            catch-all for its own admin app — we can't inject
 *            arbitrary Next.js pages under `/admin/*` without risking
 *            routing conflicts.
 *          - Custom Payload admin views (the "proper" way) require
 *            wiring through the importMap and a specific component
 *            registration pattern (see the background research agent's
 *            deliverable). The branded route-group approach works
 *            today with zero Payload-specific plumbing and gives us
 *            full control over the UX, which for a non-technical
 *            user is actually better.
 *
 *          This layout uses the same brand theme as the storefront
 *          (Heebo font, parchment background, RTL) so Yarit gets a
 *          consistent visual experience when she switches between
 *          managing products in Payload and handling orders here.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Heebo, Frank_Ruhl_Libre } from 'next/font/google'
import { brand } from '@/brand.config'
// Note: we use `next/link` here, not our locale-aware Link, because
// the (admin-tools) route group is Hebrew-only and has no
// NextIntlClientProvider. Using the i18n Link here would crash with
// "No intl context found" on first render.

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

export const metadata: Metadata = {
  title: `ניהול — ${brand.name.he}`,
  description: 'ניהול הזמנות ומוצרים',
}

export default function AdminToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${frankRuhl.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
        <header className="sticky top-0 z-30 bg-[var(--color-background)]/95 backdrop-blur-sm border-b border-[var(--color-border-brand)]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="text-xl font-bold text-[var(--color-primary-dark)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {brand.name.he}
              </span>
              <span className="text-sm text-[var(--color-muted)]">· ניהול</span>
            </div>
            <nav className="flex items-center gap-4 text-sm font-semibold">
              <Link
                href="/fulfillment"
                className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary)]"
              >
                הזמנות
              </Link>
              <a
                href="/admin"
                className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary)]"
              >
                פאנל ניהול מלא
              </a>
              <a
                href="/"
                className="text-[var(--color-muted)] hover:text-[var(--color-primary-dark)]"
              >
                לאתר →
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
