/**
 * @file HelpButton — permanent "help" pill in the admin top-right
 * @summary Server component injected via `admin.components.actions`.
 *          Renders alongside Payload's built-in actions + our
 *          AdminLangSwitcher and ViewOnSite pills. Styled by
 *          `.yarit-help-button` in admin-brand.css so the look is
 *          tweakable from CSS.
 *
 *          Round 5 Fix 2.3: The previous version linked to an
 *          external GitHub raw-markdown page, which was user-hostile
 *          for a 65-year-old non-technical merchant. Now it opens a
 *          `mailto:` with a pre-filled subject line. Clicking the
 *          pill drops Yarit into her email client with a ready-to-
 *          send message to Nir, no docs site or GitHub account
 *          required.
 *
 *          Localization (2026-04-10): the button label, mailto
 *          subject, and mailto body all branch on
 *          `props.i18n.language` so an English-mode admin gets
 *          "Need help?" + an English draft, and a Hebrew-mode admin
 *          gets "?צריכה עזרה" + the Hebrew draft. Paired with
 *          AdminLangSwitcher.
 *
 *          To change the support email recipient, edit the
 *          `HELP_EMAIL` constant below. We intentionally keep it as
 *          a compile-time constant rather than reading from
 *          SiteSettings — the HelpButton renders on EVERY admin page
 *          and adding a DB query per render just to find an email
 *          address is needless overhead.
 */

import type { ServerProps } from 'payload'

const HELP_EMAIL = 'nirpache1989@gmail.com'

const COPY = {
  he: {
    label: '?צריכה עזרה',
    subject: 'עזרה עם פאנל הניהול של החנות',
    body:
      'שלום ניר, יש לי שאלה לגבי פאנל הניהול:\n\n' +
      '(נא לכתוב את השאלה כאן)\n\n' +
      '---\nנשלח מתוך פאנל הניהול של שורש',
  },
  en: {
    label: 'Need help?',
    subject: 'Help with the Shoresh admin panel',
    body:
      'Hi Nir, I have a question about the admin panel:\n\n' +
      '(please write your question here)\n\n' +
      '---\nSent from the Shoresh admin panel',
  },
} as const

export function HelpButton(props: ServerProps) {
  const lang = props.i18n?.language === 'en' ? 'en' : 'he'
  const copy = COPY[lang]
  const href = `mailto:${HELP_EMAIL}?subject=${encodeURIComponent(
    copy.subject,
  )}&body=${encodeURIComponent(copy.body)}`

  return (
    <a href={href} className="yarit-help-button">
      {copy.label}
    </a>
  )
}
