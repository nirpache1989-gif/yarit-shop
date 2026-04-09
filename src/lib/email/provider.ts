/**
 * @file EmailProvider abstract interface
 * @summary Same pattern as PaymentProvider — every email backend
 *          (Resend, SES, a console logger for dev) implements this
 *          interface and the rest of the codebase imports only the
 *          interface.
 */
export type EmailMessage = {
  to: string
  subject: string
  html: string
  text?: string // plain-text fallback
  from?: string // override sender per-message if needed
}

export interface EmailProvider {
  readonly id: string
  send(message: EmailMessage): Promise<{ ok: boolean; providerRef?: string; error?: string }>
}
