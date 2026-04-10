/**
 * @file SidebarGreeting — friendly hello at the top of the admin nav
 * @summary Server component injected via `admin.components.beforeNavLinks`
 *          in payload.config.ts. Reads the logged-in user from
 *          ServerProps and shows a Hebrew greeting — purely an
 *          identity indicator now, no help link.
 *
 *          Round 5 Fix 2.3: The help link here was removed. The
 *          admin had THREE help links all pointing to the same
 *          external GitHub markdown page (HelpButton + WelcomeBanner
 *          + here). Now the only help affordance is the single
 *          `HelpButton` in the admin top-right actions, which opens
 *          a `mailto:` directly to the developer. See HelpButton.tsx.
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
    </div>
  )
}
