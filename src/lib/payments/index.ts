/**
 * @file Payment provider factory
 * @summary Returns the active provider based on `process.env.PAYMENT_PROVIDER`.
 *
 *          **Fail-closed in production** (2026-04-11 late QA pass).
 *          Previously this factory silently defaulted to the `mock`
 *          provider whenever `PAYMENT_PROVIDER` was unset. That meant
 *          a misconfigured Vercel environment could quietly accept
 *          "payments" that never reached a real gateway — customers
 *          would see a success page but Yarit would receive zero
 *          money. The new behavior:
 *
 *            - If `PAYMENT_PROVIDER` is set explicitly, use it
 *              (including `mock` — useful for local E2E runs)
 *            - If unset AND we are in a production-like env
 *              (`NODE_ENV === 'production'`), throw. This cascades
 *              up through `/api/checkout` and the customer sees a
 *              real "payment not configured" error instead of a
 *              silent fake success.
 *            - If unset AND we are in dev (`NODE_ENV !== 'production'`),
 *              default to `mock` so `npm run dev` still works offline.
 *
 *          To switch to a real gateway in prod: set
 *          `PAYMENT_PROVIDER=meshulam` + the credential env vars in
 *          Vercel, then redeploy.
 *
 *          `isMockPaymentProvider()` returns `true` when the active
 *          provider is the in-process mock. Used by the checkout UI
 *          to decide whether to show the "test checkout" notice.
 */
import type { PaymentProvider } from './provider'
import { mockProvider } from './mock'
import { meshulamProvider } from './meshulam'

const providers: Record<string, PaymentProvider> = {
  mock: mockProvider,
  meshulam: meshulamProvider,
}

function resolveKey(): string {
  const raw = process.env.PAYMENT_PROVIDER
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().toLowerCase()
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'PAYMENT_PROVIDER is not set. Refusing to default to the mock provider in production — a real gateway MUST be configured before accepting real orders. Set PAYMENT_PROVIDER=meshulam (or another supported value) in the Vercel environment variables and redeploy.',
    )
  }
  return 'mock'
}

export function getPaymentProvider(): PaymentProvider {
  const key = resolveKey()
  const provider = providers[key]
  if (!provider) {
    throw new Error(
      `Unknown PAYMENT_PROVIDER="${key}". Supported: ${Object.keys(providers).join(', ')}`,
    )
  }
  return provider
}

/**
 * True when the active provider is the in-process mock. The checkout
 * UI uses this to decide whether to render the "test checkout, no
 * real payment" disclaimer. Returns `false` if PAYMENT_PROVIDER is
 * unset in production (the factory would throw — we just report
 * "not mock" to avoid double-error).
 */
export function isMockPaymentProvider(): boolean {
  try {
    return resolveKey() === 'mock'
  } catch {
    return false
  }
}

export type { PaymentProvider } from './provider'
