/**
 * @file ViewOnSite — "view on storefront" button in the admin header
 * @summary Small pill button that opens the storefront homepage in a
 *          new tab. Lets Yarit jump from the admin to her live store
 *          without losing her admin position.
 *
 *          Registered in `admin.components.actions` so it renders in
 *          Payload's top-right action bar next to the HelpButton.
 *
 *          See: Round 4 plan Track C12.
 */
'use client'

export function ViewOnSite() {
  return (
    <a
      href="/"
      target="_blank"
      rel="noreferrer"
      className="yarit-view-on-site"
      title="פתיחת האתר בכרטיסייה חדשה"
    >
      <span aria-hidden>🌿</span>
      <span>צפייה באתר</span>
      <span aria-hidden>↗</span>
    </a>
  )
}
