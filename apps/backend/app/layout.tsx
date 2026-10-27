import type React from 'react'
import '@payloadcms/next/css'

/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'

import PPFramaText from '@website/font-pp-frama-text/next'
import PPFrama from '@website/font-pp-frama/next'
import PPSupplyMono from '@website/font-pp-supply-mono/next'
import PPSupplySans from '@website/font-pp-supply-sans/next'
import { cn } from 'tailwind-variants'

import { importMap } from './importMap.js'

import './backend.css'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async (args) => {
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
      className: cn([
        PPSupplySans.variable,
        PPSupplyMono.variable,
        PPFrama.variable,
        PPFramaText.variable,
      ]),
      suppressHydrationWarning: true,
    }}
  >
    {children}
  </RootLayout>
)

export default Layout
