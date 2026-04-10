#!/usr/bin/env node
/**
 * @file scripts/reset-db.mjs — wipe local SQLite + uploaded media
 * @summary Cross-platform replacement for the old `rm -f …` shell
 *          script in package.json. Uses `fs.rmSync` which works on
 *          Windows, macOS, and Linux without needing a POSIX shell.
 *
 *          WHAT IT DOES:
 *            1. Deletes the SQLite database file and its WAL/SHM
 *               siblings (if present).
 *            2. Removes the `public/media` directory so uploaded
 *               assets don't leak between resets.
 *
 *          WHAT IT DOES NOT:
 *            - Touch anything outside the repo.
 *            - Recreate the admin user or seed products — use the
 *              `/api/dev/create-admin` and `/api/dev/seed` endpoints
 *              after `npm run dev` to reseed.
 *            - Touch anything in `node_modules/`.
 *
 *          Usage: `npm run reset-db`
 *
 *          Refuses to run if `NODE_ENV=production` is set — this is
 *          a dev-only destructive script.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

if (process.env.NODE_ENV === 'production') {
  console.error('reset-db: refusing to run with NODE_ENV=production')
  process.exit(1)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const filesToRemove = [
  'shoresh-dev.db',
  'shoresh-dev.db-journal',
  'shoresh-dev.db-shm',
  'shoresh-dev.db-wal',
]

const dirsToRemove = ['public/media']

let removedSomething = false

for (const rel of filesToRemove) {
  const p = path.join(repoRoot, rel)
  if (fs.existsSync(p)) {
    fs.rmSync(p, { force: true })
    console.log(`reset-db: removed ${rel}`)
    removedSomething = true
  }
}

for (const rel of dirsToRemove) {
  const p = path.join(repoRoot, rel)
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true })
    console.log(`reset-db: removed ${rel}/`)
    removedSomething = true
  }
}

if (!removedSomething) {
  console.log('reset-db: nothing to remove — already clean.')
}

console.log('reset-db: done. Run `npm run dev` and recreate the admin via')
console.log(
  '    curl -X POST http://localhost:3000/api/dev/create-admin \\',
)
console.log('        -H "content-type: application/json" \\')
console.log(
  '        -d \'{"email":"admin@shoresh.example","password":"admin1234"}\'',
)
