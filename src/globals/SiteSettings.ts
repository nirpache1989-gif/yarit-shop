/**
 * @file SiteSettings global — shop-wide configuration
 * @summary Single global record holding the shop's identity: logo,
 *          announcement bar, contact info, social links, shipping
 *          rates, and Forever distributor metadata.
 *
 *          Editable by Yarit from the admin sidebar under "Settings".
 *          All storefront surfaces (Header, Footer, Contact page,
 *          checkout shipping logic) read from this global.
 *
 *          Shipping rates are designed for BOTH Israeli and
 *          international orders — the rates array can hold multiple
 *          entries, each keyed by a `region` select.
 *
 *          See: docs/ARCHITECTURE.md §Globals, plan §6.
 */
import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { en: 'Site settings', he: 'הגדרות אתר' },
  admin: {
    group: { en: 'Content', he: 'תוכן' },
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // ─── Brand ────────────────────────────────────────────────────
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Logo', he: 'לוגו' },
      admin: {
        description: {
          en: 'Primary site logo — used in header and emails.',
          he: 'לוגו ראשי — משמש בכותרת האתר ובמיילים.',
        },
      },
    },
    {
      name: 'heroImages',
      type: 'array',
      label: { en: 'Hero images', he: 'תמונות הירו' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'announcementBar',
      type: 'text',
      localized: true,
      label: { en: 'Announcement bar text', he: 'טקסט שורת ההודעות' },
      admin: {
        description: {
          en: 'Optional — shown as a thin banner at the top of every page. Leave empty to hide.',
          he: 'אופציונלי — מוצג כשורת הודעה דקה בראש כל עמוד. השאר ריק כדי להסתיר.',
        },
      },
    },

    // ─── Contact info ─────────────────────────────────────────────
    {
      name: 'contact',
      type: 'group',
      label: { en: 'Contact', he: 'פרטי קשר' },
      fields: [
        {
          name: 'whatsapp',
          type: 'text',
          label: { en: 'WhatsApp number (E.164)', he: 'מספר וואטסאפ (פורמט בינלאומי)' },
          admin: {
            description: {
              en: 'E.g. 972501234567 — no plus sign, no spaces.',
              he: 'לדוגמה: 972501234567 — ללא סימן פלוס, ללא רווחים.',
            },
          },
        },
        {
          name: 'email',
          type: 'email',
          label: { en: 'Public email', he: 'מייל ציבורי' },
        },
        {
          name: 'phone',
          type: 'text',
          label: { en: 'Phone', he: 'טלפון' },
        },
        {
          name: 'address',
          type: 'textarea',
          label: { en: 'Business address', he: 'כתובת העסק' },
        },
        {
          name: 'businessTaxId',
          type: 'text',
          label: { en: 'Business tax ID (ח״פ / ע״מ)', he: 'ח״פ / ע״מ' },
          admin: {
            description: {
              en: 'Required for invoices and receipts.',
              he: 'נדרש עבור חשבוניות וקבלות.',
            },
          },
        },
      ],
    },

    // ─── Social ───────────────────────────────────────────────────
    {
      name: 'social',
      type: 'group',
      label: { en: 'Social links', he: 'קישורים חברתיים' },
      fields: [
        {
          name: 'instagram',
          type: 'text',
          label: { en: 'Instagram URL', he: 'קישור אינסטגרם' },
        },
        {
          name: 'facebook',
          type: 'text',
          label: { en: 'Facebook URL', he: 'קישור פייסבוק' },
        },
        {
          name: 'tiktok',
          type: 'text',
          label: { en: 'TikTok URL', he: 'קישור טיקטוק' },
        },
      ],
    },

    // ─── Shipping (Israel + international) ───────────────────────
    {
      name: 'shipping',
      type: 'group',
      label: { en: 'Shipping', he: 'משלוחים' },
      fields: [
        {
          name: 'freeShippingThreshold',
          type: 'number',
          min: 0,
          label: { en: 'Free shipping above (₪)', he: 'משלוח חינם מעל (₪)' },
          admin: {
            description: {
              en: 'Orders above this amount ship free within Israel. 0 disables free shipping.',
              he: 'הזמנות מעל סכום זה מקבלות משלוח חינם בארץ. הכנס 0 כדי לבטל.',
            },
          },
        },
        {
          name: 'rates',
          type: 'array',
          label: { en: 'Shipping rates', he: 'תעריפי משלוח' },
          fields: [
            {
              name: 'region',
              type: 'select',
              required: true,
              label: { en: 'Region', he: 'אזור' },
              options: [
                { label: { en: 'Israel', he: 'ישראל' }, value: 'IL' },
                { label: { en: 'Europe', he: 'אירופה' }, value: 'EU' },
                { label: { en: 'North America', he: 'צפון אמריקה' }, value: 'NA' },
                { label: { en: 'Rest of world', he: 'שאר העולם' }, value: 'ROW' },
              ],
            },
            {
              name: 'name',
              type: 'text',
              localized: true,
              required: true,
              label: { en: 'Display name', he: 'שם לתצוגה' },
              admin: {
                description: {
                  en: 'E.g. "Standard shipping (3–5 business days)".',
                  he: 'לדוגמה: "משלוח רגיל (3–5 ימי עסקים)".',
                },
              },
            },
            {
              name: 'price',
              type: 'number',
              required: true,
              min: 0,
              label: { en: 'Price (₪)', he: 'מחיר (₪)' },
            },
          ],
        },
      ],
    },

    // ─── Forever distributor metadata ─────────────────────────────
    {
      name: 'forever',
      type: 'group',
      label: { en: 'Forever Living', he: 'Forever Living' },
      fields: [
        {
          name: 'distributorName',
          type: 'text',
          label: { en: 'Distributor name', he: 'שם הזכיין' },
        },
        {
          name: 'distributorId',
          type: 'text',
          label: { en: 'Distributor ID', he: 'מספר זכיין' },
          admin: {
            description: {
              en: 'Yarit\u2019s Forever Living distributor number.',
              he: 'מספר הזכיינית של ירית ב-Forever Living.',
            },
          },
        },
      ],
    },
  ],
}
