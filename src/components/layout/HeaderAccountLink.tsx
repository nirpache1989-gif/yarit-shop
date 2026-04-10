/**
 * @file HeaderAccountLink — login or my-account link in the header
 * @summary Server component. Calls `getCurrentUser()` to read the
 *          `payload-token` cookie and renders either:
 *            - "כניסה" (Log in) → /login   (no user)
 *            - "החשבון שלי" (My account) → /account   (logged in)
 *
 *          Lives in its own file so the parent `Header.tsx` stays a
 *          single async server component without needing to inline
 *          the auth call.
 *
 *          Note: this component runs on every page render, so it
 *          adds one `payload.auth({ headers })` call per request.
 *          Payload caches that lookup internally and the storefront
 *          is server-rendered anyway, so the cost is negligible.
 */
import { getTranslations } from 'next-intl/server'
import NextLink from 'next/link'
import { Link } from '@/lib/i18n/navigation'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

type Variant = 'desktop' | 'mobile'

// Desktop: small pill in the header utility group, hidden below sm.
// Mobile: full-width row inside the MobileNav slide-in panel, always
// visible (the panel itself is what's hidden on larger screens).
const VARIANT_CLASSES: Record<Variant, string> = {
  desktop:
    'hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors uppercase tracking-wider',
  mobile:
    'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)]/10 transition-colors',
}

type Props = {
  variant?: Variant
}

export async function HeaderAccountLink({ variant = 'desktop' }: Props = {}) {
  const t = await getTranslations('auth')
  const { user } = await getCurrentUser()
  const linkClass = VARIANT_CLASSES[variant]

  // Admin: jump straight back to the admin control panel. `/admin` is
  // a Payload route explicitly excluded from next-intl's middleware
  // matcher (see src/middleware.ts) — it has NO locale prefix, ever.
  // That means the CLAUDE.md rule against `next/link` in storefront
  // code doesn't apply here (the rule exists to protect locale-aware
  // routes; admin isn't one). Using `next/link` instead of a plain
  // `<a>` keeps the Next lint clean and lets Next handle the cross
  // route-group transition to the `(payload)` layout correctly.
  if (user && user.role === 'admin') {
    return (
      <NextLink href="/admin" className={linkClass}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 12l9-9 9 9" />
          <path d="M5 10v10h14V10" />
        </svg>
        <span>{t('adminPanel')}</span>
      </NextLink>
    )
  }

  if (user) {
    return (
      <Link
        href="/account"
        title={user.name ?? user.email}
        className={linkClass}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" />
        </svg>
        <span>{t('myAccount')}</span>
      </Link>
    )
  }

  return (
    <Link href="/login" className={linkClass}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
      <span>{t('login')}</span>
    </Link>
  )
}
