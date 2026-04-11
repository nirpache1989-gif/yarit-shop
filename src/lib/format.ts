/**
 * @file format — shared formatting helpers
 * @summary Single source of truth for price + date formatting across
 *          the storefront and email templates. Previously every
 *          surface reinvented its own `₪{amount}` format string —
 *          some used `toLocaleString('en-IL')`, others used raw
 *          `toLocaleString()`, others wrapped Intl.NumberFormat.
 *          Now they all go through here.
 *
 *          Usage:
 *              import { formatILS, formatOrderDate } from '@/lib/format'
 *              formatILS(1234)          // → "₪1,234"
 *              formatILS(1234, 'en')    // → "₪1,234"
 *              formatOrderDate('2026-04-10T14:55:53.994Z', 'he')
 *                                        // → "10/04/2026 14:55"
 */

export type FormatLocale = 'he' | 'en'

/**
 * Format a number of Israeli shekels for display. Always prefixed
 * with ₪, no decimal places (Copaia's price list is integer-only),
 * locale-appropriate digit grouping.
 */
// The `locale` parameter is currently unused because the ₪ prefix
// + English digit grouping happens to read well in both Hebrew and
// English. Kept in the signature so callers can pass their locale
// without having to revisit every call site when / if we want
// locale-specific digit grouping later.
export function formatILS(
  amount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale: FormatLocale = 'he',
): string {
  const safe = Number.isFinite(amount) ? amount : 0
  return `₪${safe.toLocaleString('en-IL', { maximumFractionDigits: 0 })}`
}

/**
 * Format an ISO timestamp for customer-facing order displays.
 * Hebrew: `DD/MM/YYYY HH:MM`. English: the same (UK-style DMY is
 * the closest match to the Hebrew layout).
 */
export function formatOrderDate(
  iso: string,
  locale: FormatLocale = 'he',
): string {
  try {
    return new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
