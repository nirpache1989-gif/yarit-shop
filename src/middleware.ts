/**
 * @file Next.js middleware (locale routing)
 * @summary Delegates to next-intl's middleware for URL-based locale
 *          detection, redirect, and rewrite. The matcher carefully
 *          excludes Payload routes (`/admin`, `/api`) and static files
 *          — those must not be intercepted.
 *
 *          Next 16 note: the file is still named `middleware.ts`
 *          (deprecated but supported) rather than `proxy.ts` because
 *          next-intl's middleware uses edge runtime patterns. If we
 *          later migrate to `proxy.ts`, verify next-intl supports
 *          Node.js runtime first.
 */
import createMiddleware from 'next-intl/middleware'
import { routing } from './lib/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match everything except:
  //   - /admin       — Payload admin UI (includes /admin/fulfillment)
  //   - /api         — Payload REST + GraphQL
  //   - /_next       — Next internals
  //   - /_vercel     — Vercel internals
  //   - anything with a file extension (favicons, images, fonts, etc.)
  // Round 5: removed /fulfillment from the exclusion list — the old
  // (admin-tools)/fulfillment route was deleted; the Yarit
  // fulfillment view now lives at /admin/fulfillment (covered by the
  // /admin exclusion).
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
