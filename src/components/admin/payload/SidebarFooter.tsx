/**
 * @file SidebarFooter — quick links below the admin nav
 * @summary Server component injected via `admin.components.afterNavLinks`.
 *          Three Hebrew shortcuts: live site, fulfillment dashboard
 *          (custom view at /admin/fulfillment from Phase 4), logout.
 *
 *          Internal admin routes use `next/link` so they transition
 *          client-side without a full page reload (the storefront
 *          rule against `next/link` only applies to locale-aware
 *          pages — admin routes have no locale prefix). The live-site
 *          link is an intentional cross-realm new-tab navigation, so
 *          it stays a plain anchor with target="_blank".
 *
 *          Styled by `.yarit-sidebar-foot` rules in admin-brand.css.
 */
import Link from 'next/link'

export function SidebarFooter() {
  return (
    <div className="yarit-sidebar-foot" dir="rtl">
      <a href="/" target="_blank" rel="noreferrer">
        ← לאתר החי
      </a>
      <Link href="/admin/fulfillment">📦 ההזמנות החדשות</Link>
      <Link href="/admin/logout">← יציאה</Link>
    </div>
  )
}
