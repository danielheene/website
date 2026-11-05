import React from 'react'
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'

import { cn } from 'tailwind-variants'

import PPFramaText from '@/fonts/pp-frama-text/next'
import PPFrama from '@/fonts/pp-frama/next'
import PPSupplyMono from '@/fonts/pp-supply-mono/next'
import PPSupplySans from '@/fonts/pp-supply-sans/next'

import '@/styles/payload.css'

import { importMap } from './admin/importMap.js'

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
