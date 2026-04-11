/**
 * @file Admin route loading state
 * @summary 2026-04-12 admin-fix probe: explicit Suspense fallback for the
 *          admin route. Next 16 + React 19 Suspense behaviour around
 *          async server components seems to vary based on whether a
 *          loading.tsx is present. Without one, the framework wraps the
 *          page in an implicit `<Suspense fallback={null}>` and on
 *          Vercel that fallback gets shipped as the entire body when
 *          the streaming SSR is closed early. With this file, the
 *          fallback is at least visible markup that proves the
 *          Suspense is firing — and may convince Next to use a
 *          different rendering path.
 */
export default function AdminLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1f1810',
        color: '#f3e5c0',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
      }}
    >
      <div data-yarit-loading="admin">טוען את הפאנל…</div>
    </div>
  )
}
