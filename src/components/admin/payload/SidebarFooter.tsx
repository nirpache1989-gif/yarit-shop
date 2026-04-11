/**
 * @file SidebarFooter — quick links below the admin nav
 * @summary Server component injected via `admin.components.afterNavLinks`.
 *          Three shortcuts: live site, fulfillment dashboard (custom
 *          view at /admin/fulfillment from Phase 4), logout.
 *
 *          Internal admin routes use `next/link` so they transition
 *          client-side without a full page reload (the storefront
 *          rule against `next/link` only applies to locale-aware
 *          pages — admin routes have no locale prefix). The live-site
 *          link is an intentional cross-realm new-tab navigation, so
 *          it stays a plain anchor with target="_blank".
 *
 *          Localization (2026-04-10): all three link labels now branch
 *          on `props.i18n.language` so the footer flips with the admin
 *          UI language. The leading arrow glyph flips too (← in RTL
 *          Hebrew naturally points back-home, → in LTR English).
 *
 *          Styled by `.yarit-sidebar-foot` rules in admin-brand.css.
 */
import type { ServerProps } from 'payload'
import Link from 'next/link'

export function SidebarFooter(props: ServerProps) {
  const isEn = props.i18n?.language === 'en'
  const strings = isEn
    ? {
        liveSite: '→ Live site',
        newOrders: '📦 New orders',
        signOut: '→ Sign out',
      }
    : {
        liveSite: '← לאתר החי',
        newOrders: '📦 ההזמנות החדשות',
        signOut: '← יציאה',
      }

  return (
    <div className="yarit-sidebar-foot">
      <a href="/" target="_blank" rel="noreferrer">
        {strings.liveSite}
      </a>
      <Link href="/admin/fulfillment">{strings.newOrders}</Link>
      <Link href="/admin/logout">{strings.signOut}</Link>
    </div>
  )
}
