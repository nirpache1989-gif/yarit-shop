/**
 * @file OrderTimeline — visual fulfillment progress for a customer
 * @summary Server component. Renders a horizontal step list showing
 *          the customer where their order is in the pipeline.
 *
 *          Always 4 steps — "Order received" → "Preparing" → "On the
 *          way" → "Delivered". The 4 DB fulfillment states
 *          (pending / packed / shipped / delivered) map 1:1 to these
 *          via `getCustomerStepFor` in statusLabels.ts, but the
 *          customer sees the softer labels rather than the admin
 *          operational vocabulary.
 *
 *          If Yarit's operational view needs to change, update
 *          `src/lib/orders/statusLabels.ts` — both admin and customer
 *          label maps live there.
 *
 *          Wave O motion:
 *            - Completed connector lines fill in via a width
 *              transition on mount (`timeline-connector-fill`),
 *              each staggered 120ms after the previous so it reads
 *              as a drawn progress line.
 *            - Completed checkmarks are SVG paths that draw
 *              themselves via stroke-dasharray, staggered to land
 *              just after their connector finishes.
 *            - The current step circle pulses gently every 2.8s.
 *            - Under prefers-reduced-motion all of the above drop
 *              to 0 (fill 100% / dashoffset 0) — layout unchanged.
 */
import {
  CUSTOMER_FULFILLMENT_STEPS,
  getCustomerCurrentStepIndex,
  getCustomerStepLabel,
  type FulfillmentStatus,
  type StatusLocale,
} from '@/lib/orders/statusLabels'

type Props = {
  status: FulfillmentStatus | string
  locale: StatusLocale
}

// Small inline SVG check. Stroke-dasharray animation is owned by
// the `.timeline-check-draw` class in globals.css — this path just
// needs pathLength so the dash math is simple (24 units total).
function TimelineCheck({ delay }: { delay: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M5 12.5 L10 17.5 L19 7"
        className="timeline-check-draw"
        style={{ ['--timeline-delay' as string]: `${delay}ms` }}
      />
    </svg>
  )
}

export function OrderTimeline({ status, locale }: Props) {
  const currentIndex = getCustomerCurrentStepIndex(status)

  return (
    <ol className="relative flex flex-col gap-4 md:flex-row md:items-start md:gap-2">
      {CUSTOMER_FULFILLMENT_STEPS.map((step, i) => {
        const done = i < currentIndex
        const current = i === currentIndex
        // Stagger the drawing so each step lands just after the
        // previous one finishes (~260ms apart reads as "drawn" not
        // "popped").
        const connectorDelay = i * 260
        const checkDelay = connectorDelay + 180
        return (
          <li
            key={step}
            className="relative flex items-start gap-3 md:flex-1 md:flex-col md:items-center md:text-center"
          >
            {/* Connector line on desktop — a rail plus an optional
                filled overlay. The rail is always full-width; the
                fill overlay only renders for completed steps and
                animates its width from 0 → 100% on mount. */}
            {i < CUSTOMER_FULFILLMENT_STEPS.length - 1 && (
              <span
                aria-hidden
                className="hidden md:block absolute top-4 ltr:left-1/2 rtl:right-1/2 h-0.5 w-full"
              >
                <span
                  className="absolute inset-0 bg-[var(--color-border-brand)]"
                />
                {done && (
                  <span
                    className="timeline-connector-fill absolute inset-y-0 ltr:left-0 rtl:right-0 bg-[var(--color-primary)]"
                    style={{ ['--timeline-delay' as string]: `${connectorDelay}ms` }}
                  />
                )}
              </span>
            )}
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold shrink-0 ${
                done
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                  : current
                  ? 'timeline-current-pulse bg-[var(--color-surface-warm)] border-[var(--color-primary)] text-[var(--color-primary-dark)]'
                  : 'bg-[var(--color-surface-warm)] border-[var(--color-border-brand)] text-[var(--color-muted)]'
              }`}
              aria-current={current ? 'step' : undefined}
            >
              {done ? <TimelineCheck delay={checkDelay} /> : i + 1}
            </span>
            <span
              className={`relative z-10 text-sm md:text-xs leading-snug ${
                current
                  ? 'font-bold text-[var(--color-primary-dark)]'
                  : done
                  ? 'text-[var(--color-primary-dark)]'
                  : 'text-[var(--color-muted)]'
              }`}
            >
              {getCustomerStepLabel(step, locale)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
