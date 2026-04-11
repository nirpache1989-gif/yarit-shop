/**
 * @file Next.js middleware (locale routing + /admin/login intercept)
 * @summary Two jobs on this file:
 *
 *          1. Delegate to next-intl's middleware for URL-based locale
 *             detection, redirect, and rewrite on the storefront side.
 *             The matcher carefully excludes Payload routes
 *             (`/admin`, `/api`) and static files — those must not be
 *             intercepted.
 *
 *          2. Intercept `/admin/login` specifically when the visitor
 *             arrives carrying a `payload-token` cookie. See
 *             `ADMIN_LOGIN_BUG` below for the full reason.
 *
 *          Next 16 note: the file is still named `middleware.ts`
 *          (deprecated but supported) rather than `proxy.ts` because
 *          next-intl's middleware uses edge runtime patterns. If we
 *          later migrate to `proxy.ts`, verify next-intl supports
 *          Node.js runtime first.
 *
 *          ===== ADMIN_LOGIN_BUG =====
 *          Payload 3.82.1's login view is a server component that
 *          calls `redirect('/admin')` whenever the incoming request
 *          carries a valid-looking session cookie. On Next 16 + React
 *          19, that `redirect()` is thrown from inside a Suspense
 *          boundary in Payload's admin router, which Next 16 can't
 *          propagate out as a real HTTP 307 — it gets serialized into
 *          the streaming RSC response as a `NEXT_REDIRECT` error
 *          digest and the Suspense fallback (null) is what actually
 *          renders. Result: anyone with a `payload-token` cookie who
 *          navigates to `/admin/login` on prod sees a blank page
 *          instead of being redirected to the dashboard.
 *
 *          Reproduction + diagnosis notes are in the commit message
 *          that introduced this file edit.
 *
 *          The fix is a three-line pre-emption: when a request to
 *          `/admin/login` carries a `payload-token` cookie, we issue
 *          the 307 → `/admin` ourselves at the middleware layer
 *          before Payload's route handler ever runs. Fresh visitors
 *          with no cookie fall through untouched and Payload renders
 *          the normal login form.
 *
 *          We do NOT validate the JWT here. A stale/invalid token
 *          still triggers the redirect, but the downstream `/admin`
 *          route is Payload's own handler and it will re-route back
 *          to `/admin/login` (without a cookie, because Payload
 *          clears it) — the second hit then falls through to the
 *          real login form. That second hop is ~50ms extra, and
 *          validating the JWT here would require duplicating
 *          Payload's auth logic (with its own PAYLOAD_SECRET +
 *          session-store handshake) outside of Payload, which is
 *          both brittle and invasive.
 */
import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── /admin/login pre-emption (see ADMIN_LOGIN_BUG above) ─────────
  if (pathname === '/admin/login') {
    const token = request.cookies.get('payload-token')
    if (token?.value) {
      const adminUrl = new URL('/admin', request.url)
      // 307 preserves the request method. The user's browser is
      // asking for the login view; we're pointing it at the dashboard
      // instead. `replace` so browser history doesn't stack up a
      // dead /admin/login entry.
      return NextResponse.redirect(adminUrl, 307)
    }
    // Fresh visitor, no token — let Payload render the login form.
    return NextResponse.next()
  }

  // ── Everything else → next-intl locale handling ─────────────────
  return intlMiddleware(request)
}

export const config = {
  // Match:
  //   - `/admin/login` exactly, so we can pre-empt Payload's buggy
  //     redirect-from-inside-Suspense path (see ADMIN_LOGIN_BUG).
  //   - Everything that's NOT `/admin`, `/api`, `/_next`, `/_vercel`,
  //     or a static file — this is the storefront-locale match.
  //
  // Round 5 note: removed /fulfillment from the exclusion list —
  // the old (admin-tools)/fulfillment route was deleted; the Yarit
  // fulfillment view now lives at /admin/fulfillment (covered by the
  // /admin exclusion).
  matcher: [
    '/admin/login',
    '/((?!admin|api|_next|_vercel|.*\\..*).*)',
  ],
}
