#!/usr/bin/env node
/**
 * @file scripts/ensure-importmap.mjs
 * @summary Permanent guard for the admin P0 bug — ensures
 *          `src/app/(payload)/admin/importMap.js` contains the
 *          `VercelBlobClientUploadHandler` entry from
 *          `@payloadcms/storage-vercel-blob/client` after every
 *          `next build`.
 *
 *          Background: Payload 3 regenerates this import map on
 *          every `npm run build`. If `BLOB_READ_WRITE_TOKEN` is not
 *          present at build time (local dev, or a Vercel build that
 *          doesn't expose build-time secrets), the `vercelBlobStorage`
 *          plugin short-circuits out of the config, the regenerated
 *          import map drops the handler reference, and the Payload
 *          admin client bundle crashes silently on hydrate → blank
 *          dashboard / parchment background with no content.
 *
 *          The old workaround (CLAUDE.md rule #13) was manual:
 *          run `git diff src/app/(payload)/admin/importMap.js` after
 *          every build and restore from HEAD if the line was
 *          missing. That holds locally but does NOT protect Vercel
 *          builds — Vercel runs `npm run build` on a clean checkout
 *          and ships whatever Payload regenerated.
 *
 *          This script fixes that permanently:
 *            1. Wired as the `postbuild` npm script so it runs after
 *               `next build` in every environment — local, CI,
 *               Vercel.
 *            2. Idempotent — does nothing if the entry is already
 *               present.
 *            3. Appends the import statement at the end of the
 *               import block and appends the map entry in the
 *               exported `importMap` object.
 *
 *          If `BLOB_READ_WRITE_TOKEN` is ever set at build time AND
 *          Payload regenerates the entry itself, this script is a
 *          no-op. If the token is missing, we patch the file so the
 *          admin still ships a working client bundle (the handler
 *          is declared in the bundle but won't be CALLED unless an
 *          upload happens — and no uploads happen on a token-less
 *          environment, so no runtime error either).
 *
 *          See: docs/DECISIONS.md ADR (to be added) — "admin
 *          importMap P0: permanent fix via postbuild guard".
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMPORT_MAP_PATH = resolve(
  __dirname,
  '..',
  'src',
  'app',
  '(payload)',
  'admin',
  'importMap.js',
)

const IMPORT_LINE =
  "import { VercelBlobClientUploadHandler as VercelBlobClientUploadHandler_a1b2c3d4e5f6 } from '@payloadcms/storage-vercel-blob/client'"
const MAP_ENTRY =
  '"@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler": VercelBlobClientUploadHandler_a1b2c3d4e5f6'

function main() {
  if (!existsSync(IMPORT_MAP_PATH)) {
    // Build did not produce the file — something upstream failed.
    // Bail without modifying anything; the failing build will be
    // the signal.
    console.warn(
      '[ensure-importmap] importMap.js not found at',
      IMPORT_MAP_PATH,
      '— skipping.',
    )
    return
  }

  const original = readFileSync(IMPORT_MAP_PATH, 'utf8')

  if (original.includes('VercelBlobClientUploadHandler')) {
    console.log(
      '[ensure-importmap] VercelBlobClientUploadHandler already present — no patch needed.',
    )
    return
  }

  // Locate the last `import` statement and insert our import on the
  // following line. Splitting on newlines keeps CRLF/LF both working
  // because we re-join with '\n' at the end and writeFileSync
  // produces LF on the output (git handles CRLF conversion on
  // Windows via .gitattributes / autocrlf).
  const lines = original.split(/\r?\n/)
  let lastImportIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImportIdx = i
  }
  if (lastImportIdx === -1) {
    throw new Error(
      '[ensure-importmap] Could not locate any import line in importMap.js',
    )
  }
  lines.splice(lastImportIdx + 1, 0, IMPORT_LINE)

  // Locate the last non-empty line before the closing `}` of the
  // exported `importMap` object, add a trailing comma to it, then
  // append our map entry just before the `}`.
  let closingBraceIdx = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '}') {
      closingBraceIdx = i
      break
    }
  }
  if (closingBraceIdx === -1) {
    throw new Error(
      '[ensure-importmap] Could not locate closing `}` of importMap export.',
    )
  }

  // Walk backwards to find the last entry line — skip blank lines.
  let lastEntryIdx = -1
  for (let i = closingBraceIdx - 1; i >= 0; i--) {
    if (lines[i].trim().length > 0) {
      lastEntryIdx = i
      break
    }
  }
  if (lastEntryIdx === -1) {
    throw new Error(
      '[ensure-importmap] Could not locate last entry inside importMap object.',
    )
  }

  // Ensure the previous last entry has a trailing comma. If it
  // already ends with `,` we leave it alone.
  if (!lines[lastEntryIdx].trimEnd().endsWith(',')) {
    lines[lastEntryIdx] = lines[lastEntryIdx].trimEnd() + ','
  }
  lines.splice(closingBraceIdx, 0, '  ' + MAP_ENTRY)

  const patched = lines.join('\n')
  writeFileSync(IMPORT_MAP_PATH, patched, 'utf8')
  console.log(
    '[ensure-importmap] Patched importMap.js — added VercelBlobClientUploadHandler entry.',
  )
}

main()
