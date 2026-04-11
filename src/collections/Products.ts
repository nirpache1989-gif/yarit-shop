/**
 * @file Products collection — the heart of the catalog
 * @summary Single collection holds every product in the shop. The
 *          `type` field is a discriminator between items Yarit stocks
 *          at home (`stocked`) and items she orders from a supplier
 *          per-customer-order (`sourced`). It controls:
 *
 *          - Whether stock is tracked (only `stocked` has stock)
 *          - Which help text shows in the admin for stock-related fields
 *          - How the storefront renders the out-of-stock state
 *
 *          Orders do NOT branch on this field anymore. Every paid order
 *          flows through the same 3-step fulfillment pipeline
 *          (`packed → shipped → delivered`). The supplier-vs-stock
 *          distinction is a product-level concern, not an order-level
 *          workflow — when Yarit sees an order, she looks at the line
 *          item titles and knows which ones need sourcing without the
 *          system telling her.
 *
 *          See: docs/DECISIONS.md ADR-019 (2026-04-11, Remove Forever
 *          terminology + collapse fulfillment workflow).
 *
 *          Localized fields (title, descriptions, SEO) store he + en
 *          content separately. The Hebrew version is authoritative —
 *          English is a secondary mirror for international customers.
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
    // 2026-04-11 Track B.1 — `images` column renders a tiny
    // thumbnail via `ProductThumbnailCell` so Yarit can visually
    // scan the catalog from the list view without clicking into
    // each product.
    defaultColumns: ['images', 'title', 'type', 'price', 'category', 'status'],
    group: { en: '📦 Catalog', he: '📦 קטלוג' },
    description: {
      en: 'All products in the shop.',
      he: 'כאן נמצאים כל המוצרים בחנות. לחצי על מוצר כדי לערוך אותו, או על "צרי חדש" כדי להוסיף מוצר חדש לחנות.',
    },
    listSearchableFields: ['title', 'sku'],
    // 2026-04-11 Track B.4 — Payload's built-in Live Preview button
    // on the Products edit form. Opens an iframe with the current
    // storefront URL for the product, letting Yarit eyeball the real
    // product page while she edits without juggling tabs. The URL
    // callback reads the slug from the current form data and returns
    // a locale-prefixed URL (Hebrew is the default locale so /product
    // is unprefixed; English gets /en/product).
    livePreview: {
      url: ({ data, locale }) => {
        const slug =
          (data as { slug?: string })?.slug ??
          ((data as { id?: number | string })?.id
            ? String((data as { id?: number | string }).id)
            : '')
        if (!slug) return '/'
        const base =
          process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ??
          'http://localhost:3000'
        const localePrefix =
          locale && locale.code && locale.code !== 'he'
            ? `/${locale.code}`
            : ''
        return `${base}${localePrefix}/product/${slug}`
      },
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 812 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  access: {
    read: () => true, // Public — storefront needs to list/show products.
  },
  fields: [
    // ─── Discriminator: drives stock-tracking behavior ────────────
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'stocked',
      label: { en: 'Product type', he: 'סוג מוצר' },
      options: [
        {
          label: { en: 'In stock at home', he: 'קיים במלאי' },
          value: 'stocked',
        },
        {
          label: { en: 'Ordered from supplier on demand', he: 'לפי הזמנה מהספק' },
          value: 'sourced',
        },
      ],
      admin: {
        position: 'sidebar',
        description: {
          en: '"In stock" — the product is on your shelf; keep the stock field up to date. "Ordered on demand" — you order it from your supplier only when a customer buys, so stock tracking is skipped. You can change this at any time.',
          he: 'קיים במלאי — המוצר שוכב אצלך בבית, חשוב לעדכן את שדה "מלאי". • לפי הזמנה מהספק — את מזמינה את המוצר מהספק רק כשיש הזמנה מלקוח, אין צורך לעדכן מלאי. • אפשר לשנות בכל עת בין שני המצבים.',
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
      admin: {
        description: {
          en: 'Shown on the product card and detail page in the storefront.',
          he: 'השם שיופיע על כרטיס המוצר ובדף המוצר באתר. למשל: "ג׳ל אלוורה רכה".',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: { en: 'Slug', he: 'כתובת באתר' },
      admin: {
        position: 'sidebar',
        // Auto-generated via the beforeValidate hook below; hidden
        // from the form so Yarit doesn't have to think about URL slugs.
        hidden: true,
        description: {
          en: 'URL-safe identifier (auto-filled from title).',
          he: 'הכתובת באינטרנט של דף המוצר. נוצרת אוטומטית לפי שם המוצר — אין צורך לגעת.',
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
      admin: {
        description: {
          en: 'The long description shown on the product page in the storefront. Cover the benefits, ingredients, and how to use it.',
          he: 'התיאור הארוך שמופיע בדף המוצר באתר. כתבי כאן את כל מה שחשוב — תועלות, מרכיבים, איך להשתמש. אפשר להשתמש בכפתורים שמעל כדי להדגיש, להוסיף כותרת, או רשימה.',
        },
      },
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
          he: 'המחיר לפני המבצע. אם תכניסי כאן ערך, באתר יופיע מחיר מחוק לידו.',
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
          admin: {
            description: {
              en: 'Drag a file in or click to choose from your device. JPG/PNG up to 10MB.',
              he: 'גררי תמונה לכאן או לחצי לבחור מהמחשב/הטלפון. JPG או PNG עד 10MB.',
            },
          },
        },
      ],
      admin: {
        description: {
          en: 'First image is the main one shown on product cards. Add more for the gallery on the product page.',
          he: 'התמונה הראשונה תופיע ככרטיס המוצר באתר. אפשר להוסיף עוד תמונות עם "Add Image" — כולן יוצגו בגלריה בדף המוצר.',
        },
        // 2026-04-11 Track B.1 — custom list-view cell rendering a
        // 48px thumbnail of the first image. See
        // src/components/admin/payload/ProductThumbnailCell.tsx for
        // the fallback behavior when a product has no images yet.
        components: {
          Cell: {
            path: '@/components/admin/payload/ProductThumbnailCell#ProductThumbnailCell',
          },
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
        description: {
          en: 'Pick the category customers can browse to find this product.',
          he: 'באיזו קטגוריה הקונים ימצאו את המוצר באתר. בחרי אחת מהרשימה.',
        },
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
        // Round 5: hidden from the product edit form because no
        // storefront surface queries `product.tags`. Kept in the
        // schema so the Tags collection relationship stays intact.
        // See: docs/ADMIN-SURFACES.md + Round 5 plan Fix 2.1.
        hidden: true,
        description: {
          en: 'Optional — tags help with filtering. You can pick more than one or leave it empty.',
          he: 'אופציונלי — תגיות מסייעות לסינון באתר. אפשר לבחור כמה תגיות או להשאיר ריק.',
        },
      },
    },

    // ─── Flags ────────────────────────────────────────────────────
    {
      name: 'isFeatured',
      type: 'checkbox',
      label: { en: 'Featured on homepage', he: 'מוצג בעמוד הבית' },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Show in the "Hand-picked" carousel on the homepage.',
          he: 'אם מסומן, המוצר יופיע בקרוסלת "מוצרים נבחרים" בעמוד הבית.',
        },
      },
    },
    {
      name: 'isNew',
      type: 'checkbox',
      label: { en: 'Mark as new', he: 'מוצר חדש' },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Adds a colourful "New" tag to the product card.',
          he: 'אם מסומן, יופיע על כרטיס המוצר תג צבעוני "חדש".',
        },
      },
    },

    // ─── Inventory fields (always shown, but stock only meaningful for stocked items) ──
    {
      name: 'sku',
      type: 'text',
      label: { en: 'SKU', he: 'מספר קטלוגי (מק״ט)' },
      admin: {
        description: {
          en: 'Optional internal product code.',
          he: 'קוד פנימי של המוצר אצלך, אם יש לך אחד. אופציונלי.',
        },
      },
    },
    {
      name: 'stock',
      type: 'number',
      min: 0,
      defaultValue: 0,
      label: { en: 'Stock on hand', he: 'כמות במלאי' },
      admin: {
        // Only visible for items Yarit actually inventories. Items she
        // orders from her supplier on demand don't have stock to track.
        condition: (data) => data.type === 'stocked',
        description: {
          en: 'Number of units currently in your inventory.',
          he: 'כמות היחידות שיש לך בבית עכשיו. • מתעדכן אוטומטית כשהזמנה נסגרת. • כשהכמות יורדת מתחת ל-5, המוצר מופיע ב"מלאי נמוך" בעמוד הבית של פאנל הניהול. • חשוב לעדכן ידנית אם קיבלת משלוח חדש. • אפשר להשתמש בכפתורי ‎+1 / ‎−1 לצד השדה לעדכונים מהירים.',
        },
        // 2026-04-11 Track B.2 — replaces the default NumberField
        // with a wrapper that adds +1 / −1 quick-adjust buttons.
        components: {
          Field: {
            path: '@/components/admin/payload/StockQuickAdjust#StockQuickAdjust',
          },
        },
      },
    },
    {
      name: 'weightGrams',
      type: 'number',
      min: 0,
      label: { en: 'Weight (grams)', he: 'משקל (גרם)' },
      admin: {
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
      label: { en: 'Status', he: 'מצב פרסום' },
      options: [
        { label: { en: 'Draft', he: 'טיוטה' }, value: 'draft' },
        { label: { en: 'Published', he: 'פורסם' }, value: 'published' },
      ],
      admin: {
        position: 'sidebar',
        description: {
          en: '"Draft" — saved but hidden. "Published" — visible on the store.',
          he: '"טיוטה" — המוצר נשמר אצלך אבל לא מוצג באתר. טוב לעבודה בשלבים. • "פורסם" — גלוי לכל המבקרים באתר. • אפשר לשנות בין טיוטה לפורסם מתי שרוצים — שמירה מחלצת את השינוי מיד.',
        },
      },
    },
  ],
}
