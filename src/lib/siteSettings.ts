/**
 * @file siteSettings — resolved site settings (SiteSettings global + brand.config fallback)
 * @summary Single place to fetch the SiteSettings global from Payload
 *          and merge it with `brand.config.ts` as a fallback. The
 *          rationale: once Yarit fills in `/admin/globals/site-settings`,
 *          every public surface (footer, contact page, email templates,
 *          SEO metadata) picks up her values automatically. Until she
 *          fills them, we fall back to brand.config so nothing renders
 *          as an empty string.
 *
 *          The fallback order per field is:
 *              SiteSettings.contact.X  →  brand.contact.X  →  undefined
 *
 *          Callers should render the field only when non-empty — an
 *          unconfigured WhatsApp URL should NOT render a broken link.
 *
 *          Pre-2026-04-11 QA discovered that `/contact` and the Footer
 *          were reading directly from `brand.config.ts` which still
 *          held placeholder values (`hello@copaia.example`, empty
 *          phone, etc.). This helper is the fix. See:
 *          docs/STATE.md 2026-04-11 late-evening QA pass.
 */
import 'server-only'
import { getPayloadClient } from '@/lib/payload'
import { brand } from '@/brand.config'

export type ResolvedSiteContact = {
  whatsapp: string
  email: string
  phone: string
  address: string
  businessTaxId: string
}

export type ResolvedSiteSocial = {
  instagram: string
  facebook: string
  tiktok: string
}

export type ResolvedSiteSettings = {
  contact: ResolvedSiteContact
  social: ResolvedSiteSocial
}

const EMPTY_RESOLVED: ResolvedSiteSettings = {
  contact: {
    whatsapp: '',
    email: '',
    phone: '',
    address: '',
    businessTaxId: '',
  },
  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
  },
}

/**
 * Empty strings and the known brand.config placeholders do not count
 * as "set". `brand.contact.email` is `hello@copaia.example` — shipping
 * that to a real customer's inbox would be embarrassing.
 */
const PLACEHOLDER_STRINGS = new Set<string>([
  '',
  'hello@copaia.example',
  // Pre-rename placeholder preserved so prod DBs still holding the old
  // string get treated as "unset" after the 2026-04-11 brand rename.
  'hello@shoresh.example',
])

function preferSetting(settingValue: unknown, brandFallback: string): string {
  const s = typeof settingValue === 'string' ? settingValue.trim() : ''
  if (s && !PLACEHOLDER_STRINGS.has(s)) return s
  return PLACEHOLDER_STRINGS.has(brandFallback) ? '' : brandFallback
}

/**
 * Load the SiteSettings global + merge with brand.config fallbacks.
 * Returns zeroed fields on any Payload error so the page still renders
 * (without the unconfigured cards).
 */
export async function getResolvedSiteSettings(): Promise<ResolvedSiteSettings> {
  try {
    const payload = await getPayloadClient()
    const settings = (await payload.findGlobal({
      slug: 'site-settings',
    })) as {
      contact?: Partial<ResolvedSiteContact>
      social?: Partial<ResolvedSiteSocial>
    } | null

    if (!settings) return EMPTY_RESOLVED

    return {
      contact: {
        whatsapp: preferSetting(
          settings.contact?.whatsapp,
          brand.contact.whatsapp,
        ),
        email: preferSetting(settings.contact?.email, brand.contact.email),
        phone: preferSetting(settings.contact?.phone, brand.contact.phone),
        address: preferSetting(
          settings.contact?.address,
          brand.contact.address,
        ),
        businessTaxId: preferSetting(
          settings.contact?.businessTaxId,
          brand.contact.businessTaxId,
        ),
      },
      social: {
        instagram: preferSetting(
          settings.social?.instagram,
          brand.social.instagram,
        ),
        facebook: preferSetting(
          settings.social?.facebook,
          brand.social.facebook,
        ),
        tiktok: preferSetting(settings.social?.tiktok, brand.social.tiktok),
      },
    }
  } catch {
    // Payload may not be initialised in edge runtime or during a cold
    // build step. Render the page without contact info rather than
    // crashing.
    return EMPTY_RESOLVED
  }
}
