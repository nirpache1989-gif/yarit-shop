/**
 * @file Payload admin catch-all page
 * @summary Every `/admin/*` URL is handled here. The route uses an
 *          optional catch-all segment so `/admin` (empty segments) and
 *          `/admin/collections/users/123` (deep segments) both resolve
 *          to this single handler. Payload's `RootPage` renders the
 *          correct view based on the URL.
 *
 *          Next 16 note: `params` and `searchParams` are now Promises.
 *          Payload's `RootPage` already awaits them internally, so we
 *          can pass the thenables directly.
 *
 *          2026-04-12 admin-fix: forcing `dynamic = 'force-dynamic'`
 *          and `runtime = 'nodejs'` to prevent Next 16 / Vercel from
 *          serving the partial / streaming SSR shell that was leaving
 *          an empty React Suspense boundary on prod (the dashboard
 *          markup was arriving in the RSC payload script tags but
 *          never converted into DOM elements). Force-dynamic disables
 *          the static-shell rendering path and forces full SSR on
 *          every request.
 */
import type { Metadata } from 'next'
import config from '@payload-config'
import { generatePageMetadata, RootPage } from '@payloadcms/next/views'

import { importMap } from '../importMap.js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, importMap, params, searchParams })

export default Page
