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
    group: { en: '🌿 Settings', he: '🌿 הגדרות' },
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
      label: { en: 'Hero images', he: 'תמונות באנר ראשי' },
      admin: {
        description: {
          en: 'Large images at the top of the homepage. At least one required.',
          he: 'התמונות הגדולות שבראש עמוד הבית. תמונה אחת לפחות.',
        },
      },
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
          admin: {
            description: {
              en: 'Used in the footer + as the recipient for new-order alerts.',
              he: 'מופיע ב-footer של האתר וגם המייל שאליו יישלחו ההתראות על הזמנות חדשות.',
            },
          },
        },
        {
          name: 'phone',
          type: 'text',
          label: { en: 'Phone', he: 'טלפון' },
          admin: {
            description: {
              en: 'Shown in the footer and contact page.',
              he: 'מופיע ב-footer ובדף "צור קשר".',
            },
          },
        },
        {
          name: 'address',
          type: 'textarea',
          label: { en: 'Business address', he: 'כתובת העסק' },
          admin: {
            description: {
              en: 'Shown on the contact page only.',
              he: 'מופיע בדף "צור קשר".',
            },
          },
        },
        {
          name: 'businessTaxId',
          type: 'text',
          label: {
            en: 'Business tax ID (ח״פ / ע״מ)',
            he: 'מספר עוסק (ח״פ או ע״מ)',
          },
          admin: {
            description: {
              en: 'Your business number — company (ח״פ) or sole trader (ע״מ). Shown on invoices and receipts.',
              he: 'המספר של העסק שלך — חברה (ח״פ) או עוסק מורשה/פטור (ע״מ). מופיע על חשבוניות וקבלות.',
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
      admin: {
        description: {
          en: 'Optional — these links appear as icons in the footer. Leave any field empty to hide the icon.',
          he: 'אופציונלי — הקישורים מופיעים כאייקונים ב-footer של האתר. השאירי שדה ריק כדי להסתיר את האייקון שלו.',
        },
      },
      fields: [
        {
          name: 'instagram',
          type: 'text',
          label: { en: 'Instagram URL', he: 'קישור אינסטגרם' },
          admin: {
            description: {
              en: 'Full URL, e.g. https://instagram.com/yarit',
              he: 'הקישור המלא, לדוגמה: https://instagram.com/yarit',
            },
          },
        },
        {
          name: 'facebook',
          type: 'text',
          label: { en: 'Facebook URL', he: 'קישור פייסבוק' },
          admin: {
            description: {
              en: 'Full URL, e.g. https://facebook.com/yarit',
              he: 'הקישור המלא, לדוגמה: https://facebook.com/yarit',
            },
          },
        },
        {
          name: 'tiktok',
          type: 'text',
          label: { en: 'TikTok URL', he: 'קישור טיקטוק' },
          admin: {
            description: {
              en: 'Full URL, e.g. https://tiktok.com/@yarit',
              he: 'הקישור המלא, לדוגמה: https://tiktok.com/@yarit',
            },
          },
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
