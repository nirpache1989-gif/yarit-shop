/**
 * @file Products collection — the heart of the catalog
 * @summary Single collection holds BOTH Forever Living products and
 *          Yarit's independent natural products. The `type` field is a
 *          discriminator that controls:
 *
 *          - Which conditional fields appear in the admin
 *          - Whether stock is tracked (only `independent` has stock)
 *          - How orders are routed in the Fulfillment Dashboard (Phase E):
 *              * forever      → "awaiting_forever_purchase" queue
 *              * independent  → straight to "packed" if stock allows
 *
 *          NEVER add a product without setting `type`. The storefront,
 *          cart, checkout, and admin all branch on it.
 *
 *          Localized fields (title, descriptions, SEO) store he + en
 *          content separately. The Hebrew version is authoritative —
 *          English is a secondary mirror for international customers.
 *
 *          See: docs/ARCHITECTURE.md §Data Model, docs/FULFILLMENT.md,
 *               plan §6.
 */
import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: { en: 'Product', he: 'מוצר' },
    plural: { en: 'Products', he: 'מוצרים' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'price', 'category', 'status'],
    group: { en: 'Catalog', he: 'קטלוג' },
    description: {
      en: 'All products in the shop — both Forever Living and independent.',
      he: 'כל המוצרים בחנות — מוצרי Forever ומוצרים עצמאיים.',
    },
    listSearchableFields: ['title', 'sku', 'foreverProductCode'],
  },
  access: {
    read: () => true, // Public — storefront needs to list/show products.
  },
  fields: [
    // ─── Discriminator: drives ALL downstream behavior ────────────
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'forever',
      label: { en: 'Product type', he: 'סוג מוצר' },
      options: [
        {
          label: { en: 'Forever Living (drop-shipped)', he: 'Forever Living (הזמנה מפוראבר)' },
          value: 'forever',
        },
        {
          label: { en: 'Independent (in stock)', he: 'עצמאי (במלאי)' },
          value: 'independent',
        },
      ],
      admin: {
        position: 'sidebar',
        description: {
          en: 'Forever items are ordered from Forever per-order; independent items are stocked at home.',
          he: 'מוצרי Forever נרכשים מפוראבר עם כל הזמנה; מוצרים עצמאיים נמצאים במלאי בבית.',
        },
      },
    },

    // ─── Basic info (always shown) ────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { en: 'Title', he: 'שם המוצר' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: { en: 'Slug', he: 'מזהה כתובת' },
      admin: {
        position: 'sidebar',
        // Auto-generated via the beforeValidate hook below; hidden
        // from the form so Yarit doesn't have to think about URL slugs.
        hidden: true,
        description: {
          en: 'URL-safe identifier (auto-filled from title).',
          he: 'מזהה לכתובת האינטרנט. מתמלא לבד מהשם.',
        },
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value
            const titleField = (data as { title?: string | { en?: string; he?: string } })?.title
            const title =
              typeof titleField === 'string'
                ? titleField
                : titleField?.en ?? titleField?.he ?? ''
            if (!title) return value
            return title
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
          },
        ],
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      label: { en: 'Short description', he: 'תיאור קצר' },
      admin: {
        description: {
          en: 'One-line teaser shown on product cards.',
          he: 'משפט קצר המופיע על כרטיס המוצר.',
        },
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      label: { en: 'Full description', he: 'תיאור מלא' },
    },

    // ─── Pricing (always shown, ILS for everyone) ────────────────
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      label: { en: 'Price (₪)', he: 'מחיר (₪)' },
      admin: {
        description: {
          en: 'Retail price in Israeli Shekels, VAT included.',
          he: 'מחיר קמעונאי בשקלים, כולל מע״מ.',
        },
      },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      label: { en: 'Compare at price (₪)', he: 'מחיר לפני מבצע (₪)' },
      admin: {
        description: {
          en: 'Optional — shown as a strike-through for sale items.',
          he: 'אופציונלי — מוצג כמחיר מחוק למוצרי מבצע.',
        },
      },
    },

    // ─── Media ────────────────────────────────────────────────────
    {
      name: 'images',
      type: 'array',
      label: { en: 'Images', he: 'תמונות' },
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: { en: 'Image', he: 'תמונה' },
        },
      ],
      admin: {
        description: {
          en: 'First image is the main image shown on product cards.',
          he: 'התמונה הראשונה תופיע ככרטיס המוצר.',
        },
      },
    },

    // ─── Relationships ───────────────────────────────────────────
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: { en: 'Category', he: 'קטגוריה' },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: { en: 'Tags', he: 'תגיות' },
      admin: {
        position: 'sidebar',
      },
    },

    // ─── Flags ────────────────────────────────────────────────────
    {
      name: 'isFeatured',
      type: 'checkbox',
      label: { en: 'Featured on homepage', he: 'מוצג בעמוד הבית' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'isNew',
      type: 'checkbox',
      label: { en: 'Mark as new', he: 'מוצר חדש' },
      admin: { position: 'sidebar' },
    },

    // ─── Conditional: FOREVER products only ──────────────────────
    {
      name: 'foreverProductCode',
      type: 'text',
      label: { en: 'Forever product code', he: 'קוד מוצר Forever' },
      admin: {
        condition: (data) => data.type === 'forever',
        description: {
          en: 'The SKU/item code as it appears in Forever\u2019s catalog.',
          he: 'הקוד של המוצר כפי שמופיע בקטלוג של Forever.',
        },
      },
    },
    {
      name: 'foreverDistributorPrice',
      type: 'number',
      min: 0,
      label: { en: 'Your Forever cost (₪)', he: 'מחיר העלות מפוראבר (₪)' },
      admin: {
        condition: (data) => data.type === 'forever',
        description: {
          en: 'Your distributor price — for margin tracking only, not shown to customers.',
          he: 'מחיר הזכיין שלך — לצורך מעקב רווח בלבד, לא מוצג ללקוחות.',
        },
      },
    },

    // ─── Conditional: INDEPENDENT products only ──────────────────
    {
      name: 'sku',
      type: 'text',
      label: { en: 'SKU', he: 'מק״ט' },
      admin: {
        condition: (data) => data.type === 'independent',
      },
    },
    {
      name: 'stock',
      type: 'number',
      min: 0,
      defaultValue: 0,
      label: { en: 'Stock on hand', he: 'כמות במלאי' },
      admin: {
        condition: (data) => data.type === 'independent',
        description: {
          en: 'Number of units currently in your inventory.',
          he: 'כמות היחידות הנמצאות כרגע במלאי שלך.',
        },
      },
    },
    {
      name: 'weightGrams',
      type: 'number',
      min: 0,
      label: { en: 'Weight (grams)', he: 'משקל (גרם)' },
      admin: {
        condition: (data) => data.type === 'independent',
        description: {
          en: 'Used for shipping cost calculation.',
          he: 'משמש לחישוב עלות משלוח.',
        },
      },
    },

    // ─── Publishing + SEO ─────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      label: { en: 'Status', he: 'מצב' },
      options: [
        { label: { en: 'Draft', he: 'טיוטה' }, value: 'draft' },
        { label: { en: 'Published', he: 'פורסם' }, value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
