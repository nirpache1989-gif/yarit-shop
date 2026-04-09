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

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { en: 'User', he: 'משתמש' },
    plural: { en: 'Users', he: 'משתמשים' },
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'name'],
    group: { en: 'Sales', he: 'מכירות' },
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
        { label: 'עברית', value: 'he' },
        { label: 'English', value: 'en' },
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
