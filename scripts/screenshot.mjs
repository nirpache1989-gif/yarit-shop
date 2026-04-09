/**
 * One-off screenshot utility for visual verification.
 * Usage:
 *   node scripts/screenshot.mjs [baseUrl]
 *
 * Default base URL is http://localhost:3000. Pass a different one to
 * hit a different port (e.g. http://localhost:3001 when another dev
 * server is running on 3000).
 */
import { chromium } from 'playwright-core'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const baseUrl = process.argv[2] ?? 'http://localhost:3000'

async function main() {
  let executablePath
  try {
    const mod = await import('@playwright/browser-chromium')
    executablePath = mod.executablePath?.() ?? mod.default?.executablePath?.()
  } catch {
    // fall back to playwright's own discovery
  }

  const browser = await chromium.launch({ headless: true, executablePath })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()

  const outDir = resolve(__dirname, '..', 'tmp')
  mkdirSync(outDir, { recursive: true })

  const targets = [
    { url: `${baseUrl}/`, filename: 'home-he.png' },
    { url: `${baseUrl}/en`, filename: 'home-en.png' },
    { url: `${baseUrl}/admin`, filename: 'admin.png' },
  ]

  for (const { url, filename } of targets) {
    console.log(`capturing ${url}`)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(1200)
    const path = resolve(outDir, filename)
    await page.screenshot({ path, fullPage: true })
    console.log(`  -> ${path}`)
  }

  await browser.close()
  console.log('done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
