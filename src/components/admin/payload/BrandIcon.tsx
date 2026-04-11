/**
 * @file BrandIcon — Small Copaia mark for the Payload nav header
 * @summary Replaces Payload's default icon at the top of the sidebar.
 *          Wired via `admin.components.graphics.Icon` in payload.config.ts.
 */
import Image from 'next/image'
import { brand } from '@/brand.config'

export function BrandIcon() {
  return (
    <Image
      src="/brand/copaia.png"
      alt={brand.name.he}
      width={32}
      height={48}
      className="yarit-brand-icon"
    />
  )
}
