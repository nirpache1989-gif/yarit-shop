/**
 * @file Payload CMS configuration for Shoresh
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
 *              zero config, file at ./shoresh-dev.db)
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ─── Database adapter — pick based on DATABASE_URI shape ────────────
const dbUri = process.env.DATABASE_URI || 'file:./shoresh-dev.db'
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
    meta: {
      titleSuffix: '— Shoresh Admin',
    },
  },
  collections: [Users, Media, Tags, Categories, Products, Orders],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-change-in-production',

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
