/**
 * @file POST /api/checkout — order creation endpoint
 * @summary Receives the cart items + customer info + address from the
 *          client-side CheckoutForm, validates everything server-side,
 *          creates the Order, kicks off payment, and returns the
 *          redirect URL the client should navigate to.
 *
 *          The heavy lifting lives in `src/lib/checkout.ts` —
 *          `createOrderFromCheckout`. This route is just the thin HTTP
 *          adapter (parse body, call lib, return JSON).
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createOrderFromCheckout, type CheckoutInput } from '@/lib/checkout'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutInput
    const payload = await getPayload({ config })
    const result = await createOrderFromCheckout(payload, body)
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error('checkout failed:', err)
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
