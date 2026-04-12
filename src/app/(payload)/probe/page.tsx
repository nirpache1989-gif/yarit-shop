/**
 * @file Probe sibling page at /probe
 * @summary Lives in `(payload)/probe/page.tsx` — same route group
 *          as the broken admin catch-all but at a concrete, non-
 *          catch-all URL. If this renders on Vercel prod but
 *          /admin/* does not, the bug is specific to the
 *          `[[...segments]]` optional catch-all pattern or the
 *          /admin path binding, not to the (payload) layout.
 *
 *          Delete after probe completes.
 */
export const dynamic = 'force-dynamic'

export default function ProbePage() {
  return (
    <div
      id="probe-sibling-marker"
      style={{ padding: '40px', fontFamily: 'sans-serif' }}
    >
      <h1>🌿 Probe 6: sibling route</h1>
      <p>URL: /probe</p>
      <p>Route group: (payload)</p>
      <p>
        If you see this, the (payload)/layout.tsx works for
        concrete routes. The bug is specific to the /admin
        catch-all segment.
      </p>
    </div>
  )
}
