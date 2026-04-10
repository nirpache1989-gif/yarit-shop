/**
 * @file OrderRow — Fulfillment Dashboard row with action buttons
 * @summary Client component rendered once per order on the dashboard.
 *          Calls Payload's built-in `PATCH /api/orders/[id]` to flip
 *          the `fulfillmentStatus` through the state machine. No
 *          custom API route needed — Payload's REST handler already
 *          enforces admin-only access via the Orders collection's
 *          `access.update` rule.
 *
 *          The state machine (as rendered here):
 *            awaiting_forever_purchase → forever_purchased → packed → shipped → delivered
 *            packed → shipped → delivered
 *
 *          Each button triggers one forward transition and refreshes
 *          the page so the row moves to the new group (or disappears
 *          if it's now delivered).
 */
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { cn } from '@/lib/cn'
import { getFulfillmentStatusLabel } from '@/lib/orders/statusLabels'

type Item = {
  title: string
  quantity: number
  productType: 'forever' | 'independent'
}

type Address = {
  recipientName: string
  phone: string
  street: string
  city: string
  country: string
}

export type OrderRowData = {
  id: number | string
  orderNumber: string
  createdAt: string
  total: number
  paymentStatus: string
  fulfillmentStatus:
    | 'pending'
    | 'awaiting_forever_purchase'
    | 'forever_purchased'
    | 'packed'
    | 'shipped'
    | 'delivered'
  items: Item[]
  shippingAddress: Address
  customerName?: string
  customerEmail?: string
}

// Hebrew labels for the fulfillment status chip live in
// `src/lib/orders/statusLabels.ts` (single source of truth shared
// with the customer-facing /account pages). Don't redeclare them here.

const STATUS_TONE: Record<OrderRowData['fulfillmentStatus'], string> = {
  pending: 'bg-[var(--color-border-brand)] text-[var(--color-primary-dark)]',
  awaiting_forever_purchase:
    'bg-[var(--color-accent)]/20 text-[var(--color-accent-deep)] border border-[var(--color-accent)]/40',
  forever_purchased:
    'bg-[var(--color-accent)]/10 text-[var(--color-accent-deep)]',
  packed:
    'bg-[var(--color-primary)]/15 text-[var(--color-primary-dark)]',
  shipped:
    'bg-[var(--color-primary)]/30 text-[var(--color-primary-dark)]',
  delivered:
    'bg-[var(--color-primary)] text-white',
}

function nextStatus(
  current: OrderRowData['fulfillmentStatus'],
): { to: OrderRowData['fulfillmentStatus']; label: string } | null {
  switch (current) {
    case 'awaiting_forever_purchase':
      return { to: 'forever_purchased', label: 'סימנתי שרכשתי מפוראבר' }
    case 'forever_purchased':
      return { to: 'packed', label: 'נארז, מוכן למשלוח' }
    case 'packed':
      return { to: 'shipped', label: 'נשלח ללקוח' }
    case 'shipped':
      return { to: 'delivered', label: 'הושלם ✓' }
    default:
      return null
  }
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

type Props = {
  order: OrderRowData
}

export function OrderRow({ order }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const next = nextStatus(order.fulfillmentStatus)

  async function advance() {
    if (!next) return
    setError(null)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fulfillmentStatus: next.to }),
      })
      if (!res.ok) {
        const text = await res.text()
        toast.error(`שגיאה בעדכון: ${res.status}`)
        setError(`${res.status}: ${text.slice(0, 200)}`)
        return
      }

      // Delivered = celebrate. Dynamic import keeps canvas-confetti
      // (~6kb) out of the main admin bundle — only loaded when a
      // user actually hits the final transition, which is rare
      // relative to the earlier state changes.
      if (next.to === 'delivered') {
        try {
          const { default: confetti } = await import('canvas-confetti')
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#2D4F3E', '#8AAF6F', '#E6B976', '#F3E5C0'],
          })
        } catch {
          /* confetti is a cherry on top; failure is not user-facing */
        }
        toast.success('🌸 ההזמנה הושלמה! כל הכבוד')
      } else {
        toast.success(`✓ ${next.label}`)
      }

      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      toast.error('שגיאה בחיבור לשרת')
      setError(err instanceof Error ? err.message : 'שגיאה')
    }
  }

  const hasForever = order.items.some((i) => i.productType === 'forever')

  return (
    <li className="rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface)] overflow-hidden">
      <div className="p-5 grid gap-4 items-start md:grid-cols-[1fr_auto]">
        {/* Left: summary — min-w-0 lets long product titles truncate
            cleanly on mobile instead of overflowing the grid cell */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-lg font-extrabold text-[var(--color-primary-dark)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {order.orderNumber}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
                STATUS_TONE[order.fulfillmentStatus],
              )}
            >
              {getFulfillmentStatusLabel(order.fulfillmentStatus, 'he')}
            </span>
            {hasForever && (
              <span className="inline-flex items-center rounded-full bg-[var(--color-accent)]/15 px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-accent-deep)]">
                🌿 פוראבר
              </span>
            )}
            <span className="ms-auto text-xs text-[var(--color-muted)]">
              {formatDate(order.createdAt)}
            </span>
          </div>

          {/* Customer */}
          <div className="text-sm">
            <div className="text-[var(--color-primary-dark)] font-semibold">
              {order.customerName || order.shippingAddress.recipientName}
            </div>
            <div className="text-[var(--color-muted)] flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
              {order.customerEmail && (
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  {order.customerEmail}
                </a>
              )}
              {order.shippingAddress.phone && (
                <a
                  href={`tel:${order.shippingAddress.phone}`}
                  className="hover:text-[var(--color-primary-dark)]"
                >
                  {order.shippingAddress.phone}
                </a>
              )}
              <span>
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </span>
            </div>
          </div>

          {/* Items */}
          <ul className="text-sm space-y-1">
            {order.items.map((item, i) => (
              <li key={i} className="text-[var(--color-foreground)] flex items-center gap-2">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    item.productType === 'forever'
                      ? 'bg-[var(--color-accent)]'
                      : 'bg-[var(--color-primary)]',
                  )}
                />
                <span>
                  {item.title}
                  <span className="text-[var(--color-muted)]"> × {item.quantity}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="text-lg font-extrabold text-[var(--color-primary-dark)]">
            ₪{order.total.toLocaleString()}
          </div>
        </div>

        {/* Right: action button. On mobile the button stacks below the
            summary with a subtle top border; on md+ it sits to the left
            (RTL) of the summary with its own minimum width. */}
        <div className="flex flex-col items-stretch gap-2 pt-3 border-t border-[var(--color-border-brand)] md:items-end md:min-w-[220px] md:pt-0 md:border-t-0">
          {next ? (
            <button
              type="button"
              onClick={advance}
              disabled={isPending}
              className="btn-lift inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <span
                    className="inline-block h-4 w-4 rounded-full border-2 border-white/35 border-t-white animate-spin"
                    aria-hidden
                  />
                  <span>מעדכן...</span>
                </>
              ) : (
                next.label
              )}
            </button>
          ) : (
            <span className="text-sm text-[var(--color-muted)] text-center">—</span>
          )}
          {error && (
            <p className="text-xs text-red-700 max-w-[220px] text-end">{error}</p>
          )}
        </div>
      </div>
    </li>
  )
}
