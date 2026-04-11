/**
 * @file /checkout/success — post-payment thank you page
 * @summary Server component. Expects `?token=<signed>` in the query,
 *          where the token is an HMAC signed over the order ID by
 *          `src/lib/orderToken.ts` during the checkout flow. Fetches
 *          the order from Payload ONLY after the token verifies, so
 *          strangers cannot read arbitrary orders by guessing IDs.
 *
 *          Previously this page read `?order=<id>` directly and called
 *          `payload.findByID` with no auth — a P1 privacy issue. The
 *          raw-ID form is no longer accepted; old links (if any still
 *          exist from before this change) gracefully render the
 *          "order not found" empty state instead of leaking data.
 *
 *          Tokens are valid for 24 hours after checkout. After that
 *          customers should access their order through `/account`,
 *          which is auth-gated.
 */
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { getPayloadClient } from '@/lib/payload'
import { routing, type Locale } from '@/lib/i18n/routing'
import { verifyOrderToken } from '@/lib/orderToken'
import { CheckoutCelebration } from '@/components/account/CheckoutCelebration'
import { formatILS } from '@/lib/format'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string }>
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
  const { token } = await searchParams
  setRequestLocale(locale)
  const typedLocale = locale as Locale
  const t = await getTranslations({ locale, namespace: 'success' })

  // Verify the signed token BEFORE touching the database. No token or
  // a bad/expired one falls through to the friendly empty state — no
  // 500, no data leak, no hint that the ID might be valid.
  const verified = verifyOrderToken(token)
  if (!verified) {
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
      id: verified.orderId as unknown as number,
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
        {/* CheckoutCelebration is a client component — it fires the
            brand confetti burst on mount and draws the checkmark
            with a stroke-dasharray animation. Keeps this page
            server-rendered for the order fetch. */}
        <div className="animate-fade-up">
          <CheckoutCelebration />
        </div>
        <h1
          className="iridescent-heading text-4xl md:text-5xl font-extrabold animate-fade-up"
          style={{ fontFamily: 'var(--font-display)', animationDelay: '180ms' }}
        >
          {t('heading')}
        </h1>
        <p
          className="text-lg text-[var(--color-muted)] italic animate-fade-up"
          style={{ fontFamily: 'var(--font-display)', animationDelay: '320ms' }}
        >
          {t('subheading')}
        </p>
        <p
          className="text-sm text-[var(--color-muted)] animate-fade-up"
          style={{ animationDelay: '440ms' }}
        >
          {t('orderNumber')}:{' '}
          <strong className="text-[var(--color-primary-dark)]" style={{ fontFamily: 'var(--font-display)' }}>
            {order.orderNumber}
          </strong>
        </p>
      </div>

      <section
        className="rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface)] p-6 space-y-3 animate-fade-up"
        style={{ animationDelay: '580ms' }}
      >
        <h2
          className="text-xl font-bold text-[var(--color-primary-dark)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
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
                {formatILS(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="pt-3 border-t border-[var(--color-border-brand)] space-y-1">
          <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
            <span>{t('subtotal')}</span>
            <span className="text-[var(--color-primary-dark)]">
              {formatILS(order.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
            <span>{t('shipping')}</span>
            <span className="text-[var(--color-primary-dark)]">
              {formatILS(order.shippingCost)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-brand)] text-lg font-extrabold text-[var(--color-primary-dark)]">
            <span>{t('total')}</span>
            <span>{formatILS(order.total)}</span>
          </div>
        </div>
      </section>

      <div className="mt-8 text-center animate-fade-up" style={{ animationDelay: '820ms' }}>
        <Button href="/shop" variant="primary" size="lg" className="btn-lift">
          {t('continueShopping')}
        </Button>
      </div>
    </Container>
  )
}
