/**
 * @file /checkout/success — post-payment thank you page
 * @summary Server component. Expects `?order=<id>` in the query. Fetches
 *          the order from Payload, verifies it belongs to a real order,
 *          and shows a thank-you confirmation with the order number,
 *          a summary, and a link back to the shop.
 *
 *          If `?order=...` is missing or invalid, shows a friendly
 *          "no order found" message instead of 500-ing.
 */
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { getPayloadClient } from '@/lib/payload'
import { routing, type Locale } from '@/lib/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ order?: string }>
}

type OrderDoc = {
  id: number | string
  orderNumber: string
  total: number
  subtotal: number
  shippingCost: number
  paymentStatus: string
  fulfillmentStatus: string
  items: Array<{ title: string; quantity: number; price: number }>
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params
  const { order: orderId } = await searchParams
  setRequestLocale(locale)
  const typedLocale = locale as Locale
  const t = await getTranslations({ locale, namespace: 'success' })

  if (!orderId) {
    return (
      <Container className="py-24 text-center">
        <p className="text-[var(--color-muted)]">{t('noOrder')}</p>
        <div className="mt-6">
          <Button href="/shop" variant="primary" size="lg">
            {t('backToShop')}
          </Button>
        </div>
      </Container>
    )
  }

  const payload = await getPayloadClient()
  let order: OrderDoc | null = null
  try {
    order = (await payload.findByID({
      collection: 'orders',
      id: orderId as unknown as number,
      depth: 0,
      locale: typedLocale,
    })) as unknown as OrderDoc
  } catch {
    order = null
  }

  if (!order) {
    return (
      <Container className="py-24 text-center">
        <p className="text-[var(--color-muted)]">{t('noOrder')}</p>
        <div className="mt-6">
          <Button href="/shop" variant="primary" size="lg">
            {t('backToShop')}
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-12 md:py-16 max-w-3xl">
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary-dark)]">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary-dark)]">
          {t('heading')}
        </h1>
        <p className="text-lg text-[var(--color-muted)]">{t('subheading')}</p>
        <p className="text-sm text-[var(--color-muted)]">
          {t('orderNumber')}:{' '}
          <strong className="text-[var(--color-primary-dark)]">
            {order.orderNumber}
          </strong>
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface)] p-6 space-y-3">
        <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">
          {t('orderSummary')}
        </h2>
        <ul className="divide-y divide-[var(--color-border-brand)]">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between py-3">
              <span className="text-sm text-[var(--color-primary-dark)]">
                {item.title}
                <span className="text-[var(--color-muted)]"> × {item.quantity}</span>
              </span>
              <span className="text-sm font-bold text-[var(--color-primary-dark)]">
                ₪{(item.price * item.quantity).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
        <div className="pt-3 border-t border-[var(--color-border-brand)] space-y-1">
          <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
            <span>{t('subtotal')}</span>
            <span className="text-[var(--color-primary-dark)]">
              ₪{order.subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
            <span>{t('shipping')}</span>
            <span className="text-[var(--color-primary-dark)]">
              ₪{order.shippingCost.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-brand)] text-lg font-extrabold text-[var(--color-primary-dark)]">
            <span>{t('total')}</span>
            <span>₪{order.total.toLocaleString()}</span>
          </div>
        </div>
      </section>

      <div className="mt-8 text-center">
        <Button href="/shop" variant="primary" size="lg">
          {t('continueShopping')}
        </Button>
      </div>
    </Container>
  )
}
