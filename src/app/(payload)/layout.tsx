/**
 * @file Payload admin root layout — PROBE 7
 * @summary TEMPORARILY replaced with a minimal <html>/<body> wrapper
 *          that does NOT invoke Payload's RootLayout. If the /probe
 *          sibling route renders on Vercel prod with this shim, the
 *          bug is inside `@payloadcms/next/layouts.RootLayout` and
 *          specifically how it serializes its provider tree on
 *          Vercel's Node.js serverless runtime.
 *
 *          Restore from git after probe completes.
 */

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => (
  <html lang="he" dir="rtl">
    <head>
      <title>PROBE 7 — (payload) layout shim</title>
    </head>
    <body>
      <div id="probe-layout-marker" style={{ padding: '40px' }}>
        <h1>🌿 Probe 7: minimal layout</h1>
        <p>
          This is a minimal <code>(payload)/layout.tsx</code> that
          does NOT import from <code>@payloadcms/next/layouts</code>.
          If you see this text with the child page content below,
          Payload&apos;s <code>RootLayout</code> is the culprit.
        </p>
        <hr />
        {children}
      </div>
    </body>
  </html>
)

export default Layout
