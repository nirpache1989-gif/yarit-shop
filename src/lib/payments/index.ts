/**
 * @file Payment provider factory
 * @summary Returns the active provider based on `process.env.PAYMENT_PROVIDER`.
 *          Defaults to `mock` in dev / any env where the variable is
 *          unset, so the site can always run end-to-end without
 *          external credentials.
 *
 *          To switch to a real gateway: set `PAYMENT_PROVIDER=meshulam`
 *          (or another supported value) in `.env.local` or the Vercel
 *          environment variables.
 */
import type { PaymentProvider } from './provider'
import { mockProvider } from './mock'
import { meshulamProvider } from './meshulam'

const providers: Record<string, PaymentProvider> = {
  mock: mockProvider,
  meshulam: meshulamProvider,
}

export function getPaymentProvider(): PaymentProvider {
  const key = (process.env.PAYMENT_PROVIDER ?? 'mock').toLowerCase()
  const provider = providers[key]
  if (!provider) {
    throw new Error(
      `Unknown PAYMENT_PROVIDER="${key}". Supported: ${Object.keys(providers).join(', ')}`,
    )
  }
  return provider
}

export type { PaymentProvider } from './provider'
