/**
 * @file Admin-facing email templates
 * @summary Templates for emails sent TO the shop owner (Yarit) rather
 *          than to customers. Currently: new-order alert.
 *
 *          These templates are intentionally plainer than the
 *          customer-facing ones — they're a functional notification,
 *          not marketing.
 */
import { brand } from '@/brand.config'

type NewOrderAlertData = {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: Array<{
    title: string
    quantity: number
    type: 'forever' | 'independent'
  }>
  total: number
  hasForever: boolean
  siteUrl: string
  shippingCity: string
  shippingCountry: string
}

export function renderNewOrderAlertEmail(data: NewOrderAlertData): {
  subject: string
  html: string
  text: string
} {
  const primaryDark = brand.colors.primaryDark
  const accent = brand.colors.accentDeep
  const muted = brand.colors.muted
  const border = brand.colors.border
  const bg = brand.colors.background
  const surface = brand.colors.surface

  const foreverFlag = data.hasForever
    ? `<div style="margin-top:16px;padding:12px 16px;background:${accent}15;border:1px solid ${accent}40;border-radius:12px;color:${accent};font-size:14px;font-weight:600;">
         ⚠️ זה כולל פריטים של Forever — תצטרכי להזמין מפוראבר לפני האריזה.
       </div>`
    : ''

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;color:${primaryDark};font-size:14px;">
          ${escapeHtml(item.title)}
          ${item.type === 'forever' ? `<span style="color:${accent};font-size:12px;font-weight:600;"> [Forever]</span>` : ''}
        </td>
        <td style="padding:8px 0;color:${muted};text-align:left;font-size:14px;">× ${item.quantity}</td>
      </tr>`,
    )
    .join('')

  const dashboardUrl = `${data.siteUrl}/admin/fulfillment`

  const html = `<!doctype html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><title>הזמנה חדשה — ${escapeHtml(data.orderNumber)}</title></head>
<body style="margin:0;padding:0;background:${bg};font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#2a2a2a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:${surface};border-radius:16px;border:1px solid ${border};overflow:hidden;">
        <tr><td style="padding:24px 32px;background:${bg};border-bottom:1px solid ${border};">
          <div style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:${muted};">שורש — התראה</div>
          <div style="font-size:22px;font-weight:800;color:${primaryDark};margin-top:4px;">הזמנה חדשה 🌿</div>
        </td></tr>
        <tr><td style="padding:24px 32px 8px 32px;">
          <p style="margin:0;font-size:15px;color:${muted};">התקבלה הזמנה חדשה שסומנה כשולמה. להלן הפרטים:</p>
          <p style="margin:16px 0 0 0;font-size:15px;color:${primaryDark};">
            מספר הזמנה: <strong>${escapeHtml(data.orderNumber)}</strong>
          </p>
          ${foreverFlag}
        </td></tr>
        <tr><td style="padding:16px 32px;">
          <h2 style="margin:16px 0 8px 0;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:${muted};">פרטי לקוח</h2>
          <div style="font-size:14px;color:${primaryDark};line-height:1.7;">
            ${escapeHtml(data.customerName)}<br>
            <a href="mailto:${encodeURIComponent(data.customerEmail)}" style="color:${primaryDark};">${escapeHtml(data.customerEmail)}</a><br>
            <a href="tel:${encodeURIComponent(data.customerPhone)}" style="color:${primaryDark};">${escapeHtml(data.customerPhone)}</a><br>
            ${escapeHtml(data.shippingCity)}, ${escapeHtml(data.shippingCountry)}
          </div>
        </td></tr>
        <tr><td style="padding:16px 32px;">
          <h2 style="margin:16px 0 8px 0;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:${muted};">פריטים</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${itemsRows}</table>
          <div style="margin-top:12px;padding-top:12px;border-top:2px solid ${border};display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:${primaryDark};">
            <span>סה״כ</span><span>₪${data.total.toLocaleString()}</span>
          </div>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <a href="${dashboardUrl}" style="display:inline-block;padding:14px 24px;background:${primaryDark};color:white;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
            לטיפול בהזמנה →
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = [
    `שורש — הזמנה חדשה`,
    ``,
    `מספר הזמנה: ${data.orderNumber}`,
    `לקוח: ${data.customerName}`,
    `אימייל: ${data.customerEmail}`,
    `טלפון: ${data.customerPhone}`,
    ``,
    `פריטים:`,
    ...data.items.map(
      (i) =>
        `  - ${i.title}${i.type === 'forever' ? ' [Forever]' : ''} × ${i.quantity}`,
    ),
    `סה״כ: ₪${data.total}`,
    ``,
    data.hasForever
      ? '⚠️ כולל פריטי Forever — להזמין מפוראבר לפני האריזה'
      : '',
    ``,
    `לוח הניהול: ${dashboardUrl}`,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    subject: `🌿 הזמנה חדשה ${data.orderNumber} — ₪${data.total}`,
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
