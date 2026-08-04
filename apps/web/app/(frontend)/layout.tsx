import '#frontend.css'

import { JSX, ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'

import { AllProviders } from '@repo/ui/Providers'
import { SkipToMainContent } from '@repo/ui/SkipToMainContent'
import { Toasty } from '@repo/ui/Toasty'
import { cn } from '@repo/utils/cn'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import PPFrama from '@/fonts/pp-frama/next'
import PPFramaText from '@/fonts/pp-frama-text/next'
import PPSupplyMono from '@/fonts/pp-supply-mono/next'
import PPSupplySans from '@/fonts/pp-supply-sans/next'
import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'
import { generatePersonSchema, generateWebSiteSchema, JsonLd } from '@/lib/jsonLd'

export default async function RootLayout({
  children,
}: {
  children: ReactNode | ReactNode[]
}): Promise<JSX.Element> {
  const { isEnabled: draft } = await draftMode()
  const globalUserSettings = await fetchGlobalUserSettingsCached()
  const SiteSettings = await fetchSiteSettingsCached()
  const personSchema = generatePersonSchema(globalUserSettings)
  const webSiteSchema = generateWebSiteSchema(SiteSettings)

  return (
    <html
      lang="en"
      className={cn([
        PPSupplySans.variable,
        PPSupplyMono.variable,
        PPFrama.variable,
        PPFramaText.variable,
      ])}
      data-theme="system"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <JsonLd
          data={[
            personSchema,
            webSiteSchema,
          ]}
        />
      </head>
      <body>
        {/*{draft && <LivePreviewListener />}*/}
        <AllProviders>
          <SkipToMainContent targetId="main-content" />
          <Header />
          {children}
          <Footer />
        </AllProviders>
        <Toasty />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SERVER_URL),
  title: process.env.SERVER_URL,

  icons: [
    {
      rel: 'shortcut icon',
      url: '/favicon.ico',
      sizes: '16x16 32x32 48x48',
      type: 'image/x-icon',
    },
    {
      rel: 'icon',
      url: '/favicon.svg',
      type: 'image/svg+xml',
    },
    {
      rel: 'icon',
      url: '/favicon-96x96.png',
      type: 'image/png',
      sizes: '96x96',
    },
    {
      rel: 'icon',
      url: '/favicon-192x192.png',
      type: 'image/png',
      sizes: '192x192',
    },
    {
      rel: 'icon',
      url: '/favicon-512x512.png',
      type: 'image/png',
      sizes: '512x512',
    },
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
      type: 'image/png',
      sizes: '180x180',
    },
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
}
