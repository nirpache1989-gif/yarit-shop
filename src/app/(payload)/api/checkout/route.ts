/**
 * @file POST /api/checkout — order creation endpoint
 * @summary Receives the cart items + customer info + address from the
 *          client-side CheckoutForm, validates everything server-side,
 *          creates the Order, kicks off payment, and returns the
 *          redirect URL the client should navigate to.
 *
 *          Flow:
 *            1. Parse JSON body (malformed JSON → 400)
 *            2. `validateCheckoutInput` narrows the unknown blob into
 *               a typed `CheckoutInput` or returns a machine-readable
 *               error code. No downstream code runs until the body
 *               matches the expected shape.
 *            3. `createOrderFromCheckout` does the heavy lifting —
 *               catalog validation, order creation, stock decrement,
 *               payment initiation, confirmation email.
 *
 *          Keeping the validator in `src/lib/checkout.ts` means
 *          tests (once we add them) can exercise it without spinning
 *          up a Next route handler.
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  createOrderFromCheckout,
  validateCheckoutInput,
} from '@/lib/checkout'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'INVALID_JSON' },
      { status: 400 },
    )
  }

  const parsed = validateCheckoutInput(body)
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayload({ config })
    const result = await createOrderFromCheckout(payload, parsed.input)
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
