/**
 * @file POST /api/dev/seed — dev-only seed loader
 * @summary Populates the DB with demo data by calling
 *          `runSeed(payload)` from `src/lib/seed.ts`. Hard-guarded
 *          on `NODE_ENV !== 'production'` — returns 403 in prod.
 *
 *          USAGE
 *              # Fresh seed (fails with unique constraint errors if
 *              # any data already exists):
 *              curl -X POST http://localhost:3000/api/dev/seed
 *
 *              # Wipe + re-seed (deletes all products, categories,
 *              # tags, orders, media, and non-admin users first):
 *              curl -X POST 'http://localhost:3000/api/dev/seed?wipe=1'
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { runSeed } from '@/lib/seed'

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seed endpoint is disabled in production.' },
      { status: 403 },
    )
  }

  try {
    const url = new URL(request.url)
    const wipe = url.searchParams.get('wipe') === '1'
    const payload = await getPayload({ config })
    const result = await runSeed(payload, { wipe })
    return NextResponse.json({ ok: true, log: result.log })
  } catch (err) {
    console.error('seed failed:', err)
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 },
    )
  }
}
