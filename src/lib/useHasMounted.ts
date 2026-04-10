/**
 * @file useHasMounted — "has this client hydrated yet" hook
 * @summary Replaces the `mounted + setState` anti-pattern that React
 *          19's `react-hooks/set-state-in-effect` lint rule (rightly)
 *          flags. The problem being solved: Zustand + persist
 *          hydrates on the client after the first render, so on the
 *          server the cart count is always 0 — rendering it as a
 *          number immediately causes hydration mismatches.
 *
 *          `useSyncExternalStore` is the React 19-blessed API for
 *          "give me different values on server vs. client without
 *          mismatching". Our "store" is a no-op — we subscribe to
 *          nothing and just return `true` on client / `false` on
 *          server. React takes care of the rest.
 *
 *          Use in any client component that needs to delay reading
 *          persisted state until after hydration:
 *
 *              const mounted = useHasMounted()
 *              const count = mounted ? useCart(selectCount) : 0
 *
 *          This file has no side effects; it's safe to import from
 *          anywhere.
 */
'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {
  /* noop — we never fire notifications, we just want a stable hook */
}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function useHasMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
