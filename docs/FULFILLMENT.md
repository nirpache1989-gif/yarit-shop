# The Forever fulfillment workflow

> Phase E shipped the Fulfillment Dashboard at `/admin/fulfillment` (registered via `admin.components.views.fulfillment` in `src/payload.config.ts`; reusable loader at `src/lib/admin/fulfillment.ts`). This doc describes the workflow and state machine that dashboard implements.

## Summary

Yarit sells two categories of products on Copaia:

1. **Independent products** — she stocks them at home. Normal e-commerce fulfillment: order arrives, she picks from her own stock, packages, ships.
2. **Forever Living products** — she does NOT stock them. When an order arrives, she goes to Forever, buys the items at her distributor price, receives them at her home, then repackages and ships to the customer.

Both types go through the same customer-facing flow: add to cart → checkout → pay (via Meshulam or whichever gateway is chosen) → order confirmed. The difference only matters **to Yarit**, not to the customer.

## Order state machine (target)

```
orderStatus:
  pending  →  paid  →  (terminal: paid / cancelled / refunded)

fulfillmentStatus:
  pending
    │
    ▼  (order paid, has Forever items)
  awaiting_forever_purchase
    │
    ▼  (Yarit confirms she bought from Forever)
  forever_purchased
    │
    ▼  (Yarit packs the full order at home)
  packed
    │
    ▼  (Yarit hands to courier)
  shipped
    │
    ▼  (customer confirms or delivery tracking update)
  delivered
```

For an order with ONLY independent products, the flow skips the `awaiting_forever_purchase` and `forever_purchased` states and goes straight from `pending` → `packed` once payment is confirmed (assuming stock is available).

For a mixed order (Forever + independent items), the Forever workflow takes priority: the order is stuck in `awaiting_forever_purchase` until Yarit confirms she's sourced the Forever items.

## Fulfillment Dashboard (Phase E)

Custom admin view at `/admin/fulfillment`. See plan §5 for UX requirements. Key features:

- Sorted by newest unhandled order first
- Shows: order number, customer, items (with type indicator icon for Forever), total paid, status
- Action buttons: "סימנתי שרכשתי מפוראבר", "סימנתי שנארז", "סימנתי שנשלח"
- Filter: Forever-sourced / independent / all
- Mobile-first — Yarit should be able to handle an order from her phone

## Notifications

When a new order is paid, Yarit is notified via:
1. **Email** (Resend) — immediately on webhook receipt. Subject: order number + total. Body: item list + direct link to `/admin/fulfillment` on production. Filters allow her to route these into a dedicated inbox folder.
2. **In-admin badge** — when she opens `/admin`, a red count badge shows unhandled orders (`paid` + `fulfillmentStatus !== 'delivered'`).
3. **WhatsApp** (Phase G, optional) — via WhatsApp Business API or a relay service like CallMeBot.

The notification goes to Yarit only by default. If the developer wants a dev-time copy during Phase E testing, `ADMIN_NOTIFICATION_EMAIL` can be a comma-separated list.

## Cash flow implications (Yarit's awareness)

For Forever orders, Yarit receives the customer's full retail payment immediately, but has to pay Forever up-front to source the items. If Forever's turnaround is slow, she's floating the cash for a few days. This is usually fine for a small shop but should be tracked — the admin Fulfillment Dashboard could eventually show a "cash outstanding to Forever" summary.

Independent products have no such lag — she already owns the stock.

## Returns and warranty

Yarit is the merchant of record for **all** sales. Customers interact with her, not Forever. This means:
- Returns policy applies to both product types
- Warranty claims go through her (she then relays to Forever if needed)
- She needs to keep sales records for Israeli tax authority compliance (handled via Meshulam receipts + Payload Orders)

This is why T&Cs / Returns / Privacy policies are a launch blocker (see `docs/TASKS.md`).
