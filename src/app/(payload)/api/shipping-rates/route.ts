/**
 * @file GET /api/shipping-rates?country=IL&subtotal=150
 * @summary Returns the list of shipping rates available for a given
 *          destination country, with the free-shipping threshold
 *          already applied based on the passed subtotal.
 *
 *          Called by the CheckoutForm when the customer changes
 *          country so the rates refresh live without a page reload.
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { countryToRegion, getShippingRatesForRegion } from '@/lib/shipping'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const country = url.searchParams.get('country') ?? 'IL'
  const subtotal = Number(url.searchParams.get('subtotal') ?? 0)
  const locale =
    (url.searchParams.get('locale') as 'he' | 'en' | null) ?? 'he'

  const region = countryToRegion(country)
  const payload = await getPayload({ config })
  const rates = await getShippingRatesForRegion(
    payload,
    region,
    isNaN(subtotal) ? 0 : subtotal,
    locale,
  )
  return NextResponse.json({ rates, region })
}
