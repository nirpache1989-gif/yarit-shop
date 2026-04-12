/**
 * @file Payload admin catch-all page — PROBE 5
 * @summary TEMPORARILY replaced with a hardcoded <div> to bisect the
 *          admin blank-page bug. If this renders on Vercel prod, the
 *          bug is in Payload's `RootPage` from `@payloadcms/next/views`.
 *          If this ALSO renders blank, the bug is in the layout or
 *          Next.js routing itself.
 *
 *          Restore from git after probe completes.
 */
export const dynamic = 'force-dynamic'

export default function AdminProbePage() {
  return (
    <div
      id="admin-probe-marker"
      style={{
        padding: '40px',
        fontFamily: 'sans-serif',
        textAlign: 'center',
      }}
    >
      <h1 style={{ color: '#5A6A4C' }}>🌿 Probe 5 is alive</h1>
      <p>
        If you see this page, the admin catch-all route renders
        correctly. The bug is inside Payload&apos;s{' '}
        <code>RootPage</code> (not the layout, not middleware, not
        Next.js routing).
      </p>
      <p>
        Slot 18/19 chain should no longer have{' '}
        <code>children: null</code>.
      </p>
      <ul>
        <li>Route: /admin/[[...segments]]/page.tsx</li>
        <li>Layout: src/app/(payload)/layout.tsx → Payload RootLayout</li>
        <li>Build: next build --webpack</li>
        <li>Date: 2026-04-12</li>
      </ul>
    </div>
  )
}
