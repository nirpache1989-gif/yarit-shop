# The fulfillment workflow

> Phase E shipped the Fulfillment Dashboard at `/admin/fulfillment` (registered via `admin.components.views.fulfillment` in `src/payload.config.ts`; reusable loader at `src/lib/admin/fulfillment.ts`). ADR-019 (2026-04-11) collapsed the state machine from 6 states to 4 and removed every Forever-brand admin label. ADR-020 (2026-04-11) renamed the shop from Shoresh to Copaia. This doc describes the workflow as it is today.

## Summary

Yarit sells two categories of products on Copaia:

1. **Stocked products** (`type: 'stocked'`) — Yarit keeps these at home. The `Products.stock` field tracks current inventory and the admin warns her when stock drops below 5.
2. **Sourced products** (`type: 'sourced'`) — Yarit orders these from her supplier when a customer buys. No local inventory, no stock tracking. The admin form hides the `stock` field for these items.

Both types go through the **same** customer-facing flow: add to cart → checkout → pay (Meshulam or whichever gateway is active) → order confirmed. And both types go through the **same** fulfillment pipeline on Yarit's side. The `stocked` vs `sourced` distinction is purely a product-level concern that controls stock-tracking visibility in the admin — it does NOT affect orders, cart, checkout, or the fulfillment state machine.

When Yarit opens a paid order she glances at the line items and knows by muscle memory which ones need sourcing from her supplier. The system does not need to enforce this as a workflow state. (See ADR-019 for the rationale.)

## Order state machine

```
orderStatus:
  pending  →  paid  →  (terminal: paid / cancelled / refunded)

fulfillmentStatus:
  pending
    │
    ▼  (order paid — hardcoded jump in lib/checkout.ts)
  packed
    │
    ▼  (Yarit clicks "סימנתי שנארז" in /admin/fulfillment)
  shipped
    │
    ▼  (Yarit clicks "סימנתי שנשלח" OR delivery tracking update)
  delivered
```

**Key mechanics:**

- Every paid order jumps straight to `packed` the moment payment is confirmed. There's no longer a "waiting on supplier" bucket — that was the `awaiting_forever_purchase` state in the pre-ADR-019 workflow, removed because Yarit found it redundant. Sourced items are still sourced per-order in real life; the system just doesn't model that as a workflow state.
- `pending` exists only as a transient value between order creation and payment confirmation. Once the payment webhook fires, `checkout.ts` sets `fulfillmentStatus = 'packed'` in the same transaction as `paymentStatus = 'paid'`.
- The customer-facing `OrderTimeline` component collapses `pending` + `packed` into a single "preparing your order" step so the customer doesn't see intermediate admin states.

## Fulfillment Dashboard (`/admin/fulfillment`)

Custom admin view registered via `admin.components.views.fulfillment`. Loader at `src/lib/admin/fulfillment.ts`, view component at `src/components/admin/payload/FulfillmentView.tsx`.

**Layout:**

- **Stat row** at the top — "להכין ולשלוח" (to-handle), "בדרך ללקוחה" (in transit), "נמסרו" (delivered)
- **3 bucket sections** rendered one below the other:
  1. **להכין ולשלוח** — `pending` + `packed` orders. This is the "action required" bucket; both states share the same bucket for robustness in case a transient row stays stuck at `pending`.
  2. **בדרך ללקוחה** — `shipped` orders, waiting for delivery confirmation.
  3. **נמסרו** — `delivered` orders, for reference / history.

**Row actions:**

- "סימנתי שנארז" (marked as packed) — advances `pending → packed` if Yarit needs to nudge a stuck row manually.
- "סימנתי שנשלח" (marked as shipped) — advances `packed → shipped`. This is the most-clicked button.
- "סימנתי שנמסר" (marked as delivered) — advances `shipped → delivered`. Typically fires automatically from a delivery tracking webhook if one is wired up, but Yarit can click it manually.

**Pagination cap:** 500 rows per query (see `FULFILLMENT_CAP` in `lib/admin/fulfillment.ts`). At Copaia's expected scale (~1 order/day) that's ~16 months of orders, well above any practical working window. Real cursor pagination is a post-launch follow-up.

**Mobile-first:** The view works at 375px (iPhone SE) — Yarit can handle an order from her phone.

## Notifications

When a new order is paid, Yarit is notified via:

1. **Email** (Resend) — fires from the Orders `afterChange` hook on `paymentStatus: 'paid'`. Subject: `קופאה — הזמנה חדשה`. Body: order number, customer, item list (no Forever badges — every item renders the same), total, and a direct link to `/admin/fulfillment`. Template lives at `src/lib/email/adminTemplates.ts`.
2. **In-admin badge** — `/admin` dashboard shows a red count badge on the "ההזמנות החדשות" tile when there are paid-but-unfulfilled orders.
3. **Dashboard recent-orders section** (2026-04-11 Track B.3) — shows the 3 most recent paid orders with quick links to each order's edit page, visible right below the stats row.

The admin-alert email goes to `SiteSettings.contact.email` by default, with an `ADMIN_NOTIFICATION_EMAIL` env var override for multi-recipient routing during launch.

## Returns and warranty

Yarit is the merchant of record for **every** sale regardless of product type. Customers interact with her, not with her supplier. This means:

- Returns policy applies uniformly to all products
- Warranty claims go through her (she then relays to her supplier if needed for sourced items)
- She keeps sales records for Israeli tax authority compliance (handled via Meshulam receipts + Payload Orders)

The legal markdown under `content/legal/{privacy,returns,shipping,terms}/` covers this — but those folders are still empty pending input from Yarit's lawyer (see `docs/TASKS.md`).
