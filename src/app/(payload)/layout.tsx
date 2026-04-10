/**
 * @file Payload admin root layout
 * @summary Root layout for everything inside the `(payload)` route
 *          group. Owns its own <html>/<body> (isolated from the
 *          storefront root layout in `(storefront)`), imports
 *          Payload's admin CSS + our brand override CSS, wires the
 *          server-function handler, and passes Hebrew/RTL +
 *          next-font CSS variables to <html> via htmlProps.
 *
 *          We deliberately do NOT import `globals.css` here — the
 *          storefront stylesheet would drag Tailwind into the admin
 *          and rewrite Payload's variables. The admin uses
 *          `admin-brand.css` instead, which is plain CSS and only
 *          targets Payload's class names + theme tokens.
 *
 *          See: docs/ARCHITECTURE.md §Admin, plan §1.2.
 */
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'
import { Heebo, Bellefair } from 'next/font/google'

import { importMap } from './admin/importMap.js'

import '@payloadcms/next/css'
import './admin-brand.css'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-heebo',
  display: 'swap',
})

// Display font — swapped from Frank Ruhl Libre to Bellefair
// (Design Round 3 follow-up). The CSS variable name stays
// `--font-frank-ruhl` so admin-brand.css rules that reference
// var(--font-frank-ruhl) keep working without edits.
const bellefair = Bellefair({
  subsets: ['hebrew', 'latin'],
  weight: ['400'],
  variable: '--font-frank-ruhl',
  display: 'swap',
})

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
    htmlProps={{
      lang: 'he',
      dir: 'rtl',
      className: `${heebo.variable} ${bellefair.variable}`,
    }}
  >
    {children}
  </RootLayout>
)

export default Layout
