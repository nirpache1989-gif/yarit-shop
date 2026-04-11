/**
 * @file YaritDashboard — replaces Payload's default /admin view
 * @summary Server component that renders a warm Hebrew welcome,
 *          a stats row (open orders / urgent / products / drafts /
 *          low-stock / customers), and a tile grid pointing at the
 *          most common Yarit tasks.
 *
 *          Wired via `admin.components.views.dashboard.Component`
 *          in payload.config.ts. Receives `AdminViewServerProps`
 *          which exposes `payload: Payload` directly — we use it
 *          for parallel `payload.count()` queries with no extra
 *          HTTP roundtrip.
 *
 *          Styles live in `.yarit-dashboard / .yarit-stats / .yarit-tile`
 *          rules in `src/app/(payload)/admin-brand.css`.
 *
 *          See: plan Phase 2.
 */
import type { AdminViewServerProps, Payload } from 'payload'
import Link from 'next/link'
import { CountUp } from '@/components/motion/CountUp'
// Round 5 Fix 2.4: WelcomeBanner removed — it duplicated
// SidebarGreeting's "ברוכה הבאה לפאנל הניהול" message and wasted
// dashboard space above the stats row. The component file itself
// is kept on disk for a one-session grace period in case we want
// it back. See: docs/ADMIN-SURFACES.md + Round 5 plan Fix 2.4.
//
// Wave D motion polish: stat values count up from 0 on mount via
// CountUp (client component). Tile stagger bumped to 90ms to match
// the storefront vocabulary. Urgent stat tiles + dark-mode
// background styles live in admin-brand.css.

type Stats = {
  openOrders: number
  publishedProducts: number
  draftProducts: number
  lowStock: number
  customers: number
}

/** 2026-04-11 Track B.3 — recent orders section.
 *  Shape of a single row in the "Recent orders" list below the stats
 *  grid. Deliberately minimal — we only need enough to render a
 *  1-line preview + a link to the full order edit page. */
type RecentOrder = {
  id: number | string
  orderNumber: string
  createdAt: string
  total: number
  customerLabel: string
  itemSummary: string
  fulfillmentStatus: string
}

/**
 * Time-synced Hebrew greeting for Yarit. Uses Asia/Jerusalem so it
 * matches her local day-of-time regardless of where the server runs.
 * The emoji decorates the phrase; a modern Hebrew screen reader will
 * still read it gracefully ("בוקר טוב ירית שמש").
 */
function greet(): { hello: string; emoji: string; subtitle: string } {
  const hour = new Date().toLocaleString('he-IL', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit',
    hour12: false,
  })
  const h = parseInt(hour, 10)
  if (h < 6)
    return {
      hello: 'לילה טוב ירית',
      emoji: '🌙',
      subtitle: 'קצת עבודה לילית? כאן הכל מחכה לך.',
    }
  if (h < 12)
    return {
      hello: 'בוקר טוב ירית',
      emoji: '☀️',
      subtitle: 'בוקר חדש, חנות חדשה. בחרי מה לעדכן היום.',
    }
  if (h < 18)
    return {
      hello: 'צהריים טובים ירית',
      emoji: '🌿',
      subtitle: 'נעים לראות אותך. מה מעדכנים היום בחנות?',
    }
  return {
    hello: 'ערב טוב ירית',
    emoji: '🌸',
    subtitle: 'הגיע הזמן לסגירת יום. יש משהו שצריך לטפל בו?',
  }
}

async function getStats(payload: Payload): Promise<Stats> {
  const [openOrders, published, draft, lowStock, customers] =
    await Promise.all([
      payload.count({
        collection: 'orders',
        where: {
          and: [
            { paymentStatus: { equals: 'paid' } },
            { fulfillmentStatus: { not_equals: 'delivered' } },
          ],
        },
      }),
      payload.count({
        collection: 'products',
        where: { status: { equals: 'published' } },
      }),
      payload.count({
        collection: 'products',
        where: { status: { equals: 'draft' } },
      }),
      payload.count({
        collection: 'products',
        where: {
          and: [
            { type: { equals: 'stocked' } },
            { stock: { less_than: 5 } },
          ],
        },
      }),
      payload.count({
        collection: 'users',
        where: { role: { equals: 'customer' } },
      }),
    ])

  return {
    openOrders: openOrders.totalDocs,
    publishedProducts: published.totalDocs,
    draftProducts: draft.totalDocs,
    lowStock: lowStock.totalDocs,
    customers: customers.totalDocs,
  }
}

/** 2026-04-11 Track B.3 — fetch the 3 most recent paid orders for
 *  the dashboard's "recent orders" section. Uses `depth: 1` so the
 *  `customer` relationship populates in a single query (same pattern
 *  as loadFulfillment()). Returns an empty array on any failure so
 *  the dashboard still renders.
 *
 *  Short-lived on the server, never reaches the client — the
 *  component that consumes this is itself a server component. */
async function getRecentOrders(payload: Payload): Promise<RecentOrder[]> {
  try {
    const res = await payload.find({
      collection: 'orders',
      where: { paymentStatus: { equals: 'paid' } },
      sort: '-createdAt',
      limit: 3,
      depth: 1,
    })
    return res.docs.map((doc: Record<string, unknown>) => {
      const customer = doc.customer as
        | { name?: string; email?: string }
        | string
        | number
        | null
      const shippingAddress = doc.shippingAddress as
        | { recipientName?: string }
        | undefined
      const customerName =
        (customer && typeof customer === 'object' && customer.name) ||
        shippingAddress?.recipientName ||
        ''
      const customerEmail =
        (customer && typeof customer === 'object' && customer.email) || ''
      const customerLabel = customerName || customerEmail || 'לקוחה'
      const items = (doc.items as Array<{ title?: string; quantity?: number }>) ?? []
      const firstItem = items[0]
      const itemSummary = firstItem
        ? items.length === 1
          ? `${firstItem.title ?? ''}${firstItem.quantity && firstItem.quantity > 1 ? ` × ${firstItem.quantity}` : ''}`
          : `${firstItem.title ?? ''} +${items.length - 1}`
        : 'אין פריטים'
      return {
        id: doc.id as number | string,
        orderNumber: (doc.orderNumber as string) ?? `#${doc.id}`,
        createdAt: (doc.createdAt as string) ?? '',
        total: (doc.total as number) ?? 0,
        customerLabel,
        itemSummary,
        fulfillmentStatus: (doc.fulfillmentStatus as string) ?? 'pending',
      }
    })
  } catch (err) {
    console.warn(
      'YaritDashboard.getRecentOrders: payload.find failed — rendering empty section',
      err instanceof Error ? err.message : err,
    )
    return []
  }
}

const FULFILLMENT_LABEL_HE: Record<string, string> = {
  pending: 'בהמתנה',
  packed: 'מוכנה למשלוח',
  shipped: 'בדרך ללקוחה',
  delivered: 'נמסרה',
}

type Tile = {
  href: string
  icon: string
  title: string
  hint: string
  cta: string
  accent?: boolean
  badge?: number
}

function buildTiles(stats: Stats): Tile[] {
  return [
    {
      href: '/admin/fulfillment',
      icon: '📦',
      title: 'ההזמנות החדשות',
      hint: 'כל הזמנה משולמת שמחכה לטיפול — ממוין לפי דחיפות.',
      cta: 'לטיפול בהזמנות',
      accent: true,
      badge: stats.openOrders > 0 ? stats.openOrders : undefined,
    },
    {
      href: '/admin/collections/products',
      icon: '🌿',
      title: 'המוצרים שלי',
      hint: 'עריכה של כל המוצרים בחנות.',
      cta: 'פתיחת רשימת המוצרים',
    },
    {
      href: '/admin/collections/products/create',
      icon: '➕',
      title: 'הוספת מוצר חדש',
      hint: 'מוסיפים מוצר חדש לחנות.',
      cta: 'התחלה',
    },
    {
      href: '/admin/collections/categories',
      icon: '🗂',
      title: 'קטגוריות',
      hint: 'איך המוצרים מקובצים בחנות.',
      cta: 'ניהול קטגוריות',
    },
    // Round 5 Fix 2.2: The "תמונות וגלריה" (gallery) tile was
    // removed. Yarit uploads images through the inline image picker
    // on each product/category form; a standalone gallery upload
    // had no user-facing effect and caused confusion.
    // See: docs/ADMIN-SURFACES.md
    {
      href: '/admin/globals/site-settings',
      icon: '⚙️',
      title: 'פרטי החנות והמשלוחים',
      hint: 'טלפון, וואטסאפ, כתובת, תעריפי משלוח.',
      cta: 'עריכת ההגדרות',
    },
    {
      href: '/admin/globals/site-settings#field-announcementBar',
      icon: '📣',
      title: 'הודעה בראש האתר',
      hint: 'טקסט קצר שמופיע מעל כל עמוד באתר.',
      cta: 'עריכת ההודעה',
    },
    {
      href: '/admin/collections/orders',
      icon: '🧾',
      title: 'היסטוריית הזמנות',
      hint: 'רשימת כל ההזמנות, גם הישנות.',
      cta: 'פתיחת הרשימה',
    },
    // Round 5 Fix 2.5 + 2.8: Account-settings tile added so Yarit can
    // find (a) password + email management and (b) the admin UI
    // language switcher (Hebrew / English) — both of which live on
    // Payload's built-in /admin/account page. The hint mentions
    // "שפה" explicitly because switching the admin language was a
    // pain point — Yarit couldn't find the control.
    {
      href: '/admin/account',
      icon: '🔑',
      title: 'חשבון, שפה וסיסמה',
      hint: 'שינוי שפת פאנל הניהול (עברית / אנגלית), הסיסמה והמייל.',
      cta: 'עדכון פרטי חשבון',
    },
  ]
}

export async function YaritDashboard(props: AdminViewServerProps) {
  const [stats, recentOrders] = await Promise.all([
    getStats(props.payload),
    getRecentOrders(props.payload),
  ])
  const tiles = buildTiles(stats)
  const { hello, emoji, subtitle } = greet()

  return (
    <div className="yarit-dashboard" dir="rtl">
      <header className="yarit-dashboard__hello">
        <h1>
          {hello} {emoji}
        </h1>
        <p>{subtitle}</p>
      </header>

      <section className="yarit-stats" aria-label="סטטיסטיקה">
        <Stat
          label="הזמנות פתוחות"
          value={stats.openOrders}
          urgent={stats.openOrders > 0}
        />
        <Stat label="מוצרים פורסמו" value={stats.publishedProducts} />
        <Stat label="טיוטות" value={stats.draftProducts} />
        <Stat
          label="מלאי נמוך"
          value={stats.lowStock}
          urgent={stats.lowStock > 0}
        />
        <Stat label="לקוחות רשומים" value={stats.customers} />
      </section>

      {/* 2026-04-11 Track B.3 — recent orders section. Renders the 3
          most recent paid orders with order number, customer, item
          summary, total, and a quick link to the order edit page.
          Empty-state renders a friendly placeholder so the dashboard
          still looks complete when there are no orders yet (common
          during initial launch). */}
      <section className="yarit-recent" aria-label="הזמנות אחרונות">
        <header className="yarit-recent__header">
          <h2>הזמנות אחרונות</h2>
          <Link
            href="/admin/fulfillment"
            className="yarit-recent__all"
          >
            לכל ההזמנות ←
          </Link>
        </header>
        {recentOrders.length === 0 ? (
          <div className="yarit-recent__empty">
            כשהזמנות יתחילו להיכנס, שלושת האחרונות יופיעו כאן.
          </div>
        ) : (
          <ol className="yarit-recent__list">
            {recentOrders.map((o) => (
              <li key={o.id} className="yarit-recent__item">
                <Link
                  href={`/admin/collections/orders/${o.id}`}
                  className="yarit-recent__link"
                >
                  <div className="yarit-recent__top">
                    <span className="yarit-recent__number">
                      {o.orderNumber}
                    </span>
                    <span className="yarit-recent__status">
                      {FULFILLMENT_LABEL_HE[o.fulfillmentStatus] ??
                        o.fulfillmentStatus}
                    </span>
                  </div>
                  <div className="yarit-recent__mid">
                    <span className="yarit-recent__customer">
                      {o.customerLabel}
                    </span>
                    <span className="yarit-recent__total">
                      ₪{o.total.toLocaleString('he-IL')}
                    </span>
                  </div>
                  <div className="yarit-recent__bottom">{o.itemSummary}</div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="yarit-tiles" aria-label="פעולות מהירות">
        {tiles.map((t, i) => (
          <Link
            key={t.href}
            href={t.href}
            className={`yarit-tile yarit-tile--stagger${t.accent ? ' yarit-tile--accent' : ''}`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {t.badge !== undefined && (
              <span className="yarit-tile__badge">{t.badge}</span>
            )}
            <div className="yarit-tile__icon" aria-hidden>
              {t.icon}
            </div>
            <div className="yarit-tile__title">{t.title}</div>
            <div className="yarit-tile__hint">{t.hint}</div>
            <div className="yarit-tile__cta">{t.cta} ←</div>
          </Link>
        ))}
      </section>
    </div>
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
