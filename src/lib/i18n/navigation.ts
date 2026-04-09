/**
 * @file Locale-aware navigation primitives
 * @summary Re-exports `Link`, `redirect`, `usePathname`, `useRouter`,
 *          and `getPathname` from next-intl, pre-wired with our routing
 *          config. Always import Link from here — NEVER from
 *          `next/link` in storefront code — otherwise locale prefixes
 *          won't be applied automatically.
 */
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
