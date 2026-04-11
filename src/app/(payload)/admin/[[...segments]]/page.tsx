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
 */
import type { Metadata } from 'next'
import config from '@payload-config'
import { generatePageMetadata, RootPage } from '@payloadcms/next/views'

import { importMap } from '../importMap.js'

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
