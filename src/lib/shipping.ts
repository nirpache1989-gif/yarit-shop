/**
 * @file Shipping rate calculator
 * @summary Maps the customer's shipping country to a region, then
 *          filters `SiteSettings.shipping.rates` to the options
 *          available for that region.
 *
 *          Supported regions (matching SiteSettings):
 *            IL   — Israel
 *            EU   — European Union + UK
 *            NA   — United States + Canada
 *            ROW  — rest of world (everything else)
 *
 *          Also applies free-shipping threshold: if the subtotal is
 *          at or above `freeShippingThreshold` AND the shipping
 *          region is IL, the rate's price is overridden to 0.
 */
import type { Payload } from 'payload'

export type ShippingRegion = 'IL' | 'EU' | 'NA' | 'ROW'

export type ShippingRate = {
  region: ShippingRegion
  name: string
  price: number
}

const COUNTRY_TO_REGION: Record<string, ShippingRegion> = {
  IL: 'IL',
  US: 'NA',
  CA: 'NA',
  GB: 'EU',
  EU: 'EU',
  AU: 'ROW',
  OTHER: 'ROW',
}

export function countryToRegion(country: string): ShippingRegion {
  return COUNTRY_TO_REGION[country] ?? 'ROW'
}

/**
 * Load the rates from SiteSettings, filter to the requested region,
 * and apply the free-shipping threshold if applicable.
 */
export async function getShippingRatesForRegion(
  payload: Payload,
  region: ShippingRegion,
  subtotal: number,
  locale: 'he' | 'en' = 'he',
): Promise<ShippingRate[]> {
  const settings = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    locale,
  })) as {
    shipping?: {
      freeShippingThreshold?: number
      rates?: Array<{ region: ShippingRegion; name: string; price: number }>
    }
  }

  const rates = settings.shipping?.rates ?? []
  const threshold = settings.shipping?.freeShippingThreshold ?? 0
  const qualifiesForFree =
    region === 'IL' && threshold > 0 && subtotal >= threshold

  return rates
    .filter((r) => r.region === region)
    .map((r) => ({
      region: r.region,
      name: r.name,
      price: qualifiesForFree ? 0 : r.price,
    }))
}
