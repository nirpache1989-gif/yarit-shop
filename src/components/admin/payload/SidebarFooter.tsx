/**
 * @file SidebarFooter — quick links below the admin nav
 * @summary Server component injected via `admin.components.afterNavLinks`.
 *          Three Hebrew shortcuts: live site, fulfillment dashboard
 *          (custom view at /admin/fulfillment from Phase 4), logout.
 *
 *          Styled by `.yarit-sidebar-foot` rules in admin-brand.css.
 */
export function SidebarFooter() {
  return (
    <div className="yarit-sidebar-foot" dir="rtl">
      <a href="/" target="_blank" rel="noreferrer">
        ← לאתר החי
      </a>
      <a href="/admin/fulfillment">📦 ההזמנות החדשות</a>
      <a href="/admin/logout">← יציאה</a>
    </div>
  )
}
