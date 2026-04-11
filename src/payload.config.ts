/**
 * @file Payload CMS configuration for Copaia
 * @summary Root Payload config. Registers all collections + the
 *          SiteSettings global, wires the DB adapter (Postgres for
 *          production, SQLite for local dev), configures Lexical rich
 *          text, enables BOTH content localization (he + en) AND
 *          Hebrew admin UI via @payloadcms/translations, and
 *          conditionally mounts Vercel Blob storage for uploaded media.
 *
 *          DB adapter selection (see docs/ENVIRONMENT.md):
 *            - If DATABASE_URI starts with `postgres://` or
 *              `postgresql://` → Postgres via @payloadcms/db-postgres
 *              (used on Vercel with Neon)
 *            - Otherwise → SQLite via @payloadcms/db-sqlite (local dev,
 *              zero config, file at ./copaia-dev.db)
 *
 *          Media storage:
 *            - If BLOB_READ_WRITE_TOKEN is set → @payloadcms/storage-vercel-blob
 *              is added as a plugin (production on Vercel)
 *            - Otherwise → Payload's default local filesystem storage
 *              under `./media/` (local dev)
 *
 *          This branching keeps local dev ergonomic (SQLite + local
 *          files) while production runs on a real database and
 *          persistent object storage, from the same config file.
 *
 *          See: docs/ARCHITECTURE.md, docs/ENVIRONMENT.md, plan §2.
 */
import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { en } from '@payloadcms/translations/languages/en'
import { he } from '@payloadcms/translations/languages/he'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tags } from './collections/Tags'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Orders } from './collections/Orders'
import { SiteSettings } from './globals/SiteSettings'
import { copaiaEmailAdapter } from './lib/payload/emailAdapter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ─── Database adapter — pick based on DATABASE_URI shape ────────────
const dbUri = process.env.DATABASE_URI || 'file:./copaia-dev.db'
const isPostgres =
  dbUri.startsWith('postgres://') || dbUri.startsWith('postgresql://')

const db = isPostgres
  ? postgresAdapter({
      pool: {
        connectionString: dbUri,
      },
      // `push: true` lets Drizzle sync the schema to Postgres without
      // committed migration files. Fine for the MVP / first deploys;
      // before the site sees real traffic we should switch to real
      // migrations via `payload generate:migration` + `payload migrate`
      // so schema changes are tracked in source control.
      push: true,
    })
  : sqliteAdapter({
      client: {
        url: dbUri,
      },
    })

// ─── Storage plugins — Vercel Blob only when the token is set ──────
const plugins =
  typeof process.env.BLOB_READ_WRITE_TOKEN === 'string' &&
  process.env.BLOB_READ_WRITE_TOKEN.length > 0
    ? [
        vercelBlobStorage({
          collections: {
            media: true,
          },
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }),
      ]
    : []

export default buildConfig({
  admin: {
    user: Users.slug,
    // Design Round 3: unlock Payload's built-in light/dark handling
    // so our [data-theme] attribute from AdminThemeInit.tsx + the
    // shared shoresh-theme localStorage key can drive the admin
    // between Night Apothecary light + dark. We re-skin both modes
    // via admin-brand.css elevation + success ladders.
    theme: 'all',
    // <html dir="rtl"> would otherwise warn under Next 16's stricter
    // hydration check.
    suppressHydrationWarning: true,
    meta: {
      titleSuffix: '— ניהול קופאה',
      icons: [{ rel: 'icon', url: '/brand/copaia.png' }],
    },
    // 2026-04-12 admin-fix EMERGENCY: ALL admin.components customizations
    // are commented out. The prod /admin SSR ships an empty React
    // Suspense boundary instead of Payload's admin shell — every route
    // (dashboard, collections, fulfillment) returns ~5KB of rendered
    // HTML containing only the providers' DOM (drifting-leaves, toaster,
    // dnd-kit announcer, portal divs) and 22 RSC-payload `__next_f.push`
    // script tags whose content never gets converted into real DOM
    // elements during client hydration. Local prod build does NOT
    // exhibit this — it ships the full template-default__nav-toggler-wrapper
    // SSR'd inline. Removing custom views alone (commit 53c25cb) did NOT
    // fix it; the bug persists with Payload's stock dashboard.
    //
    // This commit removes graphics + actions + providers + beforeNavLinks
    // + afterNavLinks ENTIRELY to test whether ANY of our customizations
    // are tripping React 19 streaming SSR. If a vanilla Payload admin
    // renders on prod, the bug is in our customization stack and the
    // bisect happens in next session. If a vanilla Payload admin ALSO
    // fails, it's a Payload 3.82 + Next 16 + Vercel runtime
    // incompatibility we'll need to file upstream.
    //
    // All admin component files (BrandLogo, BrandIcon, AdminThemeInit,
    // AdminToaster, AdminDriftingLeaves, OnboardingTour, AdminLangSwitcher,
    // HelpButton, ViewOnSite, SidebarGreeting, SidebarFooter,
    // YaritDashboard, FulfillmentView) remain on disk, the importMap.js
    // entry stays, and the re-enable in next session is reverting this
    // commit alone.
    //
    // components: {
    //   graphics: {
    //     Logo: { path: '@/components/admin/payload/BrandLogo#BrandLogo' },
    //     Icon: { path: '@/components/admin/payload/BrandIcon#BrandIcon' },
    //   },
    //   beforeNavLinks: [
    //     { path: '@/components/admin/payload/SidebarGreeting#SidebarGreeting' },
    //   ],
    //   afterNavLinks: [
    //     { path: '@/components/admin/payload/SidebarFooter#SidebarFooter' },
    //   ],
    //   actions: [
    //     { path: '@/components/admin/payload/AdminLangSwitcher#AdminLangSwitcher' },
    //     { path: '@/components/admin/payload/HelpButton#HelpButton' },
    //     { path: '@/components/admin/payload/ViewOnSite#ViewOnSite' },
    //   ],
    //   providers: [
    //     { path: '@/components/admin/payload/AdminThemeInit#AdminThemeInit' },
    //     { path: '@/components/admin/payload/AdminToaster#AdminToaster' },
    //     { path: '@/components/admin/payload/AdminDriftingLeaves#AdminDriftingLeaves' },
    //     { path: '@/components/admin/payload/OnboardingTour#OnboardingTour' },
    //   ],
    // },
  },
  collections: [Users, Media, Tags, Categories, Products, Orders],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  // PAYLOAD_SECRET gate — hard-fail in production, dev-friendly fallback
  // otherwise. We used to silently fall back to `'dev-only-secret-...'`
  // in ALL environments, which meant a prod deploy with a missing env
  // var would quietly sign JWTs + HMAC tokens with a secret anyone with
  // access to the source code could forge. That's the kind of mistake
  // you only notice after someone exploits it. Now: if NODE_ENV is
  // production (or "production-like") and PAYLOAD_SECRET is unset or
  // too short, the module throws at load time with a loud error, which
  // bubbles up as a failed build / failed deploy. Local dev still
  // works with an empty .env.local because we only throw outside of
  // development mode.
  secret: (() => {
    const secret = process.env.PAYLOAD_SECRET
    const isProdLike =
      process.env.NODE_ENV === 'production' ||
      process.env.VERCEL_ENV === 'production' ||
      process.env.VERCEL_ENV === 'preview'
    if (!secret || secret.length < 16) {
      if (isProdLike) {
        throw new Error(
          [
            '',
            '❌  PAYLOAD_SECRET is missing or too short in a production-like environment.',
            '',
            '    Set a strong secret (>= 16 chars) in the deploy environment:',
            '        Vercel → Settings → Environment Variables → PAYLOAD_SECRET',
            '',
            '    NEVER use the hardcoded dev fallback in production — it can be read',
            '    from source and would let an attacker forge auth tokens.',
            '',
            '    ❌  חסרה מחרוזת PAYLOAD_SECRET או שהיא קצרה מדי בסביבת פרודקשן.',
            '        יש להגדיר מחרוזת חזקה (לפחות 16 תווים) ב־Vercel → Settings.',
            '',
          ].join('\n'),
        )
      }
      // Dev fallback — loud warning but don't block local work.
      console.warn(
        '⚠️  PAYLOAD_SECRET is unset — using dev fallback. DO NOT ship this to prod.',
      )
      return 'dev-only-secret-change-in-production'
    }
    return secret
  })(),

  // Content localization — per-field translations for fields marked
  // `localized: true`. Hebrew is default; English is the fallback.
  localization: {
    locales: [
      { code: 'he', label: 'עברית' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'he',
    fallback: true,
  },

  // Admin UI language — Hebrew by default for Yarit.
  // English is still available via the admin locale switcher for
  // the dev + any future English-speaking collaborators.
  // See: docs/DECISIONS.md ADR-011 (Hebrew admin defaults).
  i18n: {
    supportedLanguages: { en, he },
    fallbackLanguage: 'he',
  },

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db,
  plugins,

  // Phase F.1 — bridge Payload's email layer (auth flows: forgot
  // password, etc.) into our existing storefront EmailProvider so
  // dev runs print the rendered HTML to the console and prod runs
  // can swap to Resend via EMAIL_PROVIDER. Without this, the
  // forgot-password endpoint would silently log to payload.logger
  // and customers would never see their reset URL.
  email: copaiaEmailAdapter,

  // Sharp enables Payload's image processing (resizing, format conversion).
  sharp,

  // Static serving for local-dev media uploads. In production we swap
  // to Vercel Blob via the plugin above.
  upload: {
    limits: {
      fileSize: 10_000_000, // 10 MB
    },
  },
})
