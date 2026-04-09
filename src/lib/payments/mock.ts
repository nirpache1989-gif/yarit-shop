/**
 * @file Mock payment provider (dev only)
 * @summary Immediately "succeeds" without calling any external service.
 *          Lets us build and test the entire checkout flow end-to-end
 *          without needing real gateway credentials. Returns the
 *          customer directly to the success URL with a fake providerRef.
 *
 *          This is the default provider in local dev. Swap to
 *          `meshulam` (or whatever) by setting `PAYMENT_PROVIDER=meshulam`
 *          in `.env.local` once real credentials exist.
 */
import type {
  PaymentProvider,
  PaymentOrderInput,
  CreatePaymentResult,
  VerifyWebhookResult,
} from './provider'

export const mockProvider: PaymentProvider = {
  id: 'mock',

  async createPayment(input: PaymentOrderInput): Promise<CreatePaymentResult> {
    // Fake a gateway call. The "redirect" is just our success page with
    // an `mockPaid=true` flag so the success page can show a confirmation.
    const providerRef = `mock-${input.orderNumber}-${Date.now()}`
    return {
      redirectUrl: input.successUrl,
      providerRef,
      immediate: true,
    }
  },

  async verifyWebhook(_request: Request): Promise<VerifyWebhookResult> {
    // Mock provider never dispatches real webhooks. If something POSTs
    // to the webhook route claiming to be the mock provider, reject it.
    return { ok: false, error: 'Mock provider does not issue webhooks.' }
  },
}
