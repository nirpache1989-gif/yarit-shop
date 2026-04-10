/**
 * @file HelpButton — permanent "help" pill in the admin top-right
 * @summary Server component injected via `admin.components.actions`.
 *          Renders alongside Payload's built-in actions (locale
 *          switcher, logout). Styled by `.yarit-help-button` in
 *          admin-brand.css so the look is tweakable from CSS.
 */
export function HelpButton() {
  return (
    <a
      href="https://github.com/nirpache1989-gif/yarit-shop/blob/main/yarit-shop/docs/YARIT-ADMIN-GUIDE.md"
      target="_blank"
      rel="noreferrer"
      className="yarit-help-button"
    >
      ?צריכה עזרה
    </a>
  )
}
