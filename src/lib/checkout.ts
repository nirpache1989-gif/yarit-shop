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
import type { Payload } from 'payload'
import { getPaymentProvider } from '@/lib/payments'
import { getEmailProvider } from '@/lib/email'
import { renderOrderConfirmationEmail } from '@/lib/email/templates'
import { countryToRegion, getShippingRatesForRegion } from '@/lib/shipping'
import { STATIC_IMAGE_OVERRIDES } from '@/lib/product-image'

export type CheckoutInput = {
  locale: 'he' | 'en'
  siteUrl: string
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
  if (!customer) {
    const randomPassword =
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
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
  const provider = getPaymentProvider()
  const successUrl = `${input.siteUrl}/${input.locale === 'he' ? '' : 'en/'}checkout/success?order=${order.id}`
  const cancelUrl = `${input.siteUrl}/${input.locale === 'he' ? '' : 'en/'}checkout`

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
      siteUrl: input.siteUrl,
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
