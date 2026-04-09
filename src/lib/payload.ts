/**
 * @file Server-side Payload fetcher helper
 * @summary Thin wrapper around `getPayload({ config })` cached per
 *          request so server components in the storefront can call
 *          `await getPayloadClient()` without re-initializing Payload
 *          for every request.
 *
 *          For STOREFRONT use only. The admin and API routes use
 *          Payload's own mounted handlers.
 */
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

let cached: Promise<Payload> | null = null

export async function getPayloadClient(): Promise<Payload> {
  if (!cached) {
    cached = getPayload({ config })
  }
  return cached
}
