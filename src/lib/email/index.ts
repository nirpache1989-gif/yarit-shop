/**
 * @file Email provider factory
 * @summary Returns the active provider based on `EMAIL_PROVIDER` env
 *          var. Defaults to `mock` so dev always works.
 */
import type { EmailProvider } from './provider'
import { mockEmailProvider } from './mock'
import { resendEmailProvider } from './resend'

const providers: Record<string, EmailProvider> = {
  mock: mockEmailProvider,
  resend: resendEmailProvider,
}

export function getEmailProvider(): EmailProvider {
  const key = (process.env.EMAIL_PROVIDER ?? 'mock').toLowerCase()
  const provider = providers[key]
  if (!provider) {
    throw new Error(
      `Unknown EMAIL_PROVIDER="${key}". Supported: ${Object.keys(providers).join(', ')}`,
    )
  }
  return provider
}

export type { EmailProvider, EmailMessage } from './provider'
