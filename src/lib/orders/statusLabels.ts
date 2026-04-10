/**
 * @file Order status labels — single source of truth
 * @summary Centralizes the Hebrew + English labels for the order
 *          state-machine enums (`paymentStatus` and `fulfillmentStatus`).
 *          Replaces the duplication that previously lived between
 *          `src/collections/Orders.ts` (admin form labels) and
 *          `src/components/admin/OrderRow.tsx` (the local STATUS_HE map).
 *
 *          Used by:
 *            - `src/components/admin/OrderRow.tsx` — admin fulfillment chip
 *            - `src/components/account/OrderList.tsx` — customer order list
 *            - `src/components/account/OrderTimeline.tsx` — customer detail page
 *            - any future order surface that shows a status to a human
 *
 *          The DB enum values (the keys here) are immutable — they map
 *          1:1 to the option `value` fields on `Orders.paymentStatus`
 *          and `Orders.fulfillmentStatus`. Only the labels live here.
 *          If you change a label, sync `Orders.ts` so the admin form
 *          stays consistent (the field option labels are read by
 *          Payload directly, not from this file).
 */

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type FulfillmentStatus =
  | 'pending'
  | 'awaiting_forever_purchase'
  | 'forever_purchased'
  | 'packed'
  | 'shipped'
  | 'delivered'

export type StatusLocale = 'he' | 'en'

const PAYMENT_STATUS_LABELS: Record<
  StatusLocale,
  Record<PaymentStatus, string>
> = {
  he: {
    pending: 'ממתין',
    paid: 'שולם',
    failed: 'נכשל',
    refunded: 'הוחזר',
  },
  en: {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  },
}

const FULFILLMENT_STATUS_LABELS: Record<
  StatusLocale,
  Record<FulfillmentStatus, string>
> = {
  he: {
    pending: 'ממתין',
    awaiting_forever_purchase: 'להזמין מפוראבר',
    forever_purchased: 'נרכש מפוראבר',
    packed: 'ארוז ומוכן',
    shipped: 'בדרך ללקוח',
    delivered: 'נמסר ללקוח',
  },
  en: {
    pending: 'Pending',
    awaiting_forever_purchase: 'Awaiting Forever purchase',
    forever_purchased: 'Forever purchased',
    packed: 'Packed',
    shipped: 'Shipped',
    delivered: 'Delivered',
  },
}

export function getPaymentStatusLabel(
  status: PaymentStatus | string,
  locale: StatusLocale = 'he',
): string {
  const dict = PAYMENT_STATUS_LABELS[locale] ?? PAYMENT_STATUS_LABELS.he
  return dict[status as PaymentStatus] ?? status
}

export function getFulfillmentStatusLabel(
  status: FulfillmentStatus | string,
  locale: StatusLocale = 'he',
): string {
  const dict = FULFILLMENT_STATUS_LABELS[locale] ?? FULFILLMENT_STATUS_LABELS.he
  return dict[status as FulfillmentStatus] ?? status
}

/**
 * Step sequences for the visual fulfillment timeline on the customer
 * order-detail page. Two variants because Forever orders go through
 * the extra "awaiting → purchased" pre-steps before they reach the
 * normal pack/ship/deliver flow.
 *
 * The order matches the state-machine in Orders.ts and the buttons in
 * OrderRow.tsx — keep all three in sync if the workflow changes.
 */
export const FULFILLMENT_STEPS_BASE: FulfillmentStatus[] = [
  'pending',
  'packed',
  'shipped',
  'delivered',
]

export const FULFILLMENT_STEPS_FOREVER: FulfillmentStatus[] = [
  'pending',
  'awaiting_forever_purchase',
  'forever_purchased',
  'packed',
  'shipped',
  'delivered',
]

/**
 * Returns the index of `status` inside the appropriate step sequence
 * (Forever or base). Steps with index ≤ result are "complete or
 * current". Returns 0 if the status doesn't appear in the sequence.
 */
export function getCurrentStepIndex(
  status: FulfillmentStatus | string,
  hasForever: boolean,
): number {
  const steps = hasForever ? FULFILLMENT_STEPS_FOREVER : FULFILLMENT_STEPS_BASE
  const idx = steps.indexOf(status as FulfillmentStatus)
  return idx >= 0 ? idx : 0
}

export function getFulfillmentStepsFor(
  hasForever: boolean,
): FulfillmentStatus[] {
  return hasForever ? FULFILLMENT_STEPS_FOREVER : FULFILLMENT_STEPS_BASE
}

// ─── Customer-facing labels ─────────────────────────────────────────
//
// Everything below this line is the customer side of the story.
// Admins use the labels above, which match Yarit's operational
// vocabulary ("להזמין מפוראבר", "נרכש מפוראבר"). Customers don't
// care about the Forever sourcing pipeline — they just want to know
// "where is my package?". So we collapse the 6 internal states into
// 4 customer-friendly buckets:
//
//   DB status                     Customer step    Customer label (he)
//   ─────────────────────────────  ───────────────  ────────────────────
//   pending                        received         ההזמנה התקבלה
//   awaiting_forever_purchase      preparing        בהכנה
//   forever_purchased              preparing        בהכנה
//   packed                         preparing        בהכנה
//   shipped                        shipped          בדרך אלייך
//   delivered                      delivered        נמסרה
//
// The customer timeline always has these 4 steps regardless of
// whether the order has Forever items — that's an internal detail
// the customer shouldn't need to understand. The admin fulfillment
// dashboard (OrderRow.tsx, FulfillmentView.tsx) keeps its 6-step
// operational view because Yarit DOES need to act on each state
// individually.

export type CustomerFulfillmentStep =
  | 'received'
  | 'preparing'
  | 'shipped'
  | 'delivered'

export const CUSTOMER_FULFILLMENT_STEPS: CustomerFulfillmentStep[] = [
  'received',
  'preparing',
  'shipped',
  'delivered',
]

const CUSTOMER_STEP_LABELS: Record<
  StatusLocale,
  Record<CustomerFulfillmentStep, string>
> = {
  he: {
    received: 'ההזמנה התקבלה',
    preparing: 'בהכנה',
    shipped: 'בדרך אלייך',
    delivered: 'נמסרה',
  },
  en: {
    received: 'Order received',
    preparing: 'Preparing',
    shipped: 'On the way',
    delivered: 'Delivered',
  },
}

export function getCustomerStepFor(
  status: FulfillmentStatus | string,
): CustomerFulfillmentStep {
  switch (status) {
    case 'pending':
      return 'received'
    case 'awaiting_forever_purchase':
    case 'forever_purchased':
    case 'packed':
      return 'preparing'
    case 'shipped':
      return 'shipped'
    case 'delivered':
      return 'delivered'
    default:
      return 'received'
  }
}

export function getCustomerStepLabel(
  step: CustomerFulfillmentStep,
  locale: StatusLocale = 'he',
): string {
  const dict = CUSTOMER_STEP_LABELS[locale] ?? CUSTOMER_STEP_LABELS.he
  return dict[step]
}

/**
 * Customer-facing label for a given DB fulfillment status. Uses the
 * same 4 buckets as the timeline so the badge on the order list and
 * the current step on the detail page always agree.
 */
export function getCustomerFulfillmentStatusLabel(
  status: FulfillmentStatus | string,
  locale: StatusLocale = 'he',
): string {
  return getCustomerStepLabel(getCustomerStepFor(status), locale)
}

/**
 * Index of the current step within `CUSTOMER_FULFILLMENT_STEPS`, for
 * the visual timeline (steps before the current index render as
 * "complete"; the current index highlights; steps after are
 * upcoming).
 */
export function getCustomerCurrentStepIndex(
  status: FulfillmentStatus | string,
): number {
  const step = getCustomerStepFor(status)
  const idx = CUSTOMER_FULFILLMENT_STEPS.indexOf(step)
  return idx >= 0 ? idx : 0
}
