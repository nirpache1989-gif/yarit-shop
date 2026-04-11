/**
 * @file useGsapReducedMotion — reactive `prefers-reduced-motion` hook
 * @summary Returns `true` if the user has asked the OS to reduce motion,
 *          `false` otherwise. Subscribes to the media query so the value
 *          updates live if the user toggles the OS setting mid-session
 *          (rare but correct).
 *
 *          Uses `useSyncExternalStore` — the React 19 blessed API for
 *          external-store subscriptions — same pattern as `useHasMounted`
 *          at `src/lib/useHasMounted.ts` and the `ThemeToggle` component.
 *
 *          Why not just inline the `matchMedia` check inside each GSAP
 *          component? Because we want one central source of truth. Every
 *          GSAP-touching client component calls this hook first, and
 *          if it returns `true` we SKIP the timeline entirely and let
 *          the CSS `prefers-reduced-motion` guard in globals.css handle
 *          the final-state rendering. That keeps the reduced-motion path
 *          identical across every GSAP wave (G2, G3, and any future G4+).
 *
 *          Design note — SSR safety:
 *          The server snapshot returns `false` (animations enabled) so
 *          the SSR-rendered HTML matches the non-reduced-motion path.
 *          On client hydration, if the user actually prefers reduced
 *          motion, the hook flips to `true` and the GSAP effect short-
 *          circuits to a `gsap.set()` that snaps to the final state.
 *          There's no hydration mismatch because neither GSAP nor the
 *          hook touch the DOM on the server.
 *
 *          Usage:
 *              const reduced = useGsapReducedMotion()
 *              useGSAP(() => {
 *                if (reduced) {
 *                  gsap.set(targets, { clearProps: 'all' })
 *                  return
 *                }
 *                // ...build the timeline
 *              }, { dependencies: [reduced] })
 */
'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void): () => void {
  // SSR safety — no `window`, no-op subscription.
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {
      /* noop */
    }
  }
  const mql = window.matchMedia(QUERY)
  // `addEventListener` is the modern API; MediaQueryList older Safari
  // versions only had `addListener` which is now deprecated but still
  // works. We only support modern browsers so the event-based form is
  // enough.
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot(): boolean {
  // On the server we cannot know the user's preference, so we default
  // to "motion enabled." The GSAP effects only run on the client anyway;
  // this value exists purely so SSR and the first client paint agree.
  return false
}

export function useGsapReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
