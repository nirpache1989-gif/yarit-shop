/**
 * @file SidebarGreeting — friendly hello at the top of the admin nav
 * @summary Server component injected via `admin.components.beforeNavLinks`
 *          in payload.config.ts. Reads the logged-in user from
 *          ServerProps and shows a Hebrew greeting + a quick help link
 *          to YARIT-ADMIN-GUIDE.md.
 *
 *          Styled by `.yarit-sidebar-greet` rules in admin-brand.css.
 */
import type { ServerProps } from 'payload'

export function SidebarGreeting(props: ServerProps) {
  const u = props.user as { name?: string; email?: string } | undefined
  const name =
    u?.name ||
    (u?.email ? u.email.split('@')[0] : null) ||
    'ידידי'

  return (
    <div className="yarit-sidebar-greet" dir="rtl">
      <p className="yarit-sidebar-greet__hello">שלום, {name} 🌿</p>
      <p className="yarit-sidebar-greet__sub">ברוכה הבאה לפאנל הניהול</p>
      <a
        className="yarit-sidebar-greet__link"
        href="https://github.com/nirpache1989-gif/yarit-shop/blob/main/yarit-shop/docs/YARIT-ADMIN-GUIDE.md"
        target="_blank"
        rel="noreferrer"
      >
        ?צריכה עזרה
      </a>
    </div>
  )
}
