/**
 * @file POST /api/dev/create-admin — dev-only admin bootstrap
 * @summary Creates an admin user so we can log into Payload without
 *          having to click through the first-user-create wizard in
 *          the browser. Gated on NODE_ENV !== 'production'.
 *
 *          USAGE
 *              curl -X POST http://localhost:3000/api/dev/create-admin \
 *                -H "content-type: application/json" \
 *                -d '{"email":"admin@shoresh.example","password":"admin1234","name":"Yarit"}'
 *
 *          This endpoint is part of the (payload) route group and
 *          lives alongside `/api/dev/seed`.
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Dev endpoints are disabled in production.' },
      { status: 403 },
    )
  }

  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
      name?: string
    }
    const email = body.email ?? 'admin@shoresh.example'
    const password = body.password ?? 'admin1234'
    const name = body.name ?? 'Yarit'

    const payload = await getPayload({ config })
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      return NextResponse.json({
        ok: true,
        alreadyExists: true,
        id: existing.docs[0].id,
        email,
      })
    }

    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name,
        role: 'admin',
      },
    })
    return NextResponse.json({ ok: true, id: user.id, email, password })
  } catch (err) {
    console.error('create-admin failed:', err)
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}
