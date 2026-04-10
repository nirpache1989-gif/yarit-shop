/**
 * @file Media collection — image and file uploads
 * @summary Holds every uploaded file (product images, hero images, logos,
 *          category images, etc.). Images are resized into several preset
 *          sizes so the storefront can serve the right size for each
 *          context without downloading the original every time.
 *
 *          Alt text is localized (he + en) because it appears on the
 *          storefront. Yarit enters Hebrew alt by default; English is
 *          optional and falls back to Hebrew when missing.
 *
 *          Local dev: files stored at `./public/media/`. Production will
 *          swap to Cloudflare R2 via a Payload storage plugin — the
 *          schema here is unchanged, only the storage adapter.
 *
 *          See: docs/ARCHITECTURE.md §Data Model.
 */
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { en: 'Media', he: 'מדיה' },
    plural: { en: 'Media', he: 'מדיה' },
  },
  admin: {
    group: { en: '🖼 Content', he: '🖼 תוכן ותמונות' },
    description: {
      en: 'Every image uploaded to the site lives here. You can upload directly from this page, or from inside a product/category form.',
      he: 'כל התמונות שעלו לאתר נמצאות כאן. אפשר להעלות תמונות חדשות ישירות מהדף הזה, או מתוך טופס עריכת מוצר/קטגוריה — שתי הדרכים שומרות את התמונה לאותה ספרייה.',
    },
  },
  access: {
    read: () => true, // Public — media URLs are used in the storefront.
  },
  upload: {
    // Image size presets auto-generated on upload.
    imageSizes: [
      { name: 'thumbnail', width: 240, height: 240, fit: 'cover' },
      { name: 'card', width: 480, height: 480, fit: 'cover' },
      { name: 'detail', width: 960, height: 960, fit: 'inside' },
      { name: 'hero', width: 1920, height: 1080, fit: 'inside' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: { en: 'Alt text', he: 'תיאור לנגישות' },
      admin: {
        description: {
          en: 'Short description of the image for screen readers and SEO.',
          he: 'תיאור קצר של התמונה לקוראי מסך ולקידום בגוגל.',
        },
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      label: { en: 'Caption', he: 'כיתוב' },
      admin: {
        description: {
          en: 'Optional caption displayed under the image.',
          he: 'כיתוב אופציונלי המוצג מתחת לתמונה.',
        },
      },
    },
  ],
}
