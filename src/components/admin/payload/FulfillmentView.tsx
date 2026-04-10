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
import Link from 'next/link'
import Image from 'next/image'
import { OrderRow, type OrderRowData } from '@/components/admin/OrderRow'
import { loadFulfillment } from '@/lib/admin/fulfillment'
import { CountUp } from '@/components/motion/CountUp'

// Wave F motion:
//   - Stat values count up from 0 on mount via CountUp.
//   - Each bucket section fades up with a small per-bucket stagger
//     (0ms / 120ms / 240ms / 360ms) so the page reads as "bucket
//     sorting with quiet pride" rather than a dump of divs.
//   - The urgent "awaiting forever" bucket wraps its header in a
//     .yarit-fulfillment__bucket--urgent ring that slowly pulses.
//   - The near-cap warning banner slides down from the top via
//     .yarit-near-cap-banner.
//
//   Keyframes + reduced-motion guards live in admin-brand.css.

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

  // Wave B6: surface a warning if Yarit ever has more paid orders
  // than the loader's hard cap can return. At her current scale
  // (~1/day) she won't hit 500 for well over a year, but the
  // warning means we catch it BEFORE silently hiding rows.
  const nearCap = buckets.totalDocs >= buckets.cap

  return (
    <div className="yarit-fulfillment" dir="rtl">
      <header className="yarit-fulfillment__head">
        <h1>ניהול הזמנות</h1>
        <p>כל הזמנה משולמת וממתינה לטיפול, מסודרת לפי דחיפות.</p>
        {nearCap && (
          <p
            className="yarit-near-cap-banner"
            style={{
              marginTop: 8,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--color-accent, #8B5A2B)/15',
              color: 'var(--color-accent-deep, #8B5A2B)',
              fontSize: 13,
            }}
          >
            הערה: מוצגות {buckets.cap} ההזמנות האחרונות מתוך {buckets.totalDocs} סה״כ. הזמנות ישנות יותר מוסתרות כרגע — ניר, שימי לב לזה.
          </p>
        )}
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
        delay={0}
        urgent
      />
      <Section
        title="נרכש מפוראבר, ממתין לאריזה"
        emptyText=""
        orders={buckets.foreverPurchased}
        delay={120}
      />
      <Section
        title="מוכן למשלוח"
        emptyText="אין הזמנות ממתינות לאריזה"
        orders={buckets.readyToPack}
        delay={240}
      />
      <Section
        title="בדרך ללקוח"
        emptyText=""
        orders={buckets.shipped}
        delay={360}
      />

      {includeDelivered && buckets.delivered.length > 0 && (
        <Section
          title="נמסר ללקוח"
          emptyText=""
          orders={buckets.delivered}
          delay={480}
        />
      )}

      {total === 0 && (
        <div className="yarit-fulfillment__empty">
          {/* Watercolor illustration — the admin looks best with a
              scene to rest the eye when there's nothing to do.
              sprig-stamp has the same watercolor DNA as the other
              empty states across the storefront. */}
          <Image
            src="/brand/ai/empty-shop.jpg"
            alt=""
            width={320}
            height={240}
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
          <Link
            href="/admin/collections/products"
            className="yarit-fulfillment__empty-cta"
          >
            בינתיים — לעדכן מוצרים ←
          </Link>
        </div>
      )}

      <div className="yarit-fulfillment__toggle">
        <Link
          href={
            includeDelivered
              ? '/admin/fulfillment'
              : '/admin/fulfillment?all=1'
          }
        >
          {includeDelivered ? 'הסתר הזמנות שנמסרו' : 'הצג הזמנות שנמסרו'}
        </Link>
      </div>
    </div>
  )
}

function Section({
  title,
  emptyText,
  orders,
  delay = 0,
  urgent = false,
}: {
  title: string
  emptyText: string
  orders: OrderRowData[]
  delay?: number
  urgent?: boolean
}) {
  if (orders.length === 0 && !emptyText) return null
  return (
    <section
      className={`yarit-fulfillment__section yarit-fulfillment__bucket--enter${
        urgent && orders.length > 0 ? ' yarit-fulfillment__bucket--urgent' : ''
      }`}
      style={{ ['--yarit-bucket-delay' as string]: `${delay}ms` }}
    >
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
      <div className="yarit-stat__value">
        <CountUp value={value} duration={900} locale="he-IL" />
      </div>
      <div className="yarit-stat__label">{label}</div>
    </div>
  )
}
