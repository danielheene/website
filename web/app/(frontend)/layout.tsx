import '@/styles/frontend.css'

import type { JSX, ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { draftMode } from 'next/headers'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { SkipToMainContent } from '@/components/SkipToMainContent'
import { Toasty } from '@/components/Toasty'
import { UmamiProvider } from '@/contexts/Umami'
import PPFrama from '@danielheene/font-pp-frama/next'
import PPFramaText from '@danielheene/font-pp-frama-text/next'
import PPSupplyMono from '@danielheene/font-pp-supply-mono/next'
import PPSupplySans from '@danielheene/font-pp-supply-sans/next'
import { cn } from '@/lib/cn'
import { getGlobalUserSettings } from '@/lib/getGlobalUserSettings'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { generatePersonSchema, generateWebSiteSchema, JsonLd } from '@/lib/jsonLd'

export default async function RootLayout({
  children,
}: {
  children: ReactNode | ReactNode[]
}): Promise<JSX.Element> {
  const { isEnabled: draft } = await draftMode()
  const globalUserSettings = await getGlobalUserSettings()
  const SiteSettings = await getSiteSettings()
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
        <SkipToMainContent targetId="main-content" />
        {draft && <LivePreviewListener />}
        <ThemeProvider disableTransitionOnChange enableColorScheme enableSystem>
          <UmamiProvider websiteId={process.env.NEXT_PUBLIC_UMAMI_SITE_ID}>
            <Header />
            {children}
            <Footer />
          </UmamiProvider>
        </ThemeProvider>
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
