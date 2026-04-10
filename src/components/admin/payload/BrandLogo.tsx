/**
 * @file BrandLogo — Shoresh logo for the Payload login screen
 * @summary Replaces Payload's default logo on /admin/login. Server
 *          component, no client JS, only loaded on the login page.
 *          Wired via `admin.components.graphics.Logo` in payload.config.ts.
 *          Styled by `.yarit-brand-logo` rules in admin-brand.css.
 */
import Image from 'next/image'

export function BrandLogo() {
  return (
    <div className="yarit-brand-logo">
      <Image
        src="/brand/logo.png"
        alt="שורש"
        width={140}
        height={210}
        priority
        className="yarit-brand-logo__img"
      />
      <div className="yarit-brand-logo__name">שורש</div>
      <div className="yarit-brand-logo__tag">ניהול האתר</div>
    </div>
  )
}
