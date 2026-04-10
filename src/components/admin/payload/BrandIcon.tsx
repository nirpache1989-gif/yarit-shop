/**
 * @file BrandIcon — Small Shoresh mark for the Payload nav header
 * @summary Replaces Payload's default icon at the top of the sidebar.
 *          Wired via `admin.components.graphics.Icon` in payload.config.ts.
 */
import Image from 'next/image'

export function BrandIcon() {
  return (
    <Image
      src="/brand/logo.png"
      alt="שורש"
      width={32}
      height={48}
      className="yarit-brand-icon"
    />
  )
}
