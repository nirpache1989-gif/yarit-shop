'use client'

/**
 * @file ChildrenBridge — PROBE 8
 * @summary Probe component that wraps `{children}` in a `'use client'`
 *          boundary before passing to Payload's RootLayout.
 *
 *          Theory: the admin blank-page bug on Vercel prod may be
 *          caused by how React 19's server render serializes the
 *          children prop through Payload's provider chain. Wrapping
 *          in a client component MAY force React to treat the
 *          children as a client-boundary slot and resolve them
 *          differently.
 *
 *          If this fixes the bug, we keep this file as a permanent
 *          workaround. If not, delete it.
 */

import type { ReactNode } from 'react'

export function ChildrenBridge({ children }: { children: ReactNode }) {
  return <>{children}</>
}
