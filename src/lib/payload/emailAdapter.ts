/**
 * @file Payload email adapter (Copaia bridge)
 * @summary Implements Payload's `EmailAdapter` interface and delegates
 *          to the existing storefront `getEmailProvider()` factory in
 *          `src/lib/email/index.ts`. This avoids adding a new npm
 *          dependency (no `@payloadcms/email-nodemailer`) and keeps
 *          the email layer single-source-of-truth: every email — both
 *          checkout confirmations sent via the storefront and Payload
 *          auth emails (forgot password, etc.) — flows through the
 *          same provider abstraction.
 *
 *          Provider selection is controlled by `EMAIL_PROVIDER`:
 *            - unset / `mock`  → console-prints the rendered HTML in dev
 *            - `resend`        → real Resend SMTP send
 *
 *          Wired into `payload.config.ts` via the top-level `email:`
 *          option. Without this, Payload falls back to its built-in
 *          `consoleEmailAdapter`, which logs only the subject line —
 *          customers would never see the password-reset URL.
 */
import type { EmailAdapter, SendEmailOptions } from 'payload'
import { getEmailProvider } from '@/lib/email'

const DEFAULT_FROM_ADDRESS =
  process.env.EMAIL_FROM ?? 'noreply@copaia.local'
const DEFAULT_FROM_NAME = process.env.EMAIL_FROM_NAME ?? 'קופאה'

/**
 * Flattens Nodemailer's `to` (string | Address | array of either) into
 * a single comma-joined string of plain email addresses, which is the
 * shape our `EmailProvider.send` expects.
 */
function flattenTo(to: SendEmailOptions['to']): string {
  if (!to) return ''
  if (typeof to === 'string') return to
  if (Array.isArray(to)) {
    return to
      .map((entry) =>
        typeof entry === 'string'
          ? entry
          : entry && 'address' in entry
          ? entry.address ?? ''
          : '',
      )
      .filter(Boolean)
      .join(', ')
  }
  if (typeof to === 'object' && 'address' in to) {
    return to.address ?? ''
  }
  return ''
}

function flattenFrom(from: SendEmailOptions['from']): string | undefined {
  if (!from) return undefined
  if (typeof from === 'string') return from
  if (typeof from === 'object' && 'address' in from) {
    return from.address ?? undefined
  }
  return undefined
}

export const copaiaEmailAdapter: EmailAdapter<{
  ok: boolean
  providerRef?: string
  error?: string
}> = () => ({
  name: 'copaia-bridge',
  defaultFromAddress: DEFAULT_FROM_ADDRESS,
  defaultFromName: DEFAULT_FROM_NAME,
  sendEmail: async (message) => {
    const provider = getEmailProvider()
    const to = flattenTo(message.to)
    const html =
      typeof message.html === 'string'
        ? message.html
        : (message.html as Buffer | undefined)?.toString?.() ?? ''
    const text =
      typeof message.text === 'string'
        ? message.text
        : (message.text as Buffer | undefined)?.toString?.() ?? undefined
    return provider.send({
      to,
      subject: message.subject ?? '',
      html,
      text,
      from: flattenFrom(message.from),
    })
  },
})
