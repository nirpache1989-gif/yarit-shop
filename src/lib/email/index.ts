/**
 * @file Email provider factory
 * @summary Returns the active provider based on `EMAIL_PROVIDER` env
 *          var.
 *
 *          **Fail-closed in production** (2026-04-11 late QA pass).
 *          Previously this factory silently defaulted to the `mock`
 *          provider whenever `EMAIL_PROVIDER` was unset. That meant
 *          order confirmations, reset-password links, and new-order
 *          admin alerts would all log to stdout in production and
 *          never reach a real inbox. New behavior:
 *
 *            - If `EMAIL_PROVIDER` is set explicitly, use it
 *              (including `mock` — useful for local E2E runs)
 *            - If unset AND `NODE_ENV === 'production'`, throw. The
 *              checkout orchestration in `src/lib/checkout.ts`
 *              catches email-send failures as non-fatal so a thrown
 *              factory here does NOT block order creation — it just
 *              logs the failure. This is the right behavior: a mis-
 *              configured env shouldn't block orders, but it also
 *              shouldn't silently "succeed" at sending emails nobody
 *              will ever see.
 *            - If unset AND we are in dev, default to `mock` so
 *              `npm run dev` still works offline.
 */
import type { EmailProvider } from './provider'
import { mockEmailProvider } from './mock'
import { resendEmailProvider } from './resend'

const providers: Record<string, EmailProvider> = {
  mock: mockEmailProvider,
  resend: resendEmailProvider,
}

function resolveKey(): string {
  const raw = process.env.EMAIL_PROVIDER
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().toLowerCase()
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'EMAIL_PROVIDER is not set. Refusing to default to the mock provider in production — a real email provider MUST be configured before sending customer-facing email. Set EMAIL_PROVIDER=resend (or another supported value) + RESEND_API_KEY + EMAIL_FROM in the Vercel environment variables and redeploy.',
    )
  }
  return 'mock'
}

export function getEmailProvider(): EmailProvider {
  const key = resolveKey()
  const provider = providers[key]
  if (!provider) {
    throw new Error(
      `Unknown EMAIL_PROVIDER="${key}". Supported: ${Object.keys(providers).join(', ')}`,
    )
  }
  return provider
}

/**
 * True when the active email provider is the in-process mock. Used
 * by the checkout UI to decide whether to render the "test email"
 * notice. Returns `false` if EMAIL_PROVIDER is unset in production
 * (the factory would throw — we report "not mock" to avoid a double-
 * error path).
 */
export function isMockEmailProvider(): boolean {
  try {
    return resolveKey() === 'mock'
  } catch {
    return false
  }
}

export type { EmailProvider, EmailMessage } from './provider'
