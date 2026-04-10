/**
 * Playwright probe for the production cart flow.
 * Goes to the homepage, captures console/network errors, then tries
 * to click the first Add-to-Cart button and verifies the drawer
 * opens. Writes a screenshot before + after the click.
 */
import { chromium } from 'playwright-core'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const baseUrl = process.argv[2] ?? 'https://yarit-shop.vercel.app'

async function main() {
  let executablePath
  try {
    const mod = await import('@playwright/browser-chromium')
    executablePath = mod.executablePath?.() ?? mod.default?.executablePath?.()
  } catch {}

  const browser = await chromium.launch({ headless: true, executablePath })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()

  const consoleLines = []
  const failedRequests = []

  page.on('console', (msg) => {
    consoleLines.push(`[${msg.type()}] ${msg.text()}`)
  })
  page.on('pageerror', (err) => {
    consoleLines.push(`[pageerror] ${err.message}`)
  })
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.failure()?.errorText ?? 'FAIL'} ${req.url()}`)
  })
  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedRequests.push(`${res.status()} ${res.url()}`)
    }
  })

  const outDir = resolve(__dirname, '..', 'tmp')
  mkdirSync(outDir, { recursive: true })

  console.log(`\n=== ${baseUrl}/ ===`)
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: resolve(outDir, 'probe-home.png'), fullPage: true })

  // Scroll to featured products so they're in view
  const featured = await page.$('h2:has-text("מוצרים נבחרים")')
  if (featured) await featured.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)

  // Count add-to-cart buttons (Hebrew + English)
  const buttons = await page.$$(
    'button:has-text("הוסיפי לעגלה"), button:has-text("הוסף לעגלה"), button:has-text("Add to cart")',
  )
  console.log(`add-to-cart buttons found: ${buttons.length}`)

  if (buttons.length > 0) {
    console.log('clicking first add-to-cart button...')
    await buttons[0].click({ force: false, timeout: 5000 }).catch((e) => {
      console.log(`click error: ${e.message}`)
    })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: resolve(outDir, 'probe-after-click.png'), fullPage: true })

    const dialogs = await page.$$('[role="dialog"]')
    console.log(`dialog elements after click: ${dialogs.length}`)

    for (let i = 0; i < dialogs.length; i++) {
      const dialog = dialogs[i]
      const isVisible = await dialog.isVisible()
      const box = await dialog.boundingBox()
      const html = await dialog.evaluate((el) => el.outerHTML.slice(0, 200))
      const classes = await dialog.evaluate((el) => el.className)
      const label = await dialog.evaluate(
        (el) => el.getAttribute('aria-label') ?? '',
      )
      console.log(`  dialog[${i}]: label="${label}" visible=${isVisible}`)
      console.log(`    class="${classes}"`)
      console.log(`    box=${JSON.stringify(box)}`)
      console.log(`    outerHTML[0:200]="${html}"`)
    }

    // Check drawer store state
    const drawerState = await page.evaluate(() => {
      // Zustand stores aren't directly exposed; check DOM instead
      const drawer = document.querySelector('aside')
      if (!drawer) return { hasAside: false }
      const style = window.getComputedStyle(drawer)
      return {
        hasAside: true,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        transform: style.transform,
        width: style.width,
        right: style.right,
      }
    })
    console.log(`drawer aside: ${JSON.stringify(drawerState)}`)

    // Check the cart state via localStorage
    const cart = await page.evaluate(() =>
      window.localStorage.getItem('shoresh-cart'),
    )
    console.log(`localStorage shoresh-cart: ${cart ?? 'null'}`)
  }

  console.log('\n=== console / page errors ===')
  for (const l of consoleLines.slice(0, 30)) console.log(l)

  console.log('\n=== failed requests ===')
  for (const f of failedRequests.slice(0, 20)) console.log(f)

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
