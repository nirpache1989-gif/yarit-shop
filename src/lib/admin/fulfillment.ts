/**
 * @file fulfillment.ts — shared fulfillment data loader
 * @summary Server-only helper that fetches paid orders and groups
 *          them by `fulfillmentStatus`. Used by the
 *          `/admin/fulfillment` custom Payload view.
 *          The auth gate is the caller's responsibility — inside
 *          /admin/* Payload's view runner already enforces it.
 *
 *          (The legacy `/fulfillment` route in `(admin-tools)` was
 *          deleted in Round 5 — everything lives inside `/admin`
 *          now so it picks up the branded chrome automatically.)
 *
 *          See: plan Phase 4.2.
 */
import type { Payload, Where } from 'payload'
import type { OrderRowData } from '@/components/admin/OrderRow'

export type FulfillmentBuckets = {
  awaitingForever: OrderRowData[]
  foreverPurchased: OrderRowData[]
  readyToPack: OrderRowData[]
  shipped: OrderRowData[]
  delivered: OrderRowData[]
}

export async function loadFulfillment(
  payload: Payload,
  opts: { includeDelivered: boolean },
): Promise<FulfillmentBuckets> {
  const where: Where = { paymentStatus: { equals: 'paid' } }
  if (!opts.includeDelivered) {
    where.fulfillmentStatus = { not_equals: 'delivered' }
  }

  const res = await payload.find({
    collection: 'orders',
    where,
    depth: 1,
    limit: 200,
    sort: '-createdAt',
  })

  const orders = await Promise.all(
    res.docs.map(async (raw: unknown) => {
      const o = raw as {
        id: number | string
        orderNumber: string
        createdAt: string
        total: number
        paymentStatus: string
        fulfillmentStatus: OrderRowData['fulfillmentStatus']
        items: Array<{
          title: string
          quantity: number
          productType: 'forever' | 'independent'
        }>
        shippingAddress: {
          recipientName: string
          phone: string
          street: string
          city: string
          country: string
        }
        customer: number | string | { name?: string; email?: string } | null
      }
      let customerName: string | undefined
      let customerEmail: string | undefined
      if (typeof o.customer === 'object' && o.customer) {
        customerName = o.customer.name
        customerEmail = o.customer.email
      } else if (o.customer) {
        try {
          const u = (await payload.findByID({
            collection: 'users',
            id: o.customer as number,
            depth: 0,
          })) as { name?: string; email?: string }
          customerName = u.name
          customerEmail = u.email
        } catch {
          /* non-fatal */
        }
      }
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        total: o.total,
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentStatus,
        items: o.items,
        shippingAddress: o.shippingAddress,
        customerName,
        customerEmail,
      } satisfies OrderRowData
    }),
  )

  return {
    awaitingForever: orders.filter(
      (o) => o.fulfillmentStatus === 'awaiting_forever_purchase',
    ),
    foreverPurchased: orders.filter(
      (o) => o.fulfillmentStatus === 'forever_purchased',
    ),
    readyToPack: orders.filter((o) => o.fulfillmentStatus === 'packed'),
    shipped: orders.filter((o) => o.fulfillmentStatus === 'shipped'),
    delivered: orders.filter((o) => o.fulfillmentStatus === 'delivered'),
  }
}
