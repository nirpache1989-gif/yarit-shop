/**
 * @file Meshulam payment provider — IMPLEMENTATION STUB
 * @summary Placeholder for the Meshulam (Israeli gateway) integration.
 *          All methods currently throw — they must be filled in once
 *          Yarit has a Meshulam business account and we have:
 *            - MESHULAM_API_KEY
 *            - MESHULAM_USER_ID
 *            - MESHULAM_PAGE_CODE
 *            - MESHULAM_WEBHOOK_SECRET
 *          (see .env.example)
 *
 *          HOW TO FINISH THIS:
 *          1. Sign up for Meshulam: https://meshulam.co.il
 *          2. Read their "Payment Page" API docs (they hand you a URL
 *             to redirect customers to)
 *          3. Fill in `createPayment` — it should POST to Meshulam's
 *             `/createPaymentProcess` endpoint with the order details
 *             and return the payment URL they give back
 *          4. Fill in `verifyWebhook` — Meshulam POSTs to our webhook
 *             URL after payment. Verify the HMAC signature with
 *             `MESHULAM_WEBHOOK_SECRET`, then return `{ok, orderId, status}`
 *          5. Test with Meshulam's sandbox environment first
 *          6. Swap the default provider: set `PAYMENT_PROVIDER=meshulam`
 *             in the environment
 *
 *          This file intentionally throws instead of silently no-op'ing
 *          so a missing implementation can't be deployed to production.
 *
 *          See: docs/DECISIONS.md ADR-009, docs/ENVIRONMENT.md.
 */
import type {
  PaymentProvider,
  PaymentOrderInput,
  CreatePaymentResult,
  VerifyWebhookResult,
} from './provider'

const NOT_IMPLEMENTED =
  'Meshulam provider is not yet implemented. Set PAYMENT_PROVIDER=mock in .env.local for now, or finish src/lib/payments/meshulam.ts once you have Meshulam credentials.'

export const meshulamProvider: PaymentProvider = {
  id: 'meshulam',

  async createPayment(_input: PaymentOrderInput): Promise<CreatePaymentResult> {
    throw new Error(NOT_IMPLEMENTED)
  },

  async verifyWebhook(_request: Request): Promise<VerifyWebhookResult> {
    throw new Error(NOT_IMPLEMENTED)
  },
}
