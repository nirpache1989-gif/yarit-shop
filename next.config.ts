/**
 * @file Next.js configuration for Shoresh
 * @summary Composes two plugin wrappers around the base Next config:
 *          - `withPayload`   — Payload CMS bundling + admin hot-reload
 *          - `withNextIntl`  — next-intl message loader + routing plugin
 *          Order: withNextIntl(withPayload(config)). The outer plugin
 *          sees the Payload-augmented config.
 */
import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    // Payload serves uploaded media from the same Next server at
    // `/api/media/file/<filename>`. Since these are same-origin they
    // don't strictly need a remotePattern, but listing them here
    // documents intent and makes it explicit that media is allowed.
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/media/**',
      },
    ],
  },
}

export default withNextIntl(withPayload(nextConfig))
