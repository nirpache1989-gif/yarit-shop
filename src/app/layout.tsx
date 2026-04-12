/**
 * @file Root app layout — minimal pass-through shim
 * @summary We intentionally use Next.js 16's "multiple root layouts" pattern
 *          where each route group owns its own `<html>/<body>`:
 *          - `src/app/(payload)/layout.tsx`       for the Payload admin at /admin/*
 *          - `src/app/(storefront)/[locale]/layout.tsx` for the storefront
 *
 *          The documented pattern says "to create multiple root layouts, remove
 *          the top-level `layout.tsx` file". That's what we did originally.
 *
 *          However, on Vercel's Next 16.2.3 + Turbopack prod build, omitting the
 *          top-level layout appears to mis-wire the `children` flow through the
 *          route-group boundary: the admin layout's `{children}` arrives as
 *          `null` at the server render, and Payload's `RootLayout` correctly
 *          wraps `null` with its providers — resulting in the admin UI being
 *          blank in the body while the full login form / dashboard content is
 *          serialized into the RSC `__next_f.push()` stream as an orphan slot.
 *
 *          This file is a minimal, no-HTML pass-through that exists only to
 *          give Next.js a top-level layout to anchor the route tree on. It
 *          must NOT render `<html>` or `<body>` — those stay in the route
 *          group layouts, which is where they need to be so we can ship a
 *          different shell (Hebrew RTL + admin fonts) for the admin vs. a
 *          locale-aware shell for the storefront.
 *
 *          If Next.js refuses to build (citing a missing root `<html>`), the
 *          fallback is to move `<html>/<body>` up into this file, but that's a
 *          much larger refactor and is NOT the shape we want.
 *
 *          Local `next start` renders the admin correctly without this file,
 *          but Vercel's Turbopack prod build does not — so this file is
 *          tentatively Vercel-prod-only scaffolding, kept for safety.
 */
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
