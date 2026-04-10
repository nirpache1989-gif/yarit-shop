/**
 * @file HelpButton — permanent "help" pill in the admin top-right
 * @summary Server component injected via `admin.components.actions`.
 *          Renders alongside Payload's built-in actions (locale
 *          switcher, logout). Styled by `.yarit-help-button` in
 *          admin-brand.css so the look is tweakable from CSS.
 *
 *          Round 5 Fix 2.3: The previous version linked to an
 *          external GitHub raw-markdown page, which was user-hostile
 *          for a 65-year-old non-technical merchant. Now it opens a
 *          `mailto:` with a pre-filled Hebrew subject line. Clicking
 *          "?צריכה עזרה" drops Yarit into her email client with a
 *          ready-to-send message to Nir, no docs site or GitHub
 *          account required.
 *
 *          To change the support email recipient, edit the
 *          `HELP_EMAIL` constant below. We intentionally keep it as
 *          a compile-time constant rather than reading from
 *          SiteSettings — the HelpButton renders on EVERY admin page
 *          and adding a DB query per render just to find an email
 *          address is needless overhead.
 */

const HELP_EMAIL = 'nirpache1989@gmail.com'
const HELP_SUBJECT = 'עזרה עם פאנל הניהול של החנות'
const HELP_BODY =
  'שלום ניר, יש לי שאלה לגבי פאנל הניהול:\n\n' +
  '(נא לכתוב את השאלה כאן)\n\n' +
  '---\nנשלח מתוך פאנל הניהול של שורש'

export function HelpButton() {
  const href = `mailto:${HELP_EMAIL}?subject=${encodeURIComponent(
    HELP_SUBJECT,
  )}&body=${encodeURIComponent(HELP_BODY)}`

  return (
    <a href={href} className="yarit-help-button">
      ?צריכה עזרה
    </a>
  )
}
