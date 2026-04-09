/**
 * @file Payload admin root layout
 * @summary This is the root layout for everything inside the `(payload)`
 *          route group. It owns its own <html>/<body> (isolated from the
 *          storefront root layout in `(storefront)`), imports Payload's
 *          admin CSS, and wires the server-function handler that the
 *          admin panel uses for privileged actions.
 *
 *          We do NOT apply the storefront brand CSS here — the admin
 *          panel runs on Payload's own theme.
 *
 *          See: docs/ARCHITECTURE.md §Admin, plan §5.
 */
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'

import { importMap } from './admin/importMap.js'

import '@payloadcms/next/css'

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
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
