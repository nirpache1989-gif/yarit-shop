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
 *          Wave B6 (pre-launch hardening):
 *            - Bumped the hard cap from 200 to 500 and added a
 *              `totalDocs` passthrough so the view can warn Yarit if
 *              she ever gets close to the limit. Real pagination is
 *              a follow-up; at Shoresh's scale 500 is more than a
 *              year's worth of orders.
 *            - Dropped the per-row `findByID` fallback for customer
 *              lookup (old N+1 hot-spot). `depth: 1` already asks
 *              Payload to populate the `customer` relationship, so
 *              the fallback was only running when the main query
 *              came back without a populated relation — which was
 *              itself a bug. We now rely on `depth: 1` and log a
 *              `console.warn` if it ever fails (shouldn't, but we
 *              want to see it in the server logs if it does).
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
  /** Total number of paid orders in the active view. If this hits
   *  FULFILLMENT_CAP the dashboard should show "showing X of Y"
   *  to Yarit so she knows older rows are hidden. */
  totalDocs: number
  /** The cap we queried under — lets the caller compare totalDocs
   *  vs. the limit without hardcoding the number. */
  cap: number
}

// 500 covers ~16 months of orders at Shoresh's expected scale
// (~1 order/day). Real cursor pagination is a post-launch follow-up.
const FULFILLMENT_CAP = 500

type PopulatedCustomer = {
  id?: number | string
  name?: string
  email?: string
}

type RawOrder = {
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
  customer: number | string | PopulatedCustomer | null
}

function toCustomerView(
  customer: RawOrder['customer'],
): { name?: string; email?: string } {
  if (customer && typeof customer === 'object') {
    return {
      name: customer.name,
      email: customer.email,
    }
  }
  // Primitive ID means depth: 1 failed to populate the relation. Log
  // so we notice in server logs, but don't block the row — the admin
  // row has a shippingAddress.recipientName fallback.
  if (customer) {
    console.warn(
      'fulfillment.loadFulfillment: customer relationship did not populate under depth:1 — check Orders.collection config',
      { customerId: customer },
    )
  }
  return {}
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
    limit: FULFILLMENT_CAP,
    sort: '-createdAt',
  })

  const orders: OrderRowData[] = (res.docs as unknown as RawOrder[]).map(
    (o) => {
      const customerView = toCustomerView(o.customer)
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        total: o.total,
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentStatus,
        items: o.items,
        shippingAddress: o.shippingAddress,
        customerName: customerView.name,
        customerEmail: customerView.email,
      } satisfies OrderRowData
    },
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
    totalDocs: res.totalDocs ?? orders.length,
    cap: FULFILLMENT_CAP,
  }
}
