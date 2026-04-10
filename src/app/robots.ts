/**
 * @file /robots.txt — crawler directives
 * @summary Next.js convention route. Tells search engines which paths
 *          they may crawl. We allow the public storefront (`/`) and
 *          block everything that's either private (auth-gated user
 *          flows) or operational (admin, API, checkout). The sitemap
 *          URL is appended so well-behaved crawlers discover it.
 *
 *          Keep the disallow list in sync with `src/middleware.ts` —
 *          the two serve different purposes (one is routing, one is
 *          crawler policy), but any path that's "not for public eyes"
 *          should appear on both.
 */
import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarit-shop.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/checkout',
          '/account',
          '/login',
          '/forgot-password',
          '/reset-password',
          '/en/checkout',
          '/en/account',
          '/en/login',
          '/en/forgot-password',
          '/en/reset-password',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
