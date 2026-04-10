/**
 * @file /sitemap.xml — dynamic product + page sitemap
 * @summary Next.js convention route. Emits a sitemap covering:
 *            - Static storefront pages: /, /shop, /about, /contact
 *              (in both locales)
 *            - Every published product slug under /product/[slug]
 *              (in both locales)
 *
 *          Fetched via `getPayloadClient()` so the sitemap is always
 *          current — no build-time caching. Google rechecks
 *          sitemaps on a schedule, and we want products published
 *          between deploys to show up.
 *
 *          Locale URLs use next-intl's `as-needed` strategy: Hebrew
 *          is the default locale so it has no prefix; English lives
 *          under /en/*.
 */
import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarit-shop.vercel.app'
).replace(/\/+$/, '')

// Non-product pages that should always appear. Add entries here when
// you ship a new public page (e.g. /faq, /policies/*).
const STATIC_PAGES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
]

function buildLocaleUrl(locale: 'he' | 'en', path: string): string {
  const prefix = locale === 'he' ? '' : '/en'
  return `${SITE_URL}${prefix}${path}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Static pages — both locales
  const now = new Date()
  for (const page of STATIC_PAGES) {
    for (const locale of ['he', 'en'] as const) {
      entries.push({
        url: buildLocaleUrl(locale, page.path),
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    }
  }

  // Products — fetched live from Payload
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'products',
      where: { status: { equals: 'published' } },
      limit: 500,
      depth: 0,
    })
    for (const doc of res.docs as Array<{ slug?: string; updatedAt?: string }>) {
      if (!doc.slug) continue
      const lastModified = doc.updatedAt ? new Date(doc.updatedAt) : now
      for (const locale of ['he', 'en'] as const) {
        entries.push({
          url: buildLocaleUrl(locale, `/product/${doc.slug}`),
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch (err) {
    // Non-fatal: if Payload isn't reachable at sitemap-generation
    // time (e.g. during a partial deploy), we still want the static
    // page list. Log so we notice in server logs.
    console.error('sitemap product fetch failed (non-fatal):', err)
  }

  return entries
}
