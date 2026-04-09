/**
 * @file Tags collection — flat product tagging
 * @summary Lightweight labels attached to products (e.g. "vegan",
 *          "gluten-free", "new arrival"). Unlike Categories, tags are
 *          flat — no hierarchy, no images. A product can have many tags.
 *
 *          Used on the storefront for filter chips and in Payload admin
 *          for grouping/filtering in the product list.
 */
import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: { en: 'Tag', he: 'תגית' },
    plural: { en: 'Tags', he: 'תגיות' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
    group: { en: 'Catalog', he: 'קטלוג' },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { en: 'Title', he: 'שם' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: { en: 'Slug', he: 'מזהה כתובת' },
      admin: {
        description: {
          en: 'URL-safe identifier (auto-filled from title).',
          he: 'מזהה לכתובת ה-URL (מתמלא אוטומטית מהשם).',
        },
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value
            const title = (data as { title?: string })?.title
            if (!title) return value
            return title
              .toLowerCase()
              .trim()
              .replace(/[^\w\s\u0590-\u05FF-]/g, '')
              .replace(/\s+/g, '-')
          },
        ],
      },
    },
  ],
}
