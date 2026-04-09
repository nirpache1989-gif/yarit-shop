/**
 * @file Categories collection — product category tree
 * @summary Organizes the catalog into browsable sections (supplements,
 *          skincare, aloe, gifts, beauty, etc.). Supports nesting via a
 *          self-relation for sub-categories (e.g. Skincare > Moisturizers).
 *
 *          Each category has a localized title + optional image, used
 *          on the category grid section of the homepage and the
 *          `/shop/category/[slug]` listing pages.
 *
 *          Slugs are stable URL identifiers; generate once and do not
 *          change without a redirect.
 */
import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: { en: 'Category', he: 'קטגוריה' },
    plural: { en: 'Categories', he: 'קטגוריות' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'parent'],
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
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value
            const title = (data as { title?: string })?.title
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
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { en: 'Description', he: 'תיאור' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Image', he: 'תמונה' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: { en: 'Parent category', he: 'קטגוריה ראשית' },
      admin: {
        description: {
          en: 'Leave empty for top-level categories.',
          he: 'השאר ריק עבור קטגוריה ראשית (ללא אב).',
        },
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Sort order', he: 'סדר הצגה' },
      admin: {
        description: {
          en: 'Lower numbers appear first.',
          he: 'מספרים נמוכים יופיעו קודם.',
        },
      },
    },
  ],
}
