/**
 * @file Resend email provider — IMPLEMENTATION STUB
 * @summary Placeholder for the Resend (https://resend.com) integration.
 *          Throws until:
 *            - RESEND_API_KEY is set
 *            - RESEND_FROM_EMAIL is set (verified sender)
 *          (see .env.example)
 *
 *          HOW TO FINISH:
 *          1. Sign up at https://resend.com (free tier: 100 emails/day)
 *          2. Verify a sender domain OR use their `onboarding@resend.dev`
 *             for testing
 *          3. `npm install resend`
 *          4. Replace the throw with:
 *             ```ts
 *             import { Resend } from 'resend'
 *             const client = new Resend(process.env.RESEND_API_KEY)
 *             const { data, error } = await client.emails.send({
 *               from: message.from ?? process.env.RESEND_FROM_EMAIL!,
 *               to: message.to,
 *               subject: message.subject,
 *               html: message.html,
 *               text: message.text,
 *             })
 *             if (error) return { ok: false, error: error.message }
 *             return { ok: true, providerRef: data?.id }
 *             ```
 *          5. Swap default: `EMAIL_PROVIDER=resend` in `.env.local`
 */
import type { EmailProvider, EmailMessage } from './provider'

const NOT_IMPLEMENTED =
  'Resend provider is not yet implemented. Set EMAIL_PROVIDER=mock in .env.local, or finish src/lib/email/resend.ts once you have a Resend API key.'

export const resendEmailProvider: EmailProvider = {
  id: 'resend',

  async send(_message: EmailMessage) {
    throw new Error(NOT_IMPLEMENTED)
  },
}
