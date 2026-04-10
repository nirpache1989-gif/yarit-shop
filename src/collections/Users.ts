/**
 * @file Users collection (Shoresh) — single auth collection
 * @summary One users collection serves BOTH the shop admin (Yarit) and
 *          customers. A `role` field distinguishes the two; admin panel
 *          access is gated on `role === 'admin'` via the `access.admin`
 *          function.
 *
 *          Customer-specific fields (phone, addresses, preferredLocale)
 *          are hidden from admin users via admin.condition, and admin
 *          users can freely ignore them. Conversely, customer users
 *          never see the admin panel at all (blocked by access control).
 *
 *          See: docs/ARCHITECTURE.md §Auth, plan §6.
 */
import type { CollectionConfig } from 'payload'

// Phase F.1 — Hebrew, customer-facing forgot-password email.
// Payload's default reset URL is `/admin/reset?token=...`, which dumps
// customers onto an admin login they have no business seeing. We
// override per-collection so the reset link points at the storefront
// page at `/reset-password/<token>` (next-intl prefixes English with
// `/en/` automatically; Hebrew is the default and prefix-less).
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { en: 'User', he: 'משתמש' },
    plural: { en: 'Users', he: 'משתמשים' },
  },
  auth: {
    forgotPassword: {
      generateEmailSubject: () => 'איפוס סיסמה — שורש',
      generateEmailHTML: (args) => {
        const token =
          args && typeof args === 'object' && 'token' in args
            ? String((args as { token?: string }).token ?? '')
            : ''
        const resetUrl = `${SITE_URL}/reset-password/${token}`
        return `
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>איפוס סיסמה — שורש</title>
  </head>
  <body style="font-family: -apple-system, system-ui, 'Segoe UI', sans-serif; background: #f6efdc; padding: 40px 16px; color: #2d2418;">
    <div style="max-width: 520px; margin: 0 auto; background: #fdf8e8; border: 1px solid #d8c79a; border-radius: 16px; padding: 32px;">
      <h1 style="margin: 0 0 12px; font-size: 24px; color: #2d4f3e;">איפוס סיסמה</h1>
      <p style="margin: 0 0 16px; line-height: 1.6;">היי,</p>
      <p style="margin: 0 0 16px; line-height: 1.6;">
        קיבלנו בקשה לאיפוס הסיסמה לחשבון שלך באתר שורש. לחצי על הכפתור למטה כדי להגדיר סיסמה חדשה.
      </p>
      <p style="margin: 24px 0; text-align: center;">
        <a href="${resetUrl}" style="display: inline-block; background: #2d4f3e; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 700;">
          איפוס סיסמה
        </a>
      </p>
      <p style="margin: 0 0 8px; font-size: 13px; color: #6b5e44;">
        אם הכפתור לא עובד, העתיקי את הקישור הבא לדפדפן:
      </p>
      <p style="margin: 0 0 16px; word-break: break-all; font-size: 12px; color: #6b5e44;">
        ${resetUrl}
      </p>
      <p style="margin: 24px 0 0; font-size: 13px; color: #6b5e44; line-height: 1.6;">
        אם לא ביקשת איפוס סיסמה, אפשר להתעלם מהמייל הזה — הסיסמה לא תשתנה.
      </p>
      <p style="margin: 16px 0 0; font-size: 13px; color: #6b5e44;">
        — שורש 🌿
      </p>
    </div>
  </body>
</html>`.trim()
      },
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'name'],
    group: { en: '👥 People', he: '👥 לקוחות' },
  },
  access: {
    // Only admins can see the user list in the admin panel.
    admin: ({ req: { user } }) => user?.role === 'admin',
    // Admins can see all users; customers can only see themselves.
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user) return { id: { equals: user.id } }
      return false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { en: 'Full name', he: 'שם מלא' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'customer',
      label: { en: 'Role', he: 'תפקיד' },
      options: [
        { label: { en: 'Admin', he: 'מנהל' }, value: 'admin' },
        { label: { en: 'Customer', he: 'לקוח' }, value: 'customer' },
      ],
      admin: {
        position: 'sidebar',
        description: {
          en: '"Admin" — full access to the admin panel. "Customer" — regular shopper account.',
          he: '"מנהל" — גישה מלאה לפאנל הניהול. "לקוח" — חשבון קונה רגיל.',
        },
      },
    },
    // === Customer-specific fields ===
    {
      name: 'phone',
      type: 'text',
      label: { en: 'Phone', he: 'טלפון' },
      admin: {
        condition: (data) => data.role === 'customer',
      },
    },
    {
      name: 'preferredLocale',
      type: 'select',
      defaultValue: 'he',
      label: { en: 'Preferred language', he: 'שפה מועדפת' },
      options: [
        { label: { en: 'Hebrew', he: 'עברית' }, value: 'he' },
        { label: { en: 'English', he: 'אנגלית' }, value: 'en' },
      ],
      admin: {
        condition: (data) => data.role === 'customer',
        description: {
          en: 'Used for order confirmation emails and site UI on login.',
          he: 'משמש עבור מיילי אישורי הזמנה וממשק האתר לאחר כניסה.',
        },
      },
    },
    {
      name: 'addresses',
      type: 'array',
      label: { en: 'Saved addresses', he: 'כתובות שמורות' },
      admin: {
        condition: (data) => data.role === 'customer',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: { en: 'Label', he: 'תווית' },
          admin: {
            description: {
              en: 'E.g. "Home", "Work".',
              he: 'לדוגמה: "בית", "עבודה".',
            },
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'recipientName',
              type: 'text',
              required: true,
              label: { en: 'Recipient name', he: 'שם הנמען' },
              admin: { width: '50%' },
            },
            {
              name: 'phone',
              type: 'text',
              required: true,
              label: { en: 'Phone', he: 'טלפון' },
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'street',
          type: 'text',
          required: true,
          label: { en: 'Street address', he: 'כתובת' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'city',
              type: 'text',
              required: true,
              label: { en: 'City', he: 'עיר' },
              admin: { width: '50%' },
            },
            {
              name: 'postalCode',
              type: 'text',
              label: { en: 'Postal code', he: 'מיקוד' },
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'country',
          type: 'select',
          required: true,
          defaultValue: 'IL',
          label: { en: 'Country', he: 'מדינה' },
          options: [
            { label: { en: 'Israel', he: 'ישראל' }, value: 'IL' },
            { label: { en: 'United States', he: 'ארצות הברית' }, value: 'US' },
            { label: { en: 'United Kingdom', he: 'בריטניה' }, value: 'GB' },
            { label: { en: 'European Union', he: 'האיחוד האירופי' }, value: 'EU' },
            { label: { en: 'Canada', he: 'קנדה' }, value: 'CA' },
            { label: { en: 'Australia', he: 'אוסטרליה' }, value: 'AU' },
            { label: { en: 'Other', he: 'אחר' }, value: 'OTHER' },
          ],
        },
      ],
    },
  ],
}
