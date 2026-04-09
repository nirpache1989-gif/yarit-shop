/**
 * @file Shoresh brand configuration — SINGLE SOURCE OF TRUTH
 * @summary Every piece of brand data (name, palette, fonts, contact info,
 *          social links) lives here. Changing the shop's identity is a
 *          one-file change: edit this file and everything downstream
 *          (header, footer, emails, SEO metadata, OpenGraph images,
 *          Tailwind theme) picks it up.
 *
 *          Rules:
 *          - Never hardcode brand colors in components — import from
 *            `brand.config.ts` or use the Tailwind utility classes that
 *            reference the CSS variables.
 *          - Never hardcode contact info in components — read from here.
 *          - If you add a new brand-level constant, add it here, not
 *            inline in a component file.
 *
 *          See: docs/BRAND.md, plan §1 (Brand Direction).
 */

export const brand = {
  /** Brand name in each script. */
  name: {
    he: 'שורש',
    en: 'Shoresh',
  },

  /** Short tagline. Placeholder until Yarit picks a final one. */
  tagline: {
    he: 'שורשים של בריאות',
    en: 'Rooted in wellness',
  },

  /** Longer descriptive one-liner for hero sections and meta descriptions. */
  description: {
    he: 'חנות מוצרי טבע ובריאות — מבחר אישי של ירית',
    en: 'Natural wellness shop — a curated personal selection from Yarit',
  },

  /**
   * Color palette — tuned to the logo's actual colors.
   * These are exposed as CSS variables in globals.css and as Tailwind
   * utilities via @theme in the same file. If you change a hex here,
   * also update the matching `--color-*` line in globals.css (or adopt
   * a build step that syncs them).
   *
   * See: plan §1 (Brand Direction) for the source-of-color mapping.
   */
  colors: {
    primary: '#5B7342', // Sage green — from the logo leaves
    primaryDark: '#3D5240', // Forest green — from the "Shoresh" letterforms
    accent: '#A67A4A', // Warm tan — from the tree trunk
    accentDeep: '#7C4E2F', // Darker accent — from the roots
    background: '#ECE5D4', // Parchment cream — sampled directly from the logo's corners (exact match)
    surface: '#FFFFFF',
    foreground: '#2A2A2A',
    muted: '#8B7A5C',
    border: '#E6D9B8',
  },

  /**
   * Fonts — loaded via next/font/google in the storefront layout.
   * The CSS variable names are set there and referenced by Tailwind
   * utilities in globals.css.
   */
  fonts: {
    sans: 'Heebo',
    display: 'Frank Ruhl Libre', // optional, used for hero headlines
  },

  /**
   * Contact info. Fill with real values before launch.
   * Used in: Footer, Contact page, invoices, email templates.
   */
  contact: {
    phone: '', // TODO(yarit): add phone number
    whatsapp: '', // E.164 without leading + (e.g. 972501234567)
    email: 'hello@shoresh.example', // TODO(yarit): replace with real email
    address: '', // TODO(yarit): add business address
    businessTaxId: '', // TODO(yarit): ח.פ. / ע.מ.
  },

  /**
   * Social links. Leave an empty string to hide a given platform from
   * the footer automatically.
   */
  social: {
    instagram: '', // e.g. 'https://instagram.com/shoresh'
    facebook: '',
    tiktok: '',
  },

  /** Internationalization — Hebrew primary, English secondary. */
  locales: {
    default: 'he',
    supported: ['he', 'en'] as const,
  },
} as const

export type BrandLocale = (typeof brand.locales.supported)[number]
