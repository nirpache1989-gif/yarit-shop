/**
 * @file /fulfillment — Yarit's custom fulfillment dashboard
 * @summary Server component. Fetches all active orders from Payload,
 *          groups them by urgency, and renders each as an `OrderRow`
 *          with inline action buttons to advance the fulfillment
 *          state machine.
 *
 *          Auth gate: uses `payload.auth({ headers })` to read the
 *          JWT cookie set by the Payload login. If the request isn't
 *          from an authenticated user with `role === 'admin'`, we
 *          redirect to `/admin` so Yarit lands on Payload's login.
 *
 *          Sections (in render order):
 *            1. Awaiting Forever purchase  (highest priority — Yarit
 *               needs to order from Forever before she can ship)
 *            2. Ready to pack               (all items at home)
 *            3. Already shipped             (waiting for delivery confirmation)
 *          Delivered orders are hidden unless `?all=1` query param.
 *
 *          Mobile-friendly: the row uses a flexible grid that
 *          collapses to a stacked layout below `md`.
 */
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { OrderRow, type OrderRowData } from '@/components/admin/OrderRow'
import { Container } from '@/components/ui/Container'

type User = {
  id: number | string
  email: string
  role: 'admin' | 'customer'
} | null

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ all?: string }>
}

export default async function FulfillmentPage({ searchParams }: Props) {
  const { all } = await searchParams
  const payload = await getPayload({ config })

  // Auth — admin only
  const { user } = (await payload.auth({
    headers: await headers(),
  })) as { user: User }

  if (!user) {
    redirect('/admin')
  }
  if (user.role !== 'admin') {
    redirect('/admin')
  }

  // Fetch active orders
  const where: Where = {
    paymentStatus: { equals: 'paid' },
  }
  if (!all) {
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
    res.docs.map(async (o) => {
      const raw = o as unknown as {
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
        customer: number | string | { name?: string; email?: string }
      }
      // Expand customer if not already populated
      let customerName: string | undefined
      let customerEmail: string | undefined
      if (typeof raw.customer === 'object' && raw.customer) {
        customerName = raw.customer.name
        customerEmail = raw.customer.email
      } else if (raw.customer) {
        try {
          const u = (await payload.findByID({
            collection: 'users',
            id: raw.customer as number,
            depth: 0,
          })) as { name?: string; email?: string }
          customerName = u.name
          customerEmail = u.email
        } catch {
          /* non-fatal */
        }
      }
      return {
        id: raw.id,
        orderNumber: raw.orderNumber,
        createdAt: raw.createdAt,
        total: raw.total,
        paymentStatus: raw.paymentStatus,
        fulfillmentStatus: raw.fulfillmentStatus,
        items: raw.items,
        shippingAddress: raw.shippingAddress,
        customerName,
        customerEmail,
      } satisfies OrderRowData
    }),
  )

  const awaitingForever = orders.filter(
    (o) => o.fulfillmentStatus === 'awaiting_forever_purchase',
  )
  const foreverPurchased = orders.filter(
    (o) => o.fulfillmentStatus === 'forever_purchased',
  )
  const readyToPack = orders.filter((o) => o.fulfillmentStatus === 'packed')
  const shipped = orders.filter((o) => o.fulfillmentStatus === 'shipped')
  const delivered = orders.filter((o) => o.fulfillmentStatus === 'delivered')

  return (
    <Container className="py-10 md:py-14">
      <header className="mb-8">
        <h1
          className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary-dark)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ניהול הזמנות
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          כל הזמנה משולמת וממתינה לטיפול, מסודרת לפי דחיפות.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        <Stat label="לטיפול מיידי" value={awaitingForever.length} tone="accent" />
        <Stat label="נרכש, להכנה" value={foreverPurchased.length} tone="muted" />
        <Stat label="מוכן למשלוח" value={readyToPack.length} tone="primary" />
        <Stat label="נשלח" value={shipped.length} tone="muted" />
        <Stat label="הושלם" value={delivered.length} tone="muted" />
      </div>

      <Section
        title="לטיפול דחוף — להזמין מפוראבר"
        emptyText="אין הזמנות שממתינות להזמנה מפוראבר 🌿"
        orders={awaitingForever}
      />

      <Section
        title="נרכש מפוראבר, ממתין לאריזה"
        emptyText=""
        orders={foreverPurchased}
      />

      <Section
        title="מוכן למשלוח"
        emptyText="אין הזמנות ממתינות לאריזה"
        orders={readyToPack}
      />

      <Section
        title="בדרך ללקוח"
        emptyText=""
        orders={shipped}
      />

      {all && delivered.length > 0 && (
        <Section title="הושלם" emptyText="" orders={delivered} />
      )}

      {orders.length === 0 && (
        <div className="py-20 text-center text-[var(--color-muted)]">
          <p className="text-xl">אין הזמנות פעילות כרגע 🌿</p>
          <p className="text-sm mt-2">כל הזמנות הלקוחות מטופלות — מצוין!</p>
        </div>
      )}

      <div className="mt-10 text-center">
        <a
          href={all ? '/fulfillment' : '/fulfillment?all=1'}
          className="text-sm text-[var(--color-muted)] underline hover:text-[var(--color-primary-dark)]"
        >
          {all ? 'הסתר הזמנות שהושלמו' : 'הצג הזמנות שהושלמו'}
        </a>
      </div>
    </Container>
  )
}

function Section({
  title,
  emptyText,
  orders,
}: {
  title: string
  emptyText: string
  orders: OrderRowData[]
}) {
  if (orders.length === 0 && !emptyText) return null
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-[var(--color-primary-dark)] mb-3">
        {title}{' '}
        <span className="text-sm text-[var(--color-muted)] font-normal">
          ({orders.length})
        </span>
      </h2>
      {orders.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)] py-4">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </ul>
      )}
    </section>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'primary' | 'accent' | 'muted'
}) {
  const toneClass =
    tone === 'accent'
      ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent-deep)]'
      : tone === 'primary'
        ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]'
        : 'border-[var(--color-border-brand)] bg-[var(--color-surface)] text-[var(--color-muted)]'
  return (
    <div className={`rounded-2xl border ${toneClass} p-4`}>
      <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
        {value}
      </div>
      <div className="text-xs mt-1">{label}</div>
    </div>
  )
}
