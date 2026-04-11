/**
 * @file gsap — single-entry GSAP module with ScrollTrigger pre-registered
 * @summary All client components that need GSAP must import from here,
 *          NOT directly from `gsap` or `gsap/ScrollTrigger`. This file
 *          calls `gsap.registerPlugin(ScrollTrigger)` exactly once,
 *          guarded against multiple registrations (Next's client bundle
 *          splitting can cause the same module to import twice under
 *          certain conditions — GSAP's `registerPlugin` is idempotent
 *          but we add an explicit guard anyway for clarity).
 *
 *          The `typeof window !== 'undefined'` guard is there because
 *          ScrollTrigger touches `window` at registration time, and
 *          this file may be imported from a server-ish context during
 *          SSR bundling. Next 16 has gotten better at tree-shaking
 *          `'use client'` modules out of the server bundle, but belt
 *          and braces — we refuse to register the plugin on the server.
 *
 *          Usage in a client component:
 *
 *              import { gsap, ScrollTrigger } from '@/lib/motion/gsap'
 *              // ...then use `gsap.to(...)`, `ScrollTrigger.create(...)`, etc.
 *
 *          See also:
 *            - `useGsapReducedMotion` — the required a11y check before
 *              building any timeline
 *            - `GsapScope` — the recommended useGSAP() wrapper
 *
 *          Bundle cost: ~25KB gzipped for core + ~10KB for ScrollTrigger.
 *          By centralizing plugin registration here, tree-shakers only
 *          bundle ScrollTrigger onto routes that transitively import
 *          this module — auth / legal / admin pages stay clean.
 */
'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// NOTE on the dist/Flip import path:
// The gsap 3.14.2 package ships its Flip type declarations in
// `types/flip.d.ts` (lowercase filename), but the package.json
// exports field advertises the types as `./types/*.d.ts` which,
// for `gsap/Flip`, canonicalizes to `types/Flip.d.ts` (uppercase).
// On case-insensitive filesystems (Windows, macOS default) TS
// reports a TS1149 casing conflict because the same physical
// file is referenced under two different casings. Importing
// from `gsap/dist/Flip` avoids the package.json types-subpath
// resolver and falls back to the ambient `declare module
// "gsap/dist/Flip"` declaration inside flip.d.ts, which sidesteps
// the casing bug entirely. Runtime JS resolution is identical.
import { Flip } from 'gsap/dist/Flip'

// Guard against double registration. GSAP handles this internally (its
// `registerPlugin` dedupes by plugin identity), but the explicit window
// check keeps the side effect off the server bundle entirely, and the
// module-level flag makes the intent obvious to future readers.
//
// Flip is bundled in the free `gsap` package since April 2024 — no
// extra install needed. We register it alongside ScrollTrigger so
// Tier-1 upgrades T1.6 (shop grid Flip) and T1.7 (gallery thumb Flip)
// can import `Flip` from this module without touching the raw path.
let registered = false

if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger, Flip)
  registered = true
}

export { gsap, ScrollTrigger, Flip }
