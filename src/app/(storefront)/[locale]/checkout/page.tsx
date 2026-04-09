/**
 * @file /checkout — checkout page
 * @summary Server component that fetches the initial shipping rates
 *          for Israel (the default country) from SiteSettings, then
 *          renders the client-side `<CheckoutForm />`.
 *
 *          The initial rates are passed via props so the form has
 *          something to show on first render without a round-trip.
 *          When the customer changes the country, the form fetches
 *          new rates from /api/shipping-rates.
 */
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Container } from '@/components/ui/Container'
import { getPayloadClient } from '@/lib/payload'
import { getShippingRatesForRegion } from '@/lib/shipping'
import { routing, type Locale } from '@/lib/i18n/routing'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const typedLocale = locale as Locale

  const t = await getTranslations({ locale, namespace: 'checkout' })
  const payload = await getPayloadClient()

  // Default to IL for the initial rates (the form lets the customer
  // change country, which triggers a re-fetch via /api/shipping-rates)
  const initialRates = await getShippingRatesForRegion(
    payload,
    'IL',
    0,
    typedLocale,
  )

  return (
    <Container className="py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary-dark)] mb-8">
        {t('title')}
      </h1>
      <CheckoutForm initialRates={initialRates} />
    </Container>
  )
}
