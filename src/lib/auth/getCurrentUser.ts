/**
 * @file getCurrentUser — server-side "who is logged in" helper
 * @summary Reads the current request's headers (which include the
 *          `payload-token` cookie) via Next.js `next/headers`, hands
 *          them to Payload's first-class `payload.auth({ headers })`,
 *          and returns the resolved user (or `null`).
 *
 *          IMPORTANT — order ownership invariant:
 *          Every Payload `find` / `findByID` call from the /account
 *          pages MUST be invoked with `{ user, overrideAccess: false }`.
 *          Without those, Payload's local API runs as super-user and
 *          the access rule on Orders (which scopes reads to
 *          `customer.equals = user.id`) is bypassed — leaking every
 *          customer's orders to whoever is logged in. The verification
 *          checklist (step j) is the explicit cross-customer test for
 *          this regression.
 *
 *          Also returns the request `Headers` so callers that need to
 *          forward the same auth context to a downstream `fetch` (e.g.
 *          for SSR cookie passthrough) can do so without re-reading
 *          them.
 */
import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'

export type CurrentUser = {
  id: number | string
  email: string
  name?: string
  role?: 'admin' | 'customer'
  phone?: string
  preferredLocale?: 'he' | 'en'
}

export type GetCurrentUserResult = {
  user: CurrentUser | null
  requestHeaders: Headers
}

export async function getCurrentUser(): Promise<GetCurrentUserResult> {
  const requestHeaders = await headers()
  const payload = await getPayloadClient()
  try {
    const result = await payload.auth({ headers: requestHeaders })
    return {
      user: (result.user as CurrentUser | null) ?? null,
      requestHeaders,
    }
  } catch {
    return { user: null, requestHeaders }
  }
}
