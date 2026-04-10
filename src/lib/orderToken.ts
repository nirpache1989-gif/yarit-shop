/**
 * @file orderToken — sign / verify short-lived checkout-success tokens
 * @summary Closes a P1 privacy issue: until this helper existed, the
 *          `/checkout/success?order=<id>` page called `payload.findByID`
 *          directly on whatever ID came out of the query string, so
 *          anyone with an order URL (or a guessable numeric ID) could
 *          read any customer's order summary.
 *
 *          Instead, `src/lib/checkout.ts` now calls `signOrderToken`
 *          to mint a 24-hour HMAC token over the order ID and embeds
 *          it in the redirect URL as `?token=<signed>`. The success
 *          page calls `verifyOrderToken` before touching Payload. No
 *          verification → render the "order not found" empty state;
 *          no database read happens.
 *
 *          Token format (URL-safe base64 segments, dot-separated):
 *              <orderId>.<expiresAtSeconds>.<hmacSha256(orderId.expiresAt)>
 *
 *          The HMAC secret is `PAYLOAD_SECRET`. We read it lazily at
 *          call time so process env changes (tests, hot reloads) are
 *          picked up without re-importing the module.
 *
 *          TTL: 24 hours. Long enough that a customer can re-open
 *          their confirmation email the next morning; short enough
 *          that leaked URLs stop working before the order ages out.
 *          Customers who need later access go through `/account`,
 *          which is auth-gated instead.
 *
 *          Verification is constant-time (`crypto.timingSafeEqual`)
 *          to defeat timing side-channels on the HMAC comparison.
 *
 *          Note: this helper is intentionally Node-only. It must not
 *          run in client components. Both callers (`checkout.ts` and
 *          the success page) are server-side.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

const TTL_SECONDS = 60 * 60 * 24 // 24 hours

function getSecret(): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret || secret.length < 8) {
    // In local dev without PAYLOAD_SECRET set, fall back to the same
    // placeholder Payload's config uses. Tokens signed with this
    // placeholder are still opaque to anyone who doesn't have the
    // source code, but they're not production-grade — don't rely on
    // them in prod. Payload loudly warns if the placeholder is used.
    return 'dev-only-secret-change-in-production'
  }
  return secret
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function hmac(payload: string): string {
  return base64UrlEncode(createHmac('sha256', getSecret()).update(payload).digest())
}

export function signOrderToken(orderId: string | number): string {
  const id = String(orderId)
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS
  const payload = `${id}.${expiresAt}`
  const sig = hmac(payload)
  return `${payload}.${sig}`
}

export type VerifiedOrderToken = {
  orderId: string
  expiresAt: number
}

export function verifyOrderToken(token: string | undefined): VerifiedOrderToken | null {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [id, expiresAtStr, sig] = parts
  if (!id || !expiresAtStr || !sig) return null

  const expiresAt = Number(expiresAtStr)
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return null
  if (expiresAt < Math.floor(Date.now() / 1000)) return null

  const expected = hmac(`${id}.${expiresAt}`)

  // Constant-time comparison. Buffer.from both sides in ascii so the
  // lengths are guaranteed identical before timingSafeEqual (which
  // throws on length mismatch).
  try {
    const a = Buffer.from(sig, 'ascii')
    const b = Buffer.from(expected, 'ascii')
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null
  } catch {
    return null
  }

  return { orderId: id, expiresAt }
}
