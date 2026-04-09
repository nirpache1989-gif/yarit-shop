/**
 * @file POST /api/webhooks/payment — payment gateway webhook
 * @summary Called by the external payment gateway (Meshulam or
 *          replacement) after the customer completes or cancels
 *          payment. Verifies the webhook via the active provider's
 *          `verifyWebhook` method, then updates the matching Order's
 *          paymentStatus.
 *
 *          The mock provider never sends webhooks, so in dev this
 *          endpoint is unused. Phase D / F:
 *            1. When Meshulam (or the chosen gateway) is wired up,
 *               configure its webhook URL to
 *               `{siteUrl}/api/webhooks/payment`
 *            2. Set `MESHULAM_WEBHOOK_SECRET` in the environment
 *            3. The provider's `verifyWebhook` implementation will
 *               validate the signature
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPaymentProvider } from '@/lib/payments'

export async function POST(request: Request) {
  try {
    const provider = getPaymentProvider()
    const verification = await provider.verifyWebhook(request)
    if (!verification.ok) {
      return NextResponse.json(
        { ok: false, error: verification.error },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })
    await payload.update({
      collection: 'orders',
      id: verification.orderId as number,
      data: {
        paymentStatus: verification.status,
        ...(verification.status === 'paid' ? { orderStatus: 'paid' } : {}),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('webhook failed:', err)
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
