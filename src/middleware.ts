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
 *          (null) is what renders. Result: a blank cream page.
 *
 *          Two distinct affected cases:
 *
 *          A) Visitor has a VALID `payload-token` cookie and hits
 *             `/admin/login`. Payload's login view tries to redirect
 *             them to `/admin` → blank page.
 *
 *          B) Visitor has a STALE / malformed / expired / bad-signature
 *             `payload-token` cookie and hits `/admin/login` or
 *             `/admin`. Payload cannot validate the token and tries
 *             to redirect to `/admin/login` → blank page. Every
 *             subsequent load re-triggers the failed redirect so the
 *             user is trapped until they manually clear cookies.
 *
 *          ===== FIX =====
 *          Middleware-level pre-emption gated on a FULL JWT
 *          verification (signature + expiry), not just shape.
 *
 *          • /admin/login with a verified-valid cookie
 *              → 307 → /admin ourselves (skip Payload's buggy path).
 *
 *          • /admin/login with any flavour of bad cookie (expired,
 *            malformed, signature mismatch against the current
 *            PAYLOAD_SECRET)
 *              → strip the cookie on the response AND in the
 *                forwarded request so Payload renders the real login
 *                form (no token = no redirect attempt).
 *
 *          • /admin/login with no cookie
 *              → fall through, Payload renders the login form.
 *
 *          • Any other /admin/* with a verified-valid cookie
 *              → fall through, Payload's own auth takes over.
 *
 *          • Any other /admin/* with a bad or missing cookie
 *              → 307 → /admin/login?redirect=<original-path>,
 *                stripping any stale cookie on the way.
 *
 *          ===== KEY DERIVATION — CRITICAL =====
 *          Payload 3.82 does NOT sign JWTs with `PAYLOAD_SECRET`
 *          directly. It derives the HMAC key in `payload/dist/index.js`:
 *
 *              this.secret = crypto
 *                .createHash('sha256')
 *                .update(this.config.secret)
 *                .digest('hex')
 *                .slice(0, 32)
 *
 *          Then passes that 32-char hex string into jose's SignJWT as
 *          the raw-utf8 HMAC key. We reproduce that exact derivation
 *          here via the Web Crypto API so `crypto.subtle.verify`
 *          matches Payload's signatures bit-for-bit. Forgetting this
 *          step cost an entire debug cycle — earlier attempts used
 *          the raw secret and rejected every valid Payload cookie as
 *          `bad-signature`.
 *
 *          If `PAYLOAD_SECRET` is not available in the middleware
 *          runtime (it should always be, since `payload.config.ts`
 *          hard-fails production boots without it), we treat every
 *          cookie as `bad-signature` — safer than trusting a token
 *          we can't verify.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
// ^ Probe 2026-04-12: helpers + NextResponse are kept as dead code
//   so restoring the /admin/* repair block is a pure revert.

import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

type TokenState = 'valid' | 'expired' | 'malformed' | 'bad-signature'

/**
 * Decode base64url to a fresh `Uint8Array<ArrayBuffer>`. The explicit
 * `ArrayBuffer` allocation is required so the returned buffer is a
 * concrete `ArrayBuffer` (not `SharedArrayBuffer`), which is what
 * `crypto.subtle.verify`'s `BufferSource` parameter expects under
 * TypeScript's ES2024 lib typings.
 */
function base64urlToBytes(input: string): Uint8Array<ArrayBuffer> {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded =
    normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  const bin = atob(padded)
  const buffer = new ArrayBuffer(bin.length)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/**
 * Decode the JWT payload segment (middle of `header.payload.sig`) to
 * a UTF-8 string for `JSON.parse`.
 */
function base64urlToString(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded =
    normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  return atob(padded)
}

/**
 * Convert a byte array to a lowercase hex string. Used for replicating
 * Payload's `crypto.createHash('sha256').update(...).digest('hex')`.
 */
function bytesToHex(bytes: Uint8Array): string {
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

/**
 * Derive Payload's HMAC key from `PAYLOAD_SECRET`. See
 * `PAYLOAD_ADMIN_BUG > KEY DERIVATION` in the file header for the
 * full explanation — in short, Payload takes `sha256(secret).hex`,
 * slices the first 32 chars, and uses THAT string's UTF-8 bytes as
 * the HMAC key.
 *
 * Returns a concrete `Uint8Array<ArrayBuffer>` (not SharedArrayBuffer)
 * ready to feed into `crypto.subtle.importKey`.
 */
async function derivePayloadHmacKey(
  secret: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const enc = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(secret))
  const hashBytes = new Uint8Array(hashBuffer)
  const derivedHex = bytesToHex(hashBytes).slice(0, 32)
  const keyBuffer = new ArrayBuffer(derivedHex.length)
  const keyBytes = new Uint8Array(keyBuffer)
  for (let i = 0; i < derivedHex.length; i++) {
    keyBytes[i] = derivedHex.charCodeAt(i)
  }
  return keyBytes
}

/**
 * Classify a `payload-token` JWT. Four possible states:
 *
 *   - `valid`          — HS256 signature verifies against the derived
 *                        key AND `exp` is in the future
 *   - `expired`        — signature verifies but `exp` is in the past
 *   - `bad-signature`  — JWT shape is correct but the signature
 *                        doesn't verify (stale tokens from a previous
 *                        deploy, tokens signed with a different
 *                        secret, or tampering)
 *   - `malformed`      — not a JWT (fewer than 3 segments, bad
 *                        base64, no `exp` field, or any parse error)
 *
 * Never throws — any unexpected error classifies as `malformed`.
 */
async function classifyToken(raw: string): Promise<TokenState> {
  try {
    const parts = raw.split('.')
    if (parts.length !== 3) return 'malformed'
    const [headerB64, payloadB64, signatureB64] = parts

    const payloadJson = base64urlToString(payloadB64)
    const parsed = JSON.parse(payloadJson) as { exp?: number }
    if (typeof parsed.exp !== 'number') return 'malformed'
    const isExpired = parsed.exp * 1000 <= Date.now()

    const secret = process.env.PAYLOAD_SECRET
    if (!secret) return 'bad-signature'

    const keyBytes = await derivePayloadHmacKey(secret)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    const signatureBytes = base64urlToBytes(signatureB64)
    const enc = new TextEncoder()
    const messageBytes = enc.encode(`${headerB64}.${payloadB64}`)
    const signatureOk = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes,
      messageBytes,
    )

    if (!signatureOk) return 'bad-signature'
    if (isExpired) return 'expired'
    return 'valid'
  } catch {
    return 'malformed'
  }
}

/**
 * Strip the `payload-token` cookie from the forwarded request headers
 * so that Payload's downstream handler (invoked via
 * `NextResponse.next({ request: { headers } })`) sees the request as
 * cookie-less. Without this, Payload still reads the bad cookie from
 * the original request even when we tell the browser to clear it on
 * the response, and re-triggers the Suspense-boundary bug.
 *
 * Handles both the `cookie` header as a flat string and the rare
 * multi-valued `cookie` case by parsing individual name/value pairs.
 */
function stripPayloadTokenFromRequestHeaders(
  source: Headers,
): Headers {
  const headers = new Headers(source)
  const cookieHeader = headers.get('cookie')
  if (!cookieHeader) return headers
  const preserved = cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter((entry) => {
      const eqIdx = entry.indexOf('=')
      const name = eqIdx === -1 ? entry : entry.slice(0, eqIdx)
      return name !== 'payload-token'
    })
    .join('; ')
  if (preserved.length > 0) {
    headers.set('cookie', preserved)
  } else {
    headers.delete('cookie')
  }
  return headers
}

export default async function middleware(request: NextRequest) {
  // PROBE 2026-04-12: /admin/* middleware layer temporarily removed
  // to bisect the admin blank-page bug. If the preview renders the
  // admin without any middleware on /admin/*, the bug was caused by
  // Vercel's edge middleware layer interacting with Next 16 Turbopack
  // prod build's streaming RSC pipeline. Restore this block once the
  // bisect is complete (see PAYLOAD_ADMIN_BUG at file header).
  //
  // The classifyToken / derivePayloadHmacKey helpers below are kept
  // as dead code while this probe is active — restoring the block
  // above is a pure revert.

  // ── Everything → next-intl locale handling ─────────────────────
  return intlMiddleware(request)
}

export const config = {
  // PROBE 2026-04-12: /admin exclusion restored (this is the
  // 8d50bd4 form). The /admin/:path* matcher that was added in
  // cec7d68 to pre-empt Payload's redirect-from-Suspense bug is
  // gone while we test whether middleware is the cause of slot 18's
  // $L19 = null bug.
  matcher: [
    '/((?!admin|api|_next|_vercel|.*\\..*).*)',
  ],
}
