/**
 * @file FulfillmentView — branded fulfillment dashboard inside /admin
 * @summary Server component registered as a custom Payload admin view
 *          via `admin.components.views.fulfillment` in payload.config.ts.
 *          The path is `/fulfillment`, which Payload prefixes with the
 *          admin route to produce `/admin/fulfillment`.
 *
 *          Reuses the existing OrderRow client component (from
 *          src/components/admin/OrderRow.tsx) and the new shared
 *          loader from src/lib/admin/fulfillment.ts. The aliasing
 *          block at the bottom of admin-brand.css (Section 12)
 *          re-defines the storefront --color-* variables locally so
 *          OrderRow renders unchanged inside the admin.
 *
 *          Auth is handled by Payload's view runner — non-admin
 *          users get bounced to /admin/login automatically.
 *
 *          See: plan Phase 4.
 */
import type { AdminViewServerProps } from 'payload'
import { OrderRow, type OrderRowData } from '@/components/admin/OrderRow'
import { loadFulfillment } from '@/lib/admin/fulfillment'

export async function FulfillmentView(props: AdminViewServerProps) {
  const all = props.searchParams?.all
  const includeDelivered = typeof all === 'string' ? all === '1' : false
  const buckets = await loadFulfillment(props.payload, { includeDelivered })

  const total =
    buckets.awaitingForever.length +
    buckets.foreverPurchased.length +
    buckets.readyToPack.length +
    buckets.shipped.length +
    (includeDelivered ? buckets.delivered.length : 0)

  return (
    <div className="yarit-fulfillment" dir="rtl">
      <header className="yarit-fulfillment__head">
        <h1>ניהול הזמנות</h1>
        <p>כל הזמנה משולמת וממתינה לטיפול, מסודרת לפי דחיפות.</p>
      </header>

      <div className="yarit-stats">
        <Stat
          label="לטיפול מיידי"
          value={buckets.awaitingForever.length}
          urgent
        />
        <Stat label="נרכש, להכנה" value={buckets.foreverPurchased.length} />
        <Stat label="מוכן למשלוח" value={buckets.readyToPack.length} />
        <Stat label="נשלח" value={buckets.shipped.length} />
        <Stat label="נמסר ללקוח" value={buckets.delivered.length} />
      </div>

      <Section
        title="לטיפול דחוף — להזמין מפוראבר"
        emptyText="אין הזמנות שממתינות להזמנה מפוראבר 🌿"
        orders={buckets.awaitingForever}
      />
      <Section
        title="נרכש מפוראבר, ממתין לאריזה"
        emptyText=""
        orders={buckets.foreverPurchased}
      />
      <Section
        title="מוכן למשלוח"
        emptyText="אין הזמנות ממתינות לאריזה"
        orders={buckets.readyToPack}
      />
      <Section
        title="בדרך ללקוח"
        emptyText=""
        orders={buckets.shipped}
      />

      {includeDelivered && buckets.delivered.length > 0 && (
        <Section title="נמסר ללקוח" emptyText="" orders={buckets.delivered} />
      )}

      {total === 0 && (
        <div className="yarit-fulfillment__empty">
          {/* Watercolor illustration — the admin looks best with a
              scene to rest the eye when there's nothing to do.
              sprig-stamp has the same watercolor DNA as the other
              empty states across the storefront. */}
          <img
            src="/brand/ai/empty-shop.jpg"
            alt=""
            className="yarit-fulfillment__empty-img"
          />
          <p className="yarit-fulfillment__empty-title">
            אין הזמנות פעילות כרגע 🌿
          </p>
          <p className="yarit-fulfillment__empty-body">
            כל הזמנות הלקוחות מטופלות — מצוין!
            <br />
            בואי נשתה תה ונמתין ללקוחות חדשים.
          </p>
          <a
            href="/admin/collections/products"
            className="yarit-fulfillment__empty-cta"
          >
            בינתיים — לעדכן מוצרים ←
          </a>
        </div>
      )}

      <div className="yarit-fulfillment__toggle">
        <a
          href={
            includeDelivered
              ? '/admin/fulfillment'
              : '/admin/fulfillment?all=1'
          }
        >
          {includeDelivered ? 'הסתר הזמנות שנמסרו' : 'הצג הזמנות שנמסרו'}
        </a>
      </div>
    </div>
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
    <section className="yarit-fulfillment__section">
      <h2>
        {title}{' '}
        <span>({orders.length})</span>
      </h2>
      {orders.length === 0 ? (
        <p className="yarit-fulfillment__empty-line">{emptyText}</p>
      ) : (
        <ul>
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
  urgent,
}: {
  label: string
  value: number
  urgent?: boolean
}) {
  return (
    <div
      className={`yarit-stat${urgent && value > 0 ? ' yarit-stat--urgent' : ''}`}
    >
      <div className="yarit-stat__value">{value}</div>
      <div className="yarit-stat__label">{label}</div>
    </div>
  )
}
