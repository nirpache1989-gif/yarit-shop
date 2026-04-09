/**
 * @file Mock email provider (dev only)
 * @summary Writes the email to the server console so we can verify
 *          content and layout during local development without sending
 *          real messages. Returns `ok: true` so the calling code can
 *          proceed as if the email was delivered.
 */
import type { EmailProvider, EmailMessage } from './provider'

export const mockEmailProvider: EmailProvider = {
  id: 'mock',

  async send(message: EmailMessage) {
    console.log('')
    console.log('📧 [mock email]')
    console.log('  to:      ', message.to)
    console.log('  from:    ', message.from ?? '<default>')
    console.log('  subject: ', message.subject)
    console.log('  html:')
    console.log(
      message.html
        .split('\n')
        .map((line) => '    ' + line)
        .join('\n'),
    )
    console.log('')
    return { ok: true, providerRef: `mock-${Date.now()}` }
  },
}
