/**
 * @file PaymentProvider abstract interface
 * @summary Every payment gateway implementation (Meshulam, Tranzila,
 *          CardCom, Grow, Pelecard, or the dev mock) must implement
 *          this interface. The rest of the codebase imports ONLY this
 *          interface — never a concrete implementation. This is the
 *          single file you need to know to add a new gateway.
 *
 *          Flow:
 *          1. Checkout API creates the order in Payload with `pending` status
 *          2. Checkout API calls `provider.createPayment(order)`
 *          3. Provider returns `{ redirectUrl, providerRef, immediate }`:
 *             - `redirectUrl`: where to send the customer next
 *             - `providerRef`: gateway-side transaction id (stored on the order)
 *             - `immediate`: if true, the provider already marked the order as paid
 *               synchronously (mock mode); if false, await a webhook
 *          4. For non-immediate providers, the webhook handler later
 *             calls `provider.verifyWebhook(request)` to confirm payment
 *             and flip the order status
 *
 *          See: docs/DECISIONS.md ADR-009 (pluggable payment providers),
 *               docs/ARCHITECTURE.md §Payments, plan §2.
 */

export type PaymentOrderInput = {
  orderId: string | number
  orderNumber: string
  total: number // in ILS
  currency: 'ILS'
  customer: {
    email: string
    name: string
    phone?: string
  }
  successUrl: string // where to redirect after successful payment
  cancelUrl: string // where to redirect after cancelled payment
}

export type CreatePaymentResult = {
  redirectUrl: string
  providerRef: string
  /** If true, the provider already completed the payment synchronously.
   *  The checkout orchestration should flip the order to `paid` right
   *  away instead of waiting for a webhook. */
  immediate: boolean
}

export type VerifyWebhookResult =
  | { ok: true; orderId: string | number; providerRef: string; status: 'paid' | 'failed' | 'refunded' }
  | { ok: false; error: string }

export interface PaymentProvider {
  /** Stable identifier stored on the Order for audit purposes. */
  readonly id: string
  createPayment(input: PaymentOrderInput): Promise<CreatePaymentResult>
  verifyWebhook(request: Request): Promise<VerifyWebhookResult>
}
