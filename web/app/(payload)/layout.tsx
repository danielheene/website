/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'

import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import type React from 'react'

import { cn } from '@/lib/cn'
import PPFrama from '@danielheene/font-pp-frama/next'
import PPFramaText from '@danielheene/font-pp-frama-text/next'
import PPSupplyMono from '@danielheene/font-pp-supply-mono/next'
import PPSupplySans from '@danielheene/font-pp-supply-sans/next'

import { importMap } from './admin/importMap.js'

import '@/styles/payload.css'

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
