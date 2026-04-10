/**
 * @file AdminDriftingLeaves — decorative leaf layer for the admin panel
 * @summary Client wrapper that mounts the shared <DriftingLeaves>
 *          component inside the admin. Registered via
 *          `admin.components.providers` in payload.config.ts.
 *
 *          Why a provider: Payload's admin layout owns its own <body>
 *          and doesn't expose a natural slot for absolute-positioned
 *          decoration. Providers render inside the admin document,
 *          so `position: fixed` + `z-index: 0` gives us a background
 *          layer behind Payload's own content (which sits at z-index
 *          ≥ 1 via the `@layer payload` rules in admin-brand.css).
 *
 *          The drifting leaves CSS lives in admin-brand.css, NOT
 *          globals.css, because globals.css is not loaded in the
 *          admin route group.
 *
 *          See: Round 4 plan Track C6.
 */
'use client'

import { DriftingLeaves } from '@/components/ui/DriftingLeaves'

export function AdminDriftingLeaves() {
  return <DriftingLeaves />
}
