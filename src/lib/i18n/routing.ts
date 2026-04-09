/**
 * @file i18n routing config (next-intl)
 * @summary Defines the supported locales, the default, and the URL
 *          prefix strategy. This is the single source of truth for
 *          locale routing and is imported by:
 *            - src/middleware.ts (locale detection + redirect)
 *            - src/lib/i18n/navigation.ts (locale-aware Link/router)
 *            - src/lib/i18n/request.ts (server-side message loading)
 *            - storefront layout and pages (useLocale/useTranslations)
 *
 *          Strategy: `as-needed`. Hebrew is default, so `/` serves
 *          Hebrew content without a prefix. English lives under `/en/*`.
 *          This is the friendliest URL shape for an Israeli audience.
 *
 *          See: plan §3 (Information Architecture).
 */
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['he', 'en'],
  defaultLocale: 'he',
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
