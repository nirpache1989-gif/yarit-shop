/**
 * @file POST /api/dev/seed — dev-only seed loader
 * @summary Populates an empty DB with demo data by calling
 *          `runSeed(payload)` from `src/lib/seed.ts`. Hard-guarded
 *          on `NODE_ENV !== 'production'` — returns 403 in prod even
 *          if someone guesses the URL.
 *
 *          HOW TO USE
 *              1. Start dev: `npm run dev`
 *              2. curl -X POST http://localhost:3000/api/dev/seed
 *              3. Visit /admin to review
 *
 *          IMPORTANT: This is a one-shot. Running it twice on the same
 *          DB will produce unique-constraint errors. To re-run, stop
 *          dev, delete `shoresh-dev.db*` and `public/media`, start
 *          dev again, then POST to this endpoint.
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { runSeed } from '@/lib/seed'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seed endpoint is disabled in production.' },
      { status: 403 },
    )
  }

  try {
    const payload = await getPayload({ config })
    const result = await runSeed(payload)
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
