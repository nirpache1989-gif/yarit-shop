/**
 * @file Server-side checkout orchestration
 * @summary The core `createOrderFromCheckout` function called by
 *          `POST /api/checkout`. It:
 *          1. Validates every line item against the live Products
 *             collection (price, availability, type) — NEVER trust
 *             client-side cart prices
 *          2. Finds or creates a customer User (with a random password)
 *          3. Creates the Order with `orderStatus=pending` and the
 *             correct initial `fulfillmentStatus`:
 *                - Any Forever items → awaiting_forever_purchase
 *                - All independent, stock OK → packed
 *                - Stock issues → pending
 *          4. Decrements stock for independent items
 *          5. Calls the active payment provider to initiate payment
 *          6. If the provider reports `immediate: true` (mock mode),
 *             flips the order to `paid` right away
 *          7. Sends the order confirmation email
 *          8. Returns `{ orderId, orderNumber, redirectUrl }`
 *
 *          Security: this runs server-side only. Client can only
 *          submit productIds + quantities + customer/address info.
 *          Prices and stock come from Payload.
 */
import { randomBytes } from 'node:crypto'
import type { Payload } from 'payload'
import { getPaymentProvider } from '@/lib/payments'
import { getEmailProvider } from '@/lib/email'
import { renderOrderConfirmationEmail } from '@/lib/email/templates'
import { countryToRegion, getShippingRatesForRegion } from '@/lib/shipping'
import { STATIC_IMAGE_OVERRIDES } from '@/lib/product-image'
import { signOrderToken } from '@/lib/orderToken'

/**
 * Server-side source of truth for the storefront's public URL.
 *
 * This used to come from `input.siteUrl`, which the browser sent as
 * `window.location.origin`. A malicious client could have passed a
 * hostile URL and then followed the payment gateway's redirect into
 * their own domain, exfiltrating the order token. Trusting a
 * redirect target to come from the client is always a bad idea.
 *
 * We now read `NEXT_PUBLIC_SITE_URL` from the server env (set on
 * Vercel, and in local `.env.local`). No client input is honored.
 */
function getServerSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv && /^https?:\/\//.test(fromEnv)) {
    return fromEnv.replace(/\/+$/, '')
  }
  return 'http://localhost:3000'
}

/**
 * Generate a strong random password for an auto-created customer
 * account. Customers never see this password — they always arrive
 * through the forgot-password flow — but we still use a CSPRNG so a
 * weak password never sits in the database.
 */
function generateCustomerPassword(): string {
  return randomBytes(24).toString('base64url')
}

export type CheckoutInput = {
  locale: 'he' | 'en'
  items: Array<{ productId: number | string; quantity: number }>
  customer: { email: string; name: string; phone: string }
  shippingAddress: {
    recipientName: string
    phone: string
    street: string
    city: string
    postalCode?: string
    country: string
  }
  /** Index into the filtered rates list returned by getShippingRatesForRegion */
  shippingMethodIndex: number
}

export type CheckoutResult =
  | {
      ok: true
      orderId: string | number
      orderNumber: string
      redirectUrl: string
      immediatePaid: boolean
    }
  | { ok: false; error: string }

/**
 * Runtime validator for the POST /api/checkout body. Hand-rolled
 * (no zod dep) because the input shape is small and stable. Returns
 * a narrowed `CheckoutInput` on success, or an error with a short
 * machine-readable code describing the first failing field.
 *
 * This exists because the route handler used to cast the raw JSON
 * to `CheckoutInput` without checking — a client could omit a
 * required field and trip a downstream crash. Every defensive check
 * here protects a specific line in `createOrderFromCheckout`.
 */
export function validateCheckoutInput(
  raw: unknown,
): { ok: true; input: CheckoutInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'INVALID_BODY' }
  }
  const obj = raw as Record<string, unknown>

  if (obj.locale !== 'he' && obj.locale !== 'en') {
    return { ok: false, error: 'INVALID_LOCALE' }
  }

  if (!Array.isArray(obj.items) || obj.items.length === 0) {
    return { ok: false, error: 'INVALID_ITEMS' }
  }
  const items: CheckoutInput['items'] = []
  for (const rawItem of obj.items) {
    if (!rawItem || typeof rawItem !== 'object') {
      return { ok: false, error: 'INVALID_ITEM' }
    }
    const itemObj = rawItem as Record<string, unknown>
    const pid = itemObj.productId
    const qty = itemObj.quantity
    if (typeof pid !== 'number' && typeof pid !== 'string') {
      return { ok: false, error: 'INVALID_ITEM_PRODUCT_ID' }
    }
    if (typeof qty !== 'number' || !Number.isFinite(qty) || qty <= 0 || qty > 999) {
      return { ok: false, error: 'INVALID_ITEM_QUANTITY' }
    }
    items.push({ productId: pid, quantity: qty })
  }

  const customer = obj.customer as Record<string, unknown> | undefined
  if (!customer || typeof customer !== 'object') {
    return { ok: false, error: 'INVALID_CUSTOMER' }
  }
  const email = customer.email
  const name = customer.name
  const phone = customer.phone
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'INVALID_CUSTOMER_EMAIL' }
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    return { ok: false, error: 'INVALID_CUSTOMER_NAME' }
  }
  if (typeof phone !== 'string' || phone.trim().length === 0) {
    return { ok: false, error: 'INVALID_CUSTOMER_PHONE' }
  }

  const addr = obj.shippingAddress as Record<string, unknown> | undefined
  if (!addr || typeof addr !== 'object') {
    return { ok: false, error: 'INVALID_ADDRESS' }
  }
  const recipientName = addr.recipientName
  const addrPhone = addr.phone
  const street = addr.street
  const city = addr.city
  const postalCode = addr.postalCode
  const country = addr.country
  if (typeof recipientName !== 'string' || recipientName.trim().length === 0) {
    return { ok: false, error: 'INVALID_ADDRESS_RECIPIENT' }
  }
  if (typeof addrPhone !== 'string' || addrPhone.trim().length === 0) {
    return { ok: false, error: 'INVALID_ADDRESS_PHONE' }
  }
  if (typeof street !== 'string' || street.trim().length === 0) {
    return { ok: false, error: 'INVALID_ADDRESS_STREET' }
  }
  if (typeof city !== 'string' || city.trim().length === 0) {
    return { ok: false, error: 'INVALID_ADDRESS_CITY' }
  }
  if (postalCode !== undefined && typeof postalCode !== 'string') {
    return { ok: false, error: 'INVALID_ADDRESS_POSTAL' }
  }
  if (
    typeof country !== 'string' ||
    !['IL', 'US', 'GB', 'EU', 'CA', 'AU', 'OTHER'].includes(country)
  ) {
    return { ok: false, error: 'INVALID_ADDRESS_COUNTRY' }
  }

  const shippingMethodIndex = obj.shippingMethodIndex
  if (
    typeof shippingMethodIndex !== 'number' ||
    !Number.isInteger(shippingMethodIndex) ||
    shippingMethodIndex < 0 ||
    shippingMethodIndex > 20
  ) {
    return { ok: false, error: 'INVALID_SHIPPING_METHOD_INDEX' }
  }

  return {
    ok: true,
    input: {
      locale: obj.locale,
      items,
      customer: { email, name, phone },
      shippingAddress: {
        recipientName,
        phone: addrPhone,
        street,
        city,
        postalCode: typeof postalCode === 'string' ? postalCode : undefined,
        country,
      },
      shippingMethodIndex,
    },
  }
}

type ProductSnapshot = {
  productId: number | string
  type: 'forever' | 'independent'
  slug: string
  title: string
  price: number
  quantity: number
  stock: number | null // null for Forever (virtual stock)
  imageUrl?: string
}

export async function createOrderFromCheckout(
  payload: Payload,
  input: CheckoutInput,
): Promise<CheckoutResult> {
  if (input.items.length === 0) {
    return { ok: false, error: 'EMPTY_CART' }
  }

  // 1. Validate each line item against the live catalog
  const snapshots: ProductSnapshot[] = []
  for (const item of input.items) {
    if (item.quantity <= 0) {
      return { ok: false, error: 'INVALID_QUANTITY' }
    }
    const product = (await payload.findByID({
      collection: 'products',
      id: item.productId as number,
      depth: 1,
      locale: input.locale,
    })) as {
      id: number | string
      type: 'forever' | 'independent'
      slug: string
      title: string
      price: number
      status: string
      stock?: number
      images?: Array<{ image?: { url?: string } | number }>
    } | null

    if (!product || product.status !== 'published') {
      return { ok: false, error: `PRODUCT_NOT_FOUND:${item.productId}` }
    }
    if (product.type === 'independent') {
      const stock = product.stock ?? 0
      if (stock < item.quantity) {
        return { ok: false, error: `OUT_OF_STOCK:${product.slug}` }
      }
    }
    const firstImage = product.images?.[0]?.image
    const mediaUrl =
      firstImage && typeof firstImage === 'object' ? firstImage.url : undefined
    // Prefer the shipped-with-the-build static override so orders
    // snapshot a URL that will still resolve after the Media records
    // are swapped out or Vercel Blob is reconfigured.
    const imageUrl = STATIC_IMAGE_OVERRIDES[product.slug] ?? mediaUrl

    snapshots.push({
      productId: product.id,
      type: product.type,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity: item.quantity,
      stock: product.type === 'independent' ? (product.stock ?? 0) : null,
      imageUrl,
    })
  }

  // 2. Calculate totals
  const subtotal = snapshots.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const region = countryToRegion(input.shippingAddress.country)
  const rates = await getShippingRatesForRegion(
    payload,
    region,
    subtotal,
    input.locale,
  )
  if (rates.length === 0) {
    return { ok: false, error: 'NO_SHIPPING_RATES_FOR_REGION' }
  }
  const rate = rates[input.shippingMethodIndex]
  if (!rate) {
    return { ok: false, error: 'INVALID_SHIPPING_METHOD' }
  }
  const shippingCost = rate.price
  const total = subtotal + shippingCost

  // 3. Find or create customer User
  const existingRes = await payload.find({
    collection: 'users',
    where: { email: { equals: input.customer.email } },
    limit: 1,
  })
  let customer = existingRes.docs[0] as { id: number | string } | undefined
  let isNewCustomer = false
  if (!customer) {
    isNewCustomer = true
    // Cryptographically-random password. Customers never see it —
    // first-time visitors arrive through the forgot-password flow to
    // set their own. Using crypto.randomBytes instead of Math.random
    // so a weak password never hits the database.
    const randomPassword = generateCustomerPassword()
    const created = await payload.create({
      collection: 'users',
      data: {
        email: input.customer.email,
        password: randomPassword,
        name: input.customer.name,
        role: 'customer',
        phone: input.customer.phone,
        preferredLocale: input.locale,
      },
    })
    customer = created as { id: number | string }
  }

  // 4. Determine initial fulfillment status
  const hasForever = snapshots.some((s) => s.type === 'forever')
  const initialFulfillmentStatus: string = hasForever
    ? 'awaiting_forever_purchase'
    : 'packed'

  // 5. Create Order
  const order = (await payload.create({
    collection: 'orders',
    data: {
      customer: customer.id,
      items: snapshots.map((s) => ({
        product: s.productId,
        productType: s.type,
        title: s.title,
        price: s.price,
        quantity: s.quantity,
        imageUrl: s.imageUrl ?? '',
      })),
      subtotal,
      shippingCost,
      total,
      shippingAddress: {
        recipientName: input.shippingAddress.recipientName,
        phone: input.shippingAddress.phone,
        street: input.shippingAddress.street,
        city: input.shippingAddress.city,
        postalCode: input.shippingAddress.postalCode ?? '',
        country: input.shippingAddress.country,
      },
      paymentStatus: 'pending',
      orderStatus: 'pending',
      fulfillmentStatus: initialFulfillmentStatus,
    },
  })) as { id: number | string; orderNumber: string }

  // 6. Decrement stock for independent items
  for (const snap of snapshots) {
    if (snap.type === 'independent' && snap.stock !== null) {
      await payload.update({
        collection: 'products',
        id: snap.productId as number,
        data: { stock: snap.stock - snap.quantity },
      })
    }
  }

  // 7. Kick off payment
  //
  // SECURITY: build both the success and cancel URLs from a
  // server-controlled siteUrl (`NEXT_PUBLIC_SITE_URL`), NOT from a
  // field on the client's request body. Previously the client sent
  // `window.location.origin` and we echoed it back — a malicious
  // client could have pointed the payment gateway's redirect at
  // their own domain and stolen the signed order token. Any caller
  // can now spoof their headers and body all they want; the redirect
  // still lands on yarit-shop.vercel.app (or whatever Vercel env
  // sets).
  //
  // The success URL also carries a signed HMAC token over the order
  // ID (see src/lib/orderToken.ts); the success page verifies before
  // reading the order so leaked numeric IDs don't expose summaries.
  const siteUrl = getServerSiteUrl()
  const successToken = signOrderToken(order.id)
  const provider = getPaymentProvider()
  const successUrl = `${siteUrl}/${input.locale === 'he' ? '' : 'en/'}checkout/success?token=${encodeURIComponent(successToken)}`
  const cancelUrl = `${siteUrl}/${input.locale === 'he' ? '' : 'en/'}checkout`

  const payment = await provider.createPayment({
    orderId: order.id,
    orderNumber: order.orderNumber,
    total,
    currency: 'ILS',
    customer: {
      email: input.customer.email,
      name: input.customer.name,
      phone: input.customer.phone,
    },
    successUrl,
    cancelUrl,
  })

  // Store paymentProvider + ref on the order
  await payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      paymentProvider: provider.id,
      paymentRef: payment.providerRef,
    },
  })

  // 8. If the provider is synchronous (mock), flip to paid now
  if (payment.immediate) {
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        paymentStatus: 'paid',
        orderStatus: 'paid',
      },
    })
  }

  // 9. Send confirmation email (mock = console log)
  try {
    const email = getEmailProvider()
    const rendered = renderOrderConfirmationEmail({
      locale: input.locale,
      orderNumber: order.orderNumber,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      items: snapshots.map((s) => ({
        title: s.title,
        quantity: s.quantity,
        price: s.price,
      })),
      subtotal,
      shippingCost,
      total,
      shippingAddress: {
        recipientName: input.shippingAddress.recipientName,
        street: input.shippingAddress.street,
        city: input.shippingAddress.city,
        country: input.shippingAddress.country,
      },
      siteUrl,
      isNewCustomer,
    })
    await email.send({
      to: input.customer.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    })
  } catch (err) {
    console.error('Order confirmation email failed (non-fatal):', err)
  }

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    redirectUrl: payment.redirectUrl,
    immediatePaid: payment.immediate,
  }
}
