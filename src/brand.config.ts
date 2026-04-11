/**
 * @file Copaia brand configuration — SINGLE SOURCE OF TRUTH
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
    he: 'קופאה',
    en: 'Copaia',
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
    /*
     * Night Apothecary palette (Design Round 3).
     * Light mode tokens — emails reference brand.colors.* and always
     * render in light mode regardless of the reader's theme. Dark mode
     * overrides live in globals.css under [data-theme="dark"].
     */
    primary: '#2D4F3E',         // Marine-forest — bolder than the old sage
    primaryDark: '#183329',     // Near-black forest — headings, hover
    accent: '#0E5E3E',          // JADE JEWEL — used sparingly
    accentDeep: '#8B5A2B',      // Ochre-deep for secondary accents
    background: '#F6EFDC',      // Warmer, richer parchment
    /** Lighter parchment for cards/inputs that need to "lift" off the
     *  main canvas. Pure white (`surface`) is reserved for product
     *  image viewports where transparent product PNGs need maximum
     *  contrast. */
    surfaceWarm: '#FDF8E8',
    surface: '#FFFFFF',
    foreground: '#1A1F14',      // Near-black with forest undertone
    muted: '#6F6450',           // Warm muted text
    border: '#E4D7B0',          // Warm border
  },

  /**
   * Fonts — loaded via next/font/google in the storefront layout.
   * The CSS variable names are set there and referenced by Tailwind
   * utilities in globals.css.
   *
   * The display font was swapped from Frank Ruhl Libre to Bellefair
   * in Design Round 3 (see src/app/(storefront)/[locale]/layout.tsx
   * for the commentary). The CSS variable name `--font-frank-ruhl`
   * is kept for backwards compatibility with admin-brand.css.
   */
  fonts: {
    sans: 'Heebo',
    display: 'Bellefair', // higher-contrast editorial serif, single weight (400)
  },

  /**
   * Contact info. Fill with real values before launch.
   * Used in: Footer, Contact page, invoices, email templates.
   */
  contact: {
    phone: '', // TODO(yarit): add phone number
    whatsapp: '', // E.164 without leading + (e.g. 972501234567)
    email: 'hello@copaia.example', // TODO(yarit): replace with real email
    address: '', // TODO(yarit): add business address
    businessTaxId: '', // TODO(yarit): ח.פ. / ע.מ.
  },

  /**
   * Social links. Leave an empty string to hide a given platform from
   * the footer automatically.
   */
  social: {
    instagram: '', // e.g. 'https://instagram.com/copaia'
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
