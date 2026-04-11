/**
 * @file SidebarGreeting — friendly hello at the top of the admin nav
 * @summary Server component injected via `admin.components.beforeNavLinks`
 *          in payload.config.ts. Reads the logged-in user from
 *          ServerProps and shows a greeting — purely an identity
 *          indicator now, no help link.
 *
 *          Round 5 Fix 2.3: The help link here was removed. The
 *          admin had THREE help links all pointing to the same
 *          external GitHub markdown page (HelpButton + WelcomeBanner
 *          + here). Now the only help affordance is the single
 *          `HelpButton` in the admin top-right actions, which opens
 *          a `mailto:` directly to the developer. See HelpButton.tsx.
 *
 *          Localization (2026-04-10): the two strings now branch on
 *          `props.i18n.language` so the greeting flips with the
 *          admin UI language. Paired with AdminLangSwitcher in the
 *          top bar — clicking that pill refreshes the tree and this
 *          component re-renders in the new language.
 *
 *          Styled by `.yarit-sidebar-greet` rules in admin-brand.css.
 */
import type { ServerProps } from 'payload'

export function SidebarGreeting(props: ServerProps) {
  const u = props.user as { name?: string; email?: string } | undefined
  const fallback = props.i18n?.language === 'en' ? 'friend' : 'ידידי'
  const name =
    u?.name ||
    (u?.email ? u.email.split('@')[0] : null) ||
    fallback

  const strings =
    props.i18n?.language === 'en'
      ? {
          hello: `Hello, ${name} 🌿`,
          sub: 'Welcome to the admin panel',
        }
      : {
          hello: `שלום, ${name} 🌿`,
          sub: 'ברוכה הבאה לפאנל הניהול',
        }

  return (
    <div className="yarit-sidebar-greet">
      <p className="yarit-sidebar-greet__hello">{strings.hello}</p>
      <p className="yarit-sidebar-greet__sub">{strings.sub}</p>
    </div>
  )
}
