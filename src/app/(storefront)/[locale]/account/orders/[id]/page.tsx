/**
 * @file /account/orders/[id] — single-order detail page
 * @summary Server component. Auth-gates: redirect to /login if not
 *          logged in. Fetches the order via Payload's local API with
 *          `{ user, overrideAccess: false }` so the read access rule
 *          (lines 56-60 of `src/collections/Orders.ts`) restricts the
 *          query to orders this customer actually owns.
 *
 *          If the order doesn't exist OR belongs to a different
 *          customer, Payload throws (or returns null) and we render
 *          the friendly "not found" empty state — NOT a 404 — so the
 *          customer gets a clear next action.
 *
 *          CRITICAL — DO NOT remove `overrideAccess: false`. See the
 *          comment on /account/page.tsx and the cross-customer test
 *          in F.1 verification step (j).
 */
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { redirect as nextRedirect } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { OrderTimeline } from '@/components/account/OrderTimeline'
import { Reveal } from '@/components/motion/Reveal'
import { StaggeredReveal } from '@/components/motion/StaggeredReveal'
import { CountUp } from '@/components/motion/CountUp'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPayloadClient } from '@/lib/payload'
import { Link, redirect } from '@/lib/i18n/navigation'
import { type Locale } from '@/lib/i18n/routing'
import { formatILS } from '@/lib/format'
import {
  getCustomerFulfillmentStatusLabel,
  getPaymentStatusLabel,
  type FulfillmentStatus,
  type PaymentStatus,
  type StatusLocale,
} from '@/lib/orders/statusLabels'

// Intentionally NO `generateStaticParams`. See the equivalent comment
// on /product/[slug]/page.tsx — declaring it with just `{locale}`
// pins the route to SSG and breaks at runtime with DYNAMIC_SERVER_USAGE
// via next-intl's `setRequestLocale`. Order detail pages are per-
// customer and auth-gated, so SSG would never have been correct anyway.

type Props = {
  params: Promise<{ locale: string; id: string }>
}

type OrderItem = {
  title: string
  quantity: number
  price: number
  imageUrl?: string
  productType: 'forever' | 'independent'
}

type ShippingAddress = {
  recipientName: string
  phone: string
  street: string
  city: string
  postalCode?: string
  country: string
}

type OrderDoc = {
  id: number | string
  orderNumber: string
  createdAt: string
  subtotal: number
  shippingCost: number
  total: number
  paymentStatus: PaymentStatus | string
  fulfillmentStatus: FulfillmentStatus | string
  items: OrderItem[]
  shippingAddress: ShippingAddress
}

function formatDate(iso: string, locale: StatusLocale): string {
  try {
    return new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default async function OrderDetailPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const typedLocale = locale as Locale
  const statusLocale = typedLocale as StatusLocale

  const { user } = await getCurrentUser()
  if (!user) {
    redirect({ href: '/login', locale: typedLocale })
  }
  // Admins redirect to /admin — see the equivalent comment on
  // /account/page.tsx. Mirrors the same guarantee on the detail page
  // so a logged-in admin can't deep-link into any customer's order.
  if (user!.role === 'admin') {
    nextRedirect('/admin')
  }

  const t = await getTranslations({ locale, namespace: 'account' })
  const payload = await getPayloadClient()

  let order: OrderDoc | null = null
  try {
    // CRITICAL: pass `user` + `overrideAccess: false`. Without these
    // the local API returns the order regardless of ownership and
    // any logged-in customer can see any other customer's data.
    order = (await payload.findByID({
      collection: 'orders',
      id,
      depth: 0,
      locale: typedLocale,
      user: user!,
      overrideAccess: false,
    })) as unknown as OrderDoc
  } catch {
    order = null
  }

  if (!order) {
    return (
      <Container className="py-16 md:py-20 max-w-2xl text-center space-y-6">
        <Reveal>
          <h1
            className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary-dark)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('notFoundHeading')}
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="text-[var(--color-muted)]">{t('notFoundBody')}</p>
        </Reveal>
        <Reveal delay={280}>
          <Button href="/account" variant="primary" size="lg" className="btn-lift">
            {t('notFoundCta')}
          </Button>
        </Reveal>
      </Container>
    )
  }

  return (
    <Container className="py-12 md:py-16 max-w-3xl space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <Reveal>
          <Link
            href="/account"
            className="inline-block text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] underline-offset-4 hover:underline"
          >
            ← {t('backToAccount')}
          </Link>
        </Reveal>
        <Reveal delay={140}>
          <h1
            className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary-dark)] tabular-nums"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('orderDetailHeading', { orderNumber: order.orderNumber })}
          </h1>
        </Reveal>
        <Reveal delay={260}>
          <p className="text-sm text-[var(--color-muted)]">
            {formatDate(order.createdAt, statusLocale)}
          </p>
        </Reveal>
      </header>

      {/* Status timeline */}
      <Reveal delay={320}>
        <section className="rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface)] p-6 space-y-5">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2
              className="text-xl font-bold text-[var(--color-primary-dark)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('statusTimelineHeading')}
            </h2>
            <span className="text-xs text-[var(--color-muted)]">
              ({t('paymentStatusLabel')}:{' '}
              {getPaymentStatusLabel(order.paymentStatus, statusLocale)} ·{' '}
              {t('fulfillmentStatusLabel')}:{' '}
              {getCustomerFulfillmentStatusLabel(order.fulfillmentStatus, statusLocale)})
            </span>
          </div>
          <OrderTimeline
            status={order.fulfillmentStatus}
            locale={statusLocale}
          />
        </section>
      </Reveal>

      {/* Items + totals */}
      <Reveal delay={420}>
        <section className="rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface)] p-6 space-y-4">
          <h2
            className="text-xl font-bold text-[var(--color-primary-dark)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('orderItemsHeading')}
          </h2>
          <StaggeredReveal
            as="ul"
            className="divide-y divide-[var(--color-border-brand)]"
            stagger={80}
          >
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <span className="text-sm text-[var(--color-primary-dark)]">
                  {item.title}
                  <span className="text-[var(--color-muted)]">
                    {' '}
                    × {item.quantity}
                  </span>
                </span>
                <span className="text-sm font-bold text-[var(--color-primary-dark)] tabular-nums">
                  {formatILS(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </StaggeredReveal>
          <div className="pt-3 border-t border-[var(--color-border-brand)] space-y-1">
            <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
              <span>{t('subtotal')}</span>
              <span className="text-[var(--color-primary-dark)] tabular-nums">
                {formatILS(order.subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
              <span>{t('shipping')}</span>
              <span className="text-[var(--color-primary-dark)] tabular-nums">
                {formatILS(order.shippingCost)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-brand)] text-lg font-extrabold text-[var(--color-primary-dark)]">
              <span>{t('total')}</span>
              <CountUp
                value={order.total}
                duration={800}
                prefix="₪"
                locale={statusLocale === 'he' ? 'he-IL' : 'en-US'}
                className="tabular-nums"
              />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Shipping address */}
      <Reveal delay={540}>
        <section className="rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] p-6 space-y-3">
          <h2
            className="text-xl font-bold text-[var(--color-primary-dark)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('shippingAddressHeading')}
          </h2>
          <address className="not-italic text-sm text-[var(--color-primary-dark)] leading-relaxed">
            <div className="font-semibold">{order.shippingAddress.recipientName}</div>
            <div>{order.shippingAddress.phone}</div>
            <div>{order.shippingAddress.street}</div>
            <div>
              {order.shippingAddress.city}
              {order.shippingAddress.postalCode
                ? `, ${order.shippingAddress.postalCode}`
                : ''}
            </div>
            <div>{order.shippingAddress.country}</div>
          </address>
        </section>
      </Reveal>
    </Container>
  )
}
