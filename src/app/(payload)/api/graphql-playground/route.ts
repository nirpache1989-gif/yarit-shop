/**
 * @file Payload GraphQL playground
 * @summary Interactive GraphQL playground at `/api/graphql-playground`.
 *          Useful during development for exploring the schema; typically
 *          disabled in production via Payload config.
 */
import config from '@payload-config'
import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes'

export const GET = GRAPHQL_PLAYGROUND_GET(config)
