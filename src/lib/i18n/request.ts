/**
 * @file Server-side message loader for next-intl
 * @summary Called by next-intl on every server render to:
 *            1. Determine the active locale from the request URL
 *            2. Load the matching JSON messages file
 *          The `next-intl/plugin` wrapper in next.config.ts points at
 *          this file via createNextIntlPlugin(...).
 *
 *          Adding a new locale: add it to `routing.locales` AND create
 *          the matching `src/messages/{locale}.json` file.
 */
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
