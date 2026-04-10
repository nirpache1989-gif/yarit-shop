/**
 * @file Orders collection — every paid or pending order
 * @summary Tracks the full order lifecycle. Two state machines live
 *          here in parallel because money and physical goods move on
 *          different clocks:
 *
 *          1. `orderStatus` tracks MONEY:
 *               pending → paid → (cancelled | refunded)
 *
 *          2. `fulfillmentStatus` tracks PHYSICAL GOODS:
 *               pending
 *                 → awaiting_forever_purchase   (has Forever items, Yarit needs to order from Forever)
 *                 → forever_purchased           (Yarit confirmed she bought)
 *                 → packed                      (items in hand, ready to ship)
 *                 → shipped                     (handed to courier)
 *                 → delivered                   (customer received)
 *
 *          When an order contains BOTH Forever and independent items,
 *          the Forever workflow wins — fulfillmentStatus starts at
 *          `awaiting_forever_purchase` and Yarit can't mark it shipped
 *          until she confirms she sourced the Forever items.
 *
 *          Line items are SNAPSHOTTED at order creation (title, price,
 *          image) so historical orders stay correct even if the
 *          product is later edited, renamed, or deleted.
 *
 *          See: docs/FULFILLMENT.md, plan §6.
 */
import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: { en: 'Order', he: 'הזמנה' },
    plural: { en: 'Orders', he: 'הזמנות' },
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: [
      'orderNumber',
      'customer',
      'total',
      'paymentStatus',
      'fulfillmentStatus',
      'createdAt',
    ],
    group: { en: '💰 Sales', he: '💰 מכירות' },
    description: {
      en: 'Full history of every order. To handle active orders, use the Fulfillment Dashboard from the homepage tile — it groups them by urgency.',
      he: 'היסטוריה מלאה של כל ההזמנות. לטיפול שוטף בהזמנות פעילות, השתמשי בדף "ניהול הזמנות" שמופיע ככרטיס בעמוד הבית של פאנל הניהול — הוא ממיין אותן לפי דחיפות.',
    },
    listSearchableFields: ['orderNumber'],
  },
  access: {
    // Admins see everything; customers see only their own orders.
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user) return { customer: { equals: user.id } }
      return false
    },
    // Only the storefront checkout can create orders (authenticated).
    create: ({ req: { user } }) => !!user,
    // Admins only for update/delete.
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: { en: 'Order number', he: 'מספר הזמנה' },
      admin: {
        description: {
          en: 'Format: SH-YYYYMM-NNNN. Auto-generated.',
          he: 'פורמט: SH-YYYYMM-NNNN. נוצר אוטומטית.',
        },
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: { en: 'Customer', he: 'לקוח' },
      admin: {
        position: 'sidebar',
        description: {
          en: 'The customer who placed the order. Created automatically at checkout.',
          he: 'הלקוח/ה שביצע/ה את ההזמנה. נוצר אוטומטית בקופה.',
        },
      },
    },

    // ─── Line items (snapshotted) ─────────────────────────────────
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      label: { en: 'Items', he: 'פריטים' },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          label: { en: 'Product', he: 'מוצר' },
          admin: {
            description: {
              en: 'Reference (may be null if product was later deleted).',
              he: 'הפנייה (עלולה להיות ריקה אם המוצר נמחק).',
            },
          },
        },
        {
          name: 'productType',
          type: 'select',
          required: true,
          label: { en: 'Product type at time of order', he: 'סוג מוצר בזמן ההזמנה' },
          options: [
            { label: 'Forever', value: 'forever' },
            { label: 'Independent', value: 'independent' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          label: { en: 'Title (snapshot)', he: 'שם (צילום)' },
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          label: { en: 'Price each (₪)', he: 'מחיר ליחידה (₪)' },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
          label: { en: 'Quantity', he: 'כמות' },
        },
        {
          name: 'imageUrl',
          type: 'text',
          label: { en: 'Image URL (snapshot)', he: 'כתובת תמונה (צילום)' },
        },
      ],
    },

    // ─── Totals ───────────────────────────────────────────────────
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      label: { en: 'Subtotal (₪)', he: 'סה״כ לפני משלוח (₪)' },
    },
    {
      name: 'shippingCost',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: { en: 'Shipping (₪)', he: 'משלוח (₪)' },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      label: { en: 'Total (₪)', he: 'סה״כ לתשלום (₪)' },
    },

    // ─── Shipping address (international-aware) ───────────────────
    {
      name: 'shippingAddress',
      type: 'group',
      label: { en: 'Shipping address', he: 'כתובת משלוח' },
      fields: [
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

    // ─── Payment ──────────────────────────────────────────────────
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: { en: 'Payment status', he: 'סטטוס תשלום' },
      options: [
        { label: { en: 'Pending', he: 'ממתין' }, value: 'pending' },
        { label: { en: 'Paid', he: 'שולם' }, value: 'paid' },
        { label: { en: 'Failed', he: 'נכשל' }, value: 'failed' },
        { label: { en: 'Refunded', he: 'הוחזר' }, value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
        description: {
          en: 'Payment status only — set automatically by the gateway.',
          he: 'סטטוס התשלום בלבד. נקבע אוטומטית על ידי מערכת הסליקה.',
        },
      },
    },
    {
      name: 'paymentProvider',
      type: 'text',
      label: { en: 'Payment provider', he: 'ספק תשלום' },
      admin: {
        position: 'sidebar',
        description: {
          en: 'E.g. meshulam, tranzila, cardcom.',
          he: 'לדוגמה: meshulam, tranzila, cardcom.',
        },
      },
    },
    {
      name: 'paymentRef',
      type: 'text',
      label: { en: 'Payment reference', he: 'אסמכתת תשלום' },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Gateway transaction ID.',
          he: 'מזהה עסקה מהסולק.',
        },
      },
    },

    // ─── Fulfillment state machine ────────────────────────────────
    {
      name: 'orderStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: { en: 'Order status', he: 'סטטוס הזמנה' },
      options: [
        { label: { en: 'Pending', he: 'ממתין' }, value: 'pending' },
        { label: { en: 'Paid', he: 'שולם' }, value: 'paid' },
        { label: { en: 'Cancelled', he: 'בוטל' }, value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'fulfillmentStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: { en: 'Fulfillment status', he: 'סטטוס אספקה' },
      options: [
        { label: { en: 'Pending', he: 'ממתין' }, value: 'pending' },
        {
          label: { en: 'Awaiting Forever purchase', he: 'להזמין מפוראבר' },
          value: 'awaiting_forever_purchase',
        },
        {
          label: { en: 'Forever purchased', he: 'נרכש מפוראבר' },
          value: 'forever_purchased',
        },
        { label: { en: 'Packed', he: 'ארוז ומוכן' }, value: 'packed' },
        { label: { en: 'Shipped', he: 'בדרך ללקוח' }, value: 'shipped' },
        { label: { en: 'Delivered', he: 'נמסר ללקוח' }, value: 'delivered' },
      ],
      admin: {
        position: 'sidebar',
        description: {
          en: 'Tracks physical goods — independent of payment status.',
          he: 'שלב הטיפול בהזמנה — נפרד לחלוטין מהתשלום. הכפתורים בלוח ההזמנות מקדמים את השלב הזה אוטומטית.',
        },
      },
    },
    {
      name: 'fulfillmentNotes',
      type: 'textarea',
      label: { en: 'Fulfillment notes', he: 'הערות אספקה' },
      admin: {
        description: {
          en: 'Private notes — Forever order confirmation numbers, tracking, etc.',
          he: 'הערות פרטיות — אישורי הזמנה מפוראבר, מספרי מעקב, וכו׳.',
        },
      },
    },
  ],

  // Order lifecycle hooks
  hooks: {
    // Auto-generate orderNumber on create. Format: SH-YYYYMM-NNNN
    beforeValidate: [
      ({ data, operation }) => {
        if (operation !== 'create') return data
        if (!data) return data
        if (data.orderNumber) return data
        const now = new Date()
        const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
        const suffix = Math.floor(1000 + Math.random() * 9000)
        data.orderNumber = `SH-${yyyymm}-${suffix}`
        return data
      },
    ],
    // Send a Hebrew new-order alert to Yarit's admin email when an
    // order flips to paid. Runs once per paid transition (checks
    // `previousDoc.paymentStatus !== 'paid'`). Non-fatal — if the
    // email send fails, the order is still created.
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        try {
          if (operation !== 'update' && operation !== 'create') return doc
          const wasPaid = previousDoc?.paymentStatus === 'paid'
          const isPaid = doc?.paymentStatus === 'paid'
          if (!isPaid || wasPaid) return doc

          // Lazy-import email deps so we don't load them on every
          // Payload boot cycle (and to avoid circular imports).
          const { getEmailProvider } = await import('@/lib/email')
          const { renderNewOrderAlertEmail } = await import(
            '@/lib/email/adminTemplates'
          )

          const settings = (await req.payload.findGlobal({
            slug: 'site-settings',
            depth: 0,
          })) as {
            contact?: { email?: string }
          }
          const adminEmail = settings.contact?.email
          if (!adminEmail) return doc

          // Lookup customer for contact details
          let customerName = 'לקוח/ה'
          let customerEmail = ''
          let customerPhone = ''
          try {
            if (doc.customer) {
              const customerRec = (await req.payload.findByID({
                collection: 'users',
                id: doc.customer,
                depth: 0,
              })) as { name?: string; email?: string; phone?: string }
              customerName = customerRec?.name ?? customerName
              customerEmail = customerRec?.email ?? ''
              customerPhone = customerRec?.phone ?? ''
            }
          } catch {
            /* non-fatal */
          }

          const items = (doc.items as Array<{
            title: string
            quantity: number
            productType: 'forever' | 'independent'
          }>).map((i) => ({
            title: i.title,
            quantity: i.quantity,
            type: i.productType,
          }))
          const hasForever = items.some((i) => i.type === 'forever')

          const rendered = renderNewOrderAlertEmail({
            orderNumber: doc.orderNumber,
            customerName,
            customerEmail,
            customerPhone,
            items,
            total: doc.total,
            hasForever,
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
            shippingCity: doc.shippingAddress?.city ?? '',
            shippingCountry: doc.shippingAddress?.country ?? '',
          })

          const email = getEmailProvider()
          await email.send({
            to: adminEmail,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text,
          })
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('new-order alert email failed (non-fatal):', err)
        }
        return doc
      },
    ],
  },
}
