/**
 * @file Resend email provider
 * @summary Real implementation. Wraps the `resend` npm SDK in our
 *          `EmailProvider` interface so checkout confirmations, admin
 *          new-order alerts, and Payload auth emails (forgot-password,
 *          password-reset) all flow through one provider.
 *
 *          PASTE-IN-READY CONFIG
 *          ---------------------
 *          To switch from the mock provider to real Resend, set these
 *          three env vars in `.env.local` (dev) or the Vercel project
 *          settings (prod):
 *
 *              EMAIL_PROVIDER=resend
 *              RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
 *              EMAIL_FROM=shop@yourdomain.co.il
 *
 *          Optional:
 *              EMAIL_FROM_NAME=שורש
 *
 *          Once all three are set and the dev server is restarted,
 *          every `getEmailProvider().send(...)` call goes to Resend
 *          instead of the console-log mock. No other code changes
 *          required.
 *
 *          SENDER DOMAIN
 *          -------------
 *          Resend requires the FROM address to live on a domain you
 *          have verified in their dashboard (adding DKIM/SPF records
 *          to your DNS). For a quick smoke test you can use
 *          `onboarding@resend.dev` as a temporary FROM — Resend lets
 *          you send to your own inbox from that address without a
 *          verified domain.
 *
 *          FAILURE MODES
 *          -------------
 *          - No API key when called → returns `{ ok: false, error }`
 *            with a clear message. The caller (checkout, Payload's
 *            auth pipeline) gets a soft-fail and the underlying flow
 *            still completes. Order confirmation emails are
 *            non-fatal; Payload auth emails would surface the error
 *            to the user.
 *          - Resend API returns an error → same shape, Resend's
 *            error message is preserved.
 */
import { Resend } from 'resend'
import type { EmailProvider, EmailMessage } from './provider'

// Cached client so we don't re-instantiate on every send. The SDK is
// cheap but the cache avoids reading process.env on every call.
let cachedClient: Resend | null = null
let cachedKey: string | null = null

function getClient(apiKey: string): Resend {
  if (cachedClient && cachedKey === apiKey) return cachedClient
  cachedClient = new Resend(apiKey)
  cachedKey = apiKey
  return cachedClient
}

function resolveFrom(message: EmailMessage): string | null {
  // Explicit per-message override wins.
  if (message.from && message.from.trim().length > 0) {
    return message.from.trim()
  }
  const envFrom = process.env.EMAIL_FROM
  if (envFrom && envFrom.trim().length > 0) {
    const name = process.env.EMAIL_FROM_NAME?.trim()
    return name ? `${name} <${envFrom.trim()}>` : envFrom.trim()
  }
  return null
}

export const resendEmailProvider: EmailProvider = {
  id: 'resend',

  async send(message: EmailMessage) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey || apiKey.length < 10) {
      return {
        ok: false,
        error:
          'RESEND_API_KEY is not set. Add it to .env.local (dev) or Vercel env (prod), or set EMAIL_PROVIDER=mock to fall back.',
      }
    }

    const from = resolveFrom(message)
    if (!from) {
      return {
        ok: false,
        error:
          'No FROM address configured. Set EMAIL_FROM in the environment, or pass `from` on the EmailMessage.',
      }
    }

    try {
      const client = getClient(apiKey)
      const { data, error } = await client.emails.send({
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text ?? '',
      })
      if (error) {
        return {
          ok: false,
          error: `Resend: ${error.message ?? String(error)}`,
        }
      }
      return {
        ok: true,
        providerRef: data?.id,
      }
    } catch (err) {
      return {
        ok: false,
        error:
          'Resend: ' + (err instanceof Error ? err.message : String(err)),
      }
    }
  },
}
