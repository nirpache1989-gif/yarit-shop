/**
 * @file OrderList — customer order history grid
 * @summary Server component. Receives a flat list of order rows
 *          (already filtered by Payload's access rule on the parent
 *          page) and renders them as cards with status badges, totals,
 *          date, and a link to the detail page.
 *
 *          Status labels come from `src/lib/orders/statusLabels.ts`,
 *          the single source of truth shared with the admin row.
 *
 *          Wave A motion:
 *            - Order rows reveal in a staggered cascade (100ms).
 *            - Status pills pop in with a short delay so they land
 *              after the row frame has settled.
 *            - Hover adds a sage border glow + translate-y lift.
 *            - The "view order" link gets an underline-grow effect.
 *            - Empty state wraps the existing empty-shop illustration
 *              in a slow Ken Burns loop.
 */
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { StaggeredReveal } from '@/components/motion/StaggeredReveal'
import { KenBurns } from '@/components/motion/KenBurns'
import { Reveal } from '@/components/motion/Reveal'
import { formatILS } from '@/lib/format'
import {
  getCustomerFulfillmentStatusLabel,
  getPaymentStatusLabel,
  type FulfillmentStatus,
  type PaymentStatus,
  type StatusLocale,
} from '@/lib/orders/statusLabels'

export type OrderListRow = {
  id: number | string
  orderNumber: string
  createdAt: string
  total: number
  paymentStatus: PaymentStatus | string
  fulfillmentStatus: FulfillmentStatus | string
}

type Props = {
  orders: OrderListRow[]
  locale: StatusLocale
}

function formatDate(iso: string, locale: StatusLocale): string {
  try {
    return new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

const PAYMENT_TONE: Record<string, string> = {
  pending:
    'bg-[var(--color-border-brand)] text-[var(--color-primary-dark)]',
  paid: 'bg-[var(--color-primary)]/15 text-[var(--color-primary-dark)]',
  failed: 'bg-[var(--color-accent)]/15 text-[var(--color-accent-deep)]',
  refunded: 'bg-[var(--color-accent)]/10 text-[var(--color-accent-deep)]',
}

const FULFILLMENT_TONE: Record<string, string> = {
  pending: 'bg-[var(--color-border-brand)] text-[var(--color-primary-dark)]',
  packed: 'bg-[var(--color-primary)]/15 text-[var(--color-primary-dark)]',
  shipped: 'bg-[var(--color-primary)]/30 text-[var(--color-primary-dark)]',
  delivered: 'bg-[var(--color-primary)] text-white',
}

export async function OrderList({ orders, locale }: Props) {
  const t = await getTranslations({
    locale,
    namespace: 'account',
  })

  if (orders.length === 0) {
    // Wave A empty state — Ken Burns on the existing empty illustration
    // so the dashboard still feels alive for first-time customers.
    return (
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] p-8 md:p-10 text-center space-y-5">
          <div
            aria-hidden
            className="relative mx-auto h-40 w-40 overflow-hidden rounded-full border border-[var(--color-border-brand)]/60"
          >
            <KenBurns variant="br">
              <Image
                src="/brand/ai/empty-shop.jpg"
                alt=""
                fill
                sizes="160px"
                className="object-cover"
              />
            </KenBurns>
          </div>
          <p className="text-base text-[var(--color-muted)]">{t('noOrders')}</p>
          <div>
            <Button href="/shop" variant="primary" size="md" className="btn-lift">
              {t('browseShopCta')}
            </Button>
          </div>
        </div>
      </Reveal>
    )
  }

  return (
    <StaggeredReveal as="ul" className="space-y-3" stagger={100}>
      {orders.map((order) => (
        <li
          key={order.id}
          className="yarit-order-row rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/50 hover:shadow-[0_14px_40px_-24px_rgba(24,51,41,0.4)]"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-lg font-extrabold text-[var(--color-primary-dark)] tabular-nums"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {order.orderNumber}
                </span>
                <span className="text-xs text-[var(--color-muted)]">
                  · {formatDate(order.createdAt, locale)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`animate-badge-pop inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                    PAYMENT_TONE[order.paymentStatus] ?? PAYMENT_TONE.pending
                  }`}
                >
                  {t('paymentStatusLabel')}: {getPaymentStatusLabel(order.paymentStatus, locale)}
                </span>
                <span
                  className={`animate-badge-pop inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                    FULFILLMENT_TONE[order.fulfillmentStatus] ??
                    FULFILLMENT_TONE.pending
                  }`}
                  style={{ animationDelay: '120ms' }}
                >
                  {t('fulfillmentStatusLabel')}: {getCustomerFulfillmentStatusLabel(order.fulfillmentStatus, locale)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2">
              <span className="text-xl font-extrabold text-[var(--color-primary-dark)] tabular-nums">
                {formatILS(order.total)}
              </span>
              <Link
                href={`/account/orders/${order.id}`}
                className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] underline-offset-4 hover:underline"
              >
                {t('viewOrder')} →
              </Link>
            </div>
          </div>
        </li>
      ))}
    </StaggeredReveal>
  )
}
