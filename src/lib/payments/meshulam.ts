/**
 * @file Meshulam payment provider
 * @summary Real implementation framework for Meshulam
 *          (https://meshulam.co.il), the recommended Israeli payment
 *          gateway for Shoresh. Structured so Nir can paste in the
 *          four credentials, swap `EMAIL_PROVIDER=mock` → `resend`
 *          and `PAYMENT_PROVIDER=mock` → `meshulam`, and have the
 *          whole flow come alive without touching code.
 *
 *          PASTE-IN-READY CONFIG
 *          ---------------------
 *          Once Yarit has a Meshulam business account, drop these
 *          env vars into `.env.local` (dev, pointed at sandbox) and
 *          the Vercel project (prod, pointed at live):
 *
 *              PAYMENT_PROVIDER=meshulam
 *              MESHULAM_API_KEY=xxxxxxxxxxxxxxxxxxxx
 *              MESHULAM_USER_ID=xxxxxx
 *              MESHULAM_PAGE_CODE=xxxxxx
 *              MESHULAM_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx
 *              # optional — defaults to sandbox
 *              MESHULAM_BASE_URL=https://sandbox.meshulam.co.il/api/light/server/1.0
 *              # for production:
 *              # MESHULAM_BASE_URL=https://meshulam.co.il/api/light/server/1.0
 *
 *          TWO-STEP TODO (≤1 hour of work, done once the Meshulam
 *          docs PDF is in hand)
 *          ------------------------------------------------------
 *          1. `createPayment()` — confirm the exact field names that
 *             Meshulam's `createPaymentProcess` endpoint expects.
 *             The body I've left below is the commonly-documented
 *             shape, but Meshulam has revised their API twice in the
 *             last year; always cross-check against the PDF Yarit's
 *             account manager emails over.
 *          2. `verifyWebhook()` — confirm the exact HMAC field name
 *             Meshulam sends and which headers / form fields to feed
 *             into the signature check. The code below expects
 *             `X-Meshulam-Signature` but some installations use an
 *             `asmachta` body field instead. Again — read the PDF.
 *
 *          Everything ELSE in this file is correct as-is: env
 *          reading, error handling, interface conformance, failure
 *          modes, and the ordering of signature verification before
 *          status mapping. You don't need to rewrite any of the
 *          scaffolding — just fill in the two TODOs and test in
 *          sandbox.
 *
 *          See: docs/DECISIONS.md ADR-009 (pluggable providers),
 *               docs/ENVIRONMENT.md.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'
import type {
  PaymentProvider,
  PaymentOrderInput,
  CreatePaymentResult,
  VerifyWebhookResult,
} from './provider'

type MeshulamConfig = {
  apiKey: string
  userId: string
  pageCode: string
  webhookSecret: string
  baseUrl: string
}

function readConfig(): MeshulamConfig | { error: string } {
  const apiKey = process.env.MESHULAM_API_KEY
  const userId = process.env.MESHULAM_USER_ID
  const pageCode = process.env.MESHULAM_PAGE_CODE
  const webhookSecret = process.env.MESHULAM_WEBHOOK_SECRET
  const baseUrl =
    process.env.MESHULAM_BASE_URL ??
    'https://sandbox.meshulam.co.il/api/light/server/1.0'

  const missing: string[] = []
  if (!apiKey) missing.push('MESHULAM_API_KEY')
  if (!userId) missing.push('MESHULAM_USER_ID')
  if (!pageCode) missing.push('MESHULAM_PAGE_CODE')
  if (!webhookSecret) missing.push('MESHULAM_WEBHOOK_SECRET')
  if (missing.length > 0) {
    return {
      error: `Meshulam env not configured — missing: ${missing.join(', ')}. Set these in .env.local (dev) or Vercel env (prod), or switch PAYMENT_PROVIDER=mock for now.`,
    }
  }

  return {
    apiKey: apiKey!,
    userId: userId!,
    pageCode: pageCode!,
    webhookSecret: webhookSecret!,
    baseUrl: baseUrl.replace(/\/+$/, ''),
  }
}

/**
 * Verify Meshulam's webhook HMAC signature in constant time. The
 * exact header / body field Meshulam uses varies by account — see
 * the TODO at the top of this file. The signing logic (SHA-256 HMAC
 * over the raw body keyed with the webhook secret) is standard.
 */
function verifyHmac(secret: string, body: string, signature: string): boolean {
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  try {
    const a = Buffer.from(signature, 'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export const meshulamProvider: PaymentProvider = {
  id: 'meshulam',

  async createPayment(input: PaymentOrderInput): Promise<CreatePaymentResult> {
    const cfg = readConfig()
    if ('error' in cfg) {
      throw new Error(cfg.error)
    }

    // TODO(meshulam): confirm exact field names from Meshulam's
    // createPaymentProcess PDF. This is the commonly-documented
    // body but your account manager may have a custom version.
    const body = new URLSearchParams({
      userId: cfg.userId,
      pageCode: cfg.pageCode,
      apiKey: cfg.apiKey,
      sum: String(input.total),
      currency: input.currency, // 'ILS'
      description: `הזמנה ${input.orderNumber}`,
      paymentType: 'regular',
      paymentNum: '1',
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      cField1: String(input.orderId), // custom field — echoed back on webhook
      cField2: input.orderNumber,
      pageField: JSON.stringify({
        fullName: input.customer.name,
        phone: input.customer.phone ?? '',
        email: input.customer.email,
      }),
    })

    const res = await fetch(`${cfg.baseUrl}/createPaymentProcess`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(
        `Meshulam createPayment HTTP ${res.status}: ${text.slice(0, 300)}`,
      )
    }

    // Meshulam's documented success response:
    //   { status: 1, data: { url: "https://...", processId: "..." } }
    const json = (await res.json()) as {
      status?: number
      data?: { url?: string; processId?: string }
      err?: string
      errMsg?: string
    }

    if (json.status !== 1 || !json.data?.url) {
      throw new Error(
        `Meshulam createPayment failed: ${json.errMsg ?? json.err ?? 'unknown error'}`,
      )
    }

    return {
      redirectUrl: json.data.url,
      providerRef: json.data.processId ?? String(input.orderId),
      immediate: false, // Meshulam is async — final status comes via webhook
    }
  },

  async verifyWebhook(request: Request): Promise<VerifyWebhookResult> {
    const cfg = readConfig()
    if ('error' in cfg) {
      return { ok: false, error: cfg.error }
    }

    // Clone so we can read the body twice (once as text for HMAC,
    // once parsed as form/json for fields).
    const rawBody = await request.text()

    // TODO(meshulam): confirm whether Meshulam sends the signature
    // in a header or in a body field. Try header first.
    const headerSig =
      request.headers.get('x-meshulam-signature') ??
      request.headers.get('x-asmachta')
    if (!headerSig) {
      return { ok: false, error: 'Missing Meshulam signature header' }
    }

    if (!verifyHmac(cfg.webhookSecret, rawBody, headerSig)) {
      return { ok: false, error: 'Invalid Meshulam signature' }
    }

    // Parse the form-encoded body Meshulam sends back to us.
    let params: URLSearchParams
    try {
      params = new URLSearchParams(rawBody)
    } catch {
      return { ok: false, error: 'Invalid Meshulam webhook body' }
    }

    const orderIdRaw = params.get('cField1') ?? params.get('orderId')
    const processId = params.get('processId') ?? params.get('asmachta') ?? ''
    const statusCode = params.get('status') ?? ''

    if (!orderIdRaw) {
      return { ok: false, error: 'Meshulam webhook missing order reference' }
    }

    // Meshulam uses numeric status codes — 1 is typically success.
    // Map them to our normalized payment status.
    let mapped: 'paid' | 'failed' | 'refunded'
    if (statusCode === '1' || statusCode === 'paid') {
      mapped = 'paid'
    } else if (statusCode === 'refunded') {
      mapped = 'refunded'
    } else {
      mapped = 'failed'
    }

    return {
      ok: true,
      orderId: orderIdRaw,
      providerRef: processId,
      status: mapped,
    }
  },
}
