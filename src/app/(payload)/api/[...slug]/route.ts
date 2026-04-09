/**
 * @file Payload REST API catch-all route
 * @summary Mounts Payload's REST endpoints under `/api/*`. The handlers
 *          come from `@payloadcms/next/routes`; we just bind them to
 *          our config. This also covers auth endpoints, file uploads,
 *          and collection CRUD.
 */
import config from '@payload-config'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
