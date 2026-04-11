/**
 * @file Next.js middleware (locale routing + Payload admin repair)
 * @summary Two jobs on this file:
 *
 *          1. Delegate to next-intl's middleware for URL-based locale
 *             detection, redirect, and rewrite on the storefront side.
 *             The matcher carefully excludes Payload routes
 *             (`/admin`, `/api`) and static files — those must not be
 *             intercepted.
 *
 *          2. Repair Payload 3.82.1's admin entry points on Next 16.
 *             See `PAYLOAD_ADMIN_BUG` below for the full reason.
 *
 *          Next 16 note: the file is still named `middleware.ts`
 *          (deprecated but supported) rather than `proxy.ts` because
 *          next-intl's middleware uses edge runtime patterns. If we
 *          later migrate to `proxy.ts`, verify next-intl supports
 *          Node.js runtime first.
 *
 *          ===== PAYLOAD_ADMIN_BUG =====
 *          Payload 3.82.1's login view + admin root are server
 *          components that call `redirect()` based on auth state.
 *          On Next 16 + React 19, those `redirect()` calls fire from
 *          INSIDE a Suspense boundary in Payload's admin router,
 *          which Next 16 cannot propagate out as a real HTTP 307 — it
 *          gets serialized into the streaming RSC response as a
 *          `NEXT_REDIRECT` error digest and the Suspense fallback
 *          (null) is what actually renders. Result: a blank page.
 *
 *          Two distinct affected cases:
 *
 *          A) Visitor has a VALID `payload-token` cookie and hits
 *             `/admin/login`. Payload's login view tries to redirect
 *             them to `/admin` → blank page.
 *
 *          B) Visitor has a STALE / malformed / expired
 *             `payload-token` cookie and hits `/admin/login` or
 *             `/admin`. Payload cannot validate the token and tries
 *             to redirect to `/admin/login` → blank page. This traps
 *             the user on a blank page with no way to reach the real
 *             login form (every load re-triggers the failed
 *             redirect). Clearing cookies manually is the only
 *             client-side workaround.
 *
 *          The fix for both cases is middleware-level pre-emption:
 *
 *          • If the request to `/admin/login` carries a cookie AND
 *            the JWT exp field is in the future (i.e. the token is
 *            plausibly valid), issue a 307 → `/admin` ourselves so
 *            Payload's own "already logged in, redirect to dashboard"
 *            branch never fires.
 *
 *          • If the cookie is present but expired / malformed /
 *            unparseable, DELETE the cookie at the edge and let the
 *            request through to Payload, which will then render the
 *            real login form (no token = no redirect attempt).
 *
 *          • If the cookie is missing, fall through untouched.
 *
 *          We intentionally do NOT verify the JWT signature in
 *          middleware. The only decision we make is "expired vs not"
 *          — and the only consequence of guessing wrong is one extra
 *          hop (a spoofed-but-shaped JWT sails through and Payload's
 *          downstream auth catches it properly). Validating the
 *          signature here would mean duplicating `PAYLOAD_SECRET` +
 *          Payload's session-store handshake into middleware, which
 *          is brittle against future Payload upgrades.
 */
import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

/**
 * Classify a `payload-token` JWT by parsing the base64url-encoded
 * payload segment (the middle of the `header.payload.signature`
 * triplet) and inspecting the `exp` field.
 *
 *   - `valid`        — shape is a JWT and `exp` is in the future
 *   - `expired`      — shape is a JWT and `exp` is in the past
 *   - `malformed`    — not a JWT (fewer than 3 segments, bad base64,
 *                      or no `exp` field)
 *
 * We never check the signature here — see PAYLOAD_ADMIN_BUG above.
 */
function classifyToken(raw: string): 'valid' | 'expired' | 'malformed' {
  try {
    const parts = raw.split('.')
    if (parts.length !== 3) return 'malformed'
    // base64url → base64, then decode. `atob` is available in the Next
    // 16 edge-compatible middleware runtime.
    const payloadB64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), '=')
    const json = atob(payloadB64)
    const parsed = JSON.parse(json) as { exp?: number }
    if (typeof parsed.exp !== 'number') return 'malformed'
    // `exp` is seconds since epoch; Date.now() is milliseconds.
    if (parsed.exp * 1000 <= Date.now()) return 'expired'
    return 'valid'
  } catch {
    return 'malformed'
  }
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── /admin/* repair layer (see PAYLOAD_ADMIN_BUG above) ─────────
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const token = request.cookies.get('payload-token')
    const state: 'valid' | 'expired' | 'malformed' | 'missing' = token?.value
      ? classifyToken(token.value)
      : 'missing'

    // ──  /admin/login ──────────────────────────────────────────
    if (pathname === '/admin/login') {
      if (state === 'valid') {
        // Case A: already logged in. Skip Payload's buggy
        // redirect-from-Suspense-boundary by issuing the 307 here.
        return NextResponse.redirect(new URL('/admin', request.url), 307)
      }
      if (state === 'expired' || state === 'malformed') {
        // Case B: stale cookie at /admin/login. Strip it so Payload
        // renders the login form (no token = no redirect attempt).
        const response = NextResponse.next()
        response.cookies.delete('payload-token')
        return response
      }
      // state === 'missing' → fresh visitor, let Payload render.
      return NextResponse.next()
    }

    // ──  /admin/* (everything except /admin/login) ────────────
    if (state === 'valid') {
      // Plausibly-authenticated user. Pass through to Payload; if
      // the signature is actually forged, Payload's downstream auth
      // will still reject at the API layer.
      return NextResponse.next()
    }
    // state ∈ {expired, malformed, missing} → user is not
    // authenticated. Payload's server-side guard would try to
    // `redirect('/admin/login')`, which hits the same Suspense-
    // boundary bug → blank page. Pre-empt by redirecting ourselves
    // and strip any stale cookie on the way. We preserve the
    // original path in `?redirect=` so the user lands back on it
    // after logging in (Payload reads this query param).
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
    const response = NextResponse.redirect(loginUrl, 307)
    if (state !== 'missing') {
      response.cookies.delete('payload-token')
    }
    return response
  }

  // ── Everything else → next-intl locale handling ─────────────────
  return intlMiddleware(request)
}

export const config = {
  // Match:
  //   - All `/admin/*` routes so we can repair Payload 3.82.1's
  //     redirect-from-inside-Suspense bug on Next 16 (see
  //     PAYLOAD_ADMIN_BUG above).
  //   - Everything that's NOT `/admin`, `/api`, `/_next`, `/_vercel`,
  //     or a static file — this is the storefront-locale match.
  //
  // Round 5 note: removed /fulfillment from the exclusion list —
  // the old (admin-tools)/fulfillment route was deleted; the Yarit
  // fulfillment view now lives at /admin/fulfillment (covered by the
  // /admin exclusion).
  matcher: [
    '/admin',
    '/admin/:path*',
    '/((?!admin|api|_next|_vercel|.*\\..*).*)',
  ],
}
