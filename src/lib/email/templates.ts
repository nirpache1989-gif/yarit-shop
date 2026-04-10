/**
 * @file Email HTML templates
 * @summary Generates the HTML body for each transactional email.
 *          Kept as inline HTML strings (no React Email) to keep the
 *          bundle lean — this is the simplest thing that works and
 *          looks decent in every email client.
 *
 *          All templates accept bilingual content and pick the right
 *          language based on the customer's locale.
 */
import { brand } from '@/brand.config'

type OrderConfirmationData = {
  locale: 'he' | 'en'
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{
    title: string
    quantity: number
    price: number
  }>
  subtotal: number
  shippingCost: number
  total: number
  shippingAddress: {
    recipientName: string
    street: string
    city: string
    country: string
  }
  siteUrl: string
  /** True when this order created a brand-new user (first-time
   *  customer). Drives the "set your password" onboarding block. */
  isNewCustomer: boolean
}

const T = {
  he: {
    greeting: 'היי',
    thanksPrefix: 'תודה על ההזמנה ב-',
    orderNumber: 'מספר הזמנה',
    orderSummary: 'פירוט הזמנה',
    subtotal: 'סכום ביניים',
    shipping: 'משלוח',
    total: 'סה״כ',
    shippingTo: 'כתובת למשלוח',
    whatsNext: 'מה קורה עכשיו?',
    whatsNextBody:
      'ההזמנה שלך התקבלה ונמצאת בטיפול. תקבל עדכון נוסף כשההזמנה תישלח.',
    questions: 'שאלות?',
    questionsBody: 'אני כאן בשבילך — פשוט תענה/י למייל הזה ואחזור אלייך.',
    footer: 'תודה שבחרת ב-{brand} 🌿',
    dir: 'rtl',
    claimAccountHeading: 'יצרנו לך חשבון — מתי שתרצי',
    claimAccountBody:
      'יצרנו חשבון אישי עם האימייל שהזנת כדי שתוכלי לראות את ההזמנות שלך בכל פעם שתרצי. לחצי על הכפתור כדי להגדיר סיסמה ולהיכנס לחשבון.',
    claimAccountCta: 'הגדרת סיסמה לחשבון שלי',
  },
  en: {
    greeting: 'Hi',
    thanksPrefix: 'Thanks for your order at ',
    orderNumber: 'Order number',
    orderSummary: 'Order summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    shippingTo: 'Shipping to',
    whatsNext: "What's next?",
    whatsNextBody:
      'Your order has been received and is being prepared. You will get another email when the order ships.',
    questions: 'Questions?',
    questionsBody: "I'm here to help — just reply to this email and I'll get back to you.",
    footer: 'Thank you for choosing {brand} 🌿',
    dir: 'ltr',
    claimAccountHeading: "We've created your account — whenever you're ready",
    claimAccountBody:
      "We set up a personal account with the email you entered so you can see your orders anytime. Click the button to set a password and sign in.",
    claimAccountCta: 'Set my account password',
  },
} as const

function formatILS(amount: number): string {
  return `₪${amount.toLocaleString('en-IL', { maximumFractionDigits: 0 })}`
}

export function renderOrderConfirmationEmail(
  data: OrderConfirmationData,
): { subject: string; html: string; text: string } {
  const t = T[data.locale]
  const brandName = data.locale === 'he' ? brand.name.he : brand.name.en
  const primary = brand.colors.primary
  const primaryDark = brand.colors.primaryDark
  const bg = brand.colors.background
  const surface = brand.colors.surface
  const muted = brand.colors.muted
  const border = brand.colors.border

  // Build the "claim your account" link. The /forgot-password page
  // accepts an ?email=... query param and prefills the input so the
  // customer just clicks "send reset link" without retyping.
  const localePrefix = data.locale === 'he' ? '' : '/en'
  const claimUrl = `${data.siteUrl.replace(/\/+$/, '')}${localePrefix}/forgot-password?email=${encodeURIComponent(data.customerEmail)}`

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${border};">
          <div style="font-weight: 600; color: ${primaryDark};">${escapeHtml(item.title)}</div>
          <div style="font-size: 13px; color: ${muted};">× ${item.quantity}</div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid ${border}; text-align: ${data.locale === 'he' ? 'left' : 'right'}; font-weight: 700; color: ${primaryDark};">
          ${formatILS(item.price * item.quantity)}
        </td>
      </tr>`,
    )
    .join('')

  const html = `<!doctype html>
<html dir="${t.dir}" lang="${data.locale}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(brandName)} — ${t.orderNumber} ${escapeHtml(data.orderNumber)}</title>
</head>
<body style="margin: 0; padding: 0; background: ${bg}; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color: #2a2a2a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; background: ${surface}; border-radius: 16px; border: 1px solid ${border}; overflow: hidden;">
          <!-- header -->
          <tr>
            <td style="padding: 28px 32px; background: ${bg}; border-bottom: 1px solid ${border};">
              <div style="font-size: 24px; font-weight: 800; color: ${primaryDark};">${escapeHtml(brandName)}</div>
            </td>
          </tr>
          <!-- greeting -->
          <tr>
            <td style="padding: 32px 32px 8px 32px;">
              <h1 style="margin: 0 0 8px 0; font-size: 22px; color: ${primaryDark};">
                ${t.greeting} ${escapeHtml(data.customerName)},
              </h1>
              <p style="margin: 0; font-size: 15px; color: ${muted};">
                ${t.thanksPrefix}${escapeHtml(brandName)}.
              </p>
              <p style="margin: 12px 0 0 0; font-size: 14px; color: ${muted};">
                ${t.orderNumber}: <strong style="color: ${primaryDark};">${escapeHtml(data.orderNumber)}</strong>
              </p>
            </td>
          </tr>
          <!-- order summary -->
          <tr>
            <td style="padding: 16px 32px;">
              <h2 style="margin: 16px 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: ${muted};">${t.orderSummary}</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                ${itemsRows}
                <tr>
                  <td style="padding: 12px 0 4px 0; color: ${muted};">${t.subtotal}</td>
                  <td style="padding: 12px 0 4px 0; text-align: ${data.locale === 'he' ? 'left' : 'right'}; color: ${primaryDark};">${formatILS(data.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: ${muted};">${t.shipping}</td>
                  <td style="padding: 4px 0; text-align: ${data.locale === 'he' ? 'left' : 'right'}; color: ${primaryDark};">${formatILS(data.shippingCost)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0 4px 0; border-top: 2px solid ${border}; font-weight: 700; color: ${primaryDark}; font-size: 16px;">${t.total}</td>
                  <td style="padding: 8px 0 4px 0; border-top: 2px solid ${border}; text-align: ${data.locale === 'he' ? 'left' : 'right'}; font-weight: 800; color: ${primary}; font-size: 20px;">${formatILS(data.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- shipping -->
          <tr>
            <td style="padding: 16px 32px 8px 32px;">
              <h2 style="margin: 16px 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: ${muted};">${t.shippingTo}</h2>
              <div style="font-size: 14px; color: ${primaryDark}; line-height: 1.6;">
                ${escapeHtml(data.shippingAddress.recipientName)}<br>
                ${escapeHtml(data.shippingAddress.street)}<br>
                ${escapeHtml(data.shippingAddress.city)}<br>
                ${escapeHtml(data.shippingAddress.country)}
              </div>
            </td>
          </tr>
          <!-- what's next -->
          <tr>
            <td style="padding: 16px 32px;">
              <h2 style="margin: 16px 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: ${muted};">${t.whatsNext}</h2>
              <p style="margin: 0; font-size: 14px; color: #2a2a2a; line-height: 1.6;">${t.whatsNextBody}</p>
            </td>
          </tr>
          ${
            data.isNewCustomer
              ? `
          <!-- claim your account (first-time customer only) -->
          <tr>
            <td style="padding: 16px 32px;">
              <div style="border: 1px solid ${border}; border-radius: 12px; padding: 20px; background: ${bg};">
                <h2 style="margin: 0 0 8px 0; font-size: 16px; color: ${primaryDark};">${t.claimAccountHeading}</h2>
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #2a2a2a; line-height: 1.6;">${t.claimAccountBody}</p>
                <a href="${escapeHtml(claimUrl)}" style="display: inline-block; background: ${primary}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-weight: 700; font-size: 14px;">${t.claimAccountCta}</a>
              </div>
            </td>
          </tr>`
              : ''
          }
          <!-- questions -->
          <tr>
            <td style="padding: 8px 32px 32px 32px;">
              <h2 style="margin: 16px 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: ${muted};">${t.questions}</h2>
              <p style="margin: 0; font-size: 14px; color: #2a2a2a; line-height: 1.6;">${t.questionsBody}</p>
            </td>
          </tr>
          <!-- footer -->
          <tr>
            <td style="padding: 20px 32px; background: ${bg}; border-top: 1px solid ${border}; text-align: center; font-size: 13px; color: ${muted};">
              ${t.footer.replace('{brand}', escapeHtml(brandName))}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = [
    `${t.greeting} ${data.customerName},`,
    '',
    `${t.thanksPrefix}${brandName}.`,
    `${t.orderNumber}: ${data.orderNumber}`,
    '',
    t.orderSummary,
    ...data.items.map(
      (i) => `  ${i.title} × ${i.quantity}  ${formatILS(i.price * i.quantity)}`,
    ),
    `  ${t.subtotal}: ${formatILS(data.subtotal)}`,
    `  ${t.shipping}: ${formatILS(data.shippingCost)}`,
    `  ${t.total}: ${formatILS(data.total)}`,
    '',
    t.shippingTo,
    `  ${data.shippingAddress.recipientName}`,
    `  ${data.shippingAddress.street}`,
    `  ${data.shippingAddress.city}, ${data.shippingAddress.country}`,
    '',
    t.whatsNext,
    `  ${t.whatsNextBody}`,
    '',
    ...(data.isNewCustomer
      ? [
          t.claimAccountHeading,
          `  ${t.claimAccountBody}`,
          `  ${claimUrl}`,
          '',
        ]
      : []),
    t.footer.replace('{brand}', brandName),
  ].join('\n')

  return {
    subject: `${brandName} — ${t.orderNumber} ${data.orderNumber}`,
    html,
    text,
  }
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
