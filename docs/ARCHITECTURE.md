# Architecture

High-level system design for Shoresh. For the full product vision, see the plan file at `C:\Users\Ar1ma\.claude\plans\glimmering-scribbling-pudding.md`.

## System shape

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Customer browser                           │
│   Storefront (Hebrew/English) ──── Payload admin (Yarit only)       │
└──────────────────┬──────────────────────────────┬────────────────────┘
                   │                              │
                   │ HTTPS                        │ HTTPS
                   ▼                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Next.js 16 (App Router, deployed to Vercel)                        │
│                                                                      │
│  ┌─ (storefront)/[locale]/ ──────┐   ┌─ (payload)/ ───────────────┐  │
│  │  src/app/                     │   │  src/app/                  │  │
│  │  • home, shop, product, cart  │   │  • /admin (catch-all)      │  │
│  │  • checkout                   │   │  • /api/[...slug]          │  │
│  │  • /account                   │   │  • /api/graphql            │  │
│  │                               │   │                            │  │
│  │  next-intl (he default RTL)   │   │  Payload RootLayout        │  │
│  │  Heebo + Frank Ruhl Libre     │   │  Payload admin views       │  │
│  │  Zustand cart (Phase C)       │   │  Hebrew admin labels (E)   │  │
│  └───────────────┬───────────────┘   └───────────────┬────────────┘  │
│                  │                                    │              │
│                  └──────────────┬─────────────────────┘              │
│                                 ▼                                    │
│              payload.config.ts  (single-process Payload)             │
│              collections, globals, REST + GraphQL handlers           │
└─────────────────────────┬────────────────────────┬───────────────────┘
                          │                        │
                          ▼                        ▼
                ┌──────────────────┐      ┌──────────────────┐
                │  SQLite (dev)    │      │  Neon Postgres   │
                │  file:./…db      │      │  (production)    │
                └──────────────────┘      └──────────────────┘

                       External services (Phase D and later):
                       ┌─ Meshulam (payment) ─┐
                       ├─ Resend (email)      ─┤
                       └─ Cloudflare R2 (media)┘
```

## Route groups

Next.js App Router "route groups" (folders in parens) let us keep two independent root layouts in one project:

1. `(storefront)` — the customer-facing shop. All URLs here are under `/[locale]/…`. The root layout sets `<html lang dir>` based on locale, loads fonts, wraps children in `NextIntlClientProvider`, and mounts Header + Footer.

2. `(payload)` — Payload CMS's admin UI and REST/GraphQL API. All URLs here are `/admin/…` and `/api/…`. The root layout is Payload's own `RootLayout` which loads its admin CSS and server-function bridge.

There is **no** root `src/app/layout.tsx`. Each route group is its own root. The `src/middleware.ts` matcher excludes `/admin` and `/api` so next-intl never intercepts Payload traffic.

## Data model (target — most lives in Phase B+)

```
Products
  type: 'forever' | 'independent'   ← fulfillment source discriminator
  title (localized), slug, description, price, images, category, tags
  conditional (forever): foreverProductCode, foreverDistributorPrice
  conditional (independent): sku, stock, weightGrams, variants

Categories  — tree (self-relation)
Tags        — flat
Media       — Payload native uploads

Users (current minimal collection)
  role: 'admin' | 'customer'        ← gates admin UI access
  (Phase B adds: addresses[], phone, orders reverse relation)

Orders (Phase B+)
  orderNumber, customer, items[], subtotal, shippingCost, total
  paymentStatus, paymentProvider, paymentRef
  orderStatus     (pending | paid | cancelled)
  fulfillmentStatus (
    pending
    | awaiting_forever_purchase    ← Forever items need sourcing
    | forever_purchased
    | packed
    | shipped
    | delivered
  )
  fulfillmentNotes                   ← Yarit's free-text per order

SiteSettings (Payload global)
  logo, heroImages, announcementBar, whatsappNumber, email, phone
  address, businessTaxId
  social: { instagram, facebook, tiktok }
  shippingRates, freeShippingThreshold
```

`fulfillmentStatus` is deliberately separate from `orderStatus`: order status tracks **money**, fulfillment status tracks **physical goods**. A single order can be `paid` but still `awaiting_forever_purchase`.

## Internationalization

- `src/lib/i18n/routing.ts` — defines `locales: ['he', 'en']`, `defaultLocale: 'he'`, `localePrefix: 'as-needed'` (so `/` is Hebrew, `/en/...` is English).
- `src/lib/i18n/request.ts` — loads messages per locale for server components.
- `src/lib/i18n/navigation.ts` — re-exports `Link`, `redirect`, `useRouter`, etc. pre-wired to our routing config. **Always use this `Link`, never `next/link`.**
- `src/middleware.ts` — runs next-intl's middleware, excluding Payload routes.
- `src/messages/{he,en}.json` — all UI strings. Pattern: `namespace.key`.

## Payments (Phase D)

Abstracted through `src/lib/payments/provider.ts`:

```ts
interface PaymentProvider {
  createPayment(order: Order): Promise<{ redirectUrl: string; ref: string }>
  verifyWebhook(req: Request): Promise<{ ok: boolean; orderId?: string }>
}
```

The current implementation target is **Meshulam** (`src/lib/payments/meshulam.ts`). Swapping to Tranzila/CardCom/Grow is a new file that implements the same interface.

Routes in the storefront (`/api/checkout`, `/api/webhooks/meshulam`) go through the provider abstraction — never import `meshulam.ts` directly.

## Brand system

`src/brand.config.ts` is the single source of truth for brand data (name, colors, fonts, contact). The palette is mirrored into CSS variables and Tailwind v4 tokens inside `src/app/globals.css` `@theme` block. These two files **must** stay in sync manually — if you change a color in `brand.config.ts`, change the matching `--color-*` line in `globals.css`.

The logo is the watercolor tree + "Shoresh" wordmark from `assets/Logomain1.jpg`. It's served from `public/brand/logo-parchment.jpg` (original, used against the site's matching parchment background) and, optionally, `public/brand/logo.png` (transparent, after running `scripts/process-logo.py`).

## AI handoff (self-documentation)

This is a hard requirement from the project owner. The project must be fully understandable by a fresh AI session with zero context transfer.

- `CLAUDE.md` — Claude Code auto-loads this. Entry point with rules and pointers.
- `docs/STATE.md` — updated at the end of every work session.
- `docs/TASKS.md` — current TODO list.
- `docs/DECISIONS.md` — ADRs with dates.
- `docs/CONVENTIONS.md` — code style.
- `docs/ENVIRONMENT.md` — env vars + local setup.
- `docs/FULFILLMENT.md` — the Forever fulfillment workflow (populated in Phase E).
- `docs/BRAND.md` — brand rules.
- File-level JSDoc headers on critical files explaining purpose.

Every significant architectural decision gets an ADR in `docs/DECISIONS.md`.
