import '@/styles/frontend.css'

import { draftMode } from 'next/headers'

import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import type { JSX, ReactNode } from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Toasty } from '@/components/Toasty'
import { UmamiProvider } from '@/contexts/Umami'
import PPFrama from '@/fonts/pp-frama'
import PPFramaText from '@/fonts/pp-frama-text'
import PPSupplyMono from '@/fonts/pp-supply-mono'
import PPSupplySans from '@/fonts/pp-supply-sans'
import { cn } from '@/lib/cn'
import { getCachedSiteConfigurationData } from '@/lib/getSiteConfigurationData'
import { getCachedUserConfigurationData } from '@/lib/getUserConfigurationData'
import { generatePersonSchema, generateWebSiteSchema, JsonLd } from '@/lib/jsonLd'

export default async function RootLayout({
  children,
}: {
  children: ReactNode | ReactNode[]
}): Promise<JSX.Element> {
  const { isEnabled: draft } = await draftMode()
  const userConfigurationData = await getCachedUserConfigurationData()
  const siteConfigurationData = await getCachedSiteConfigurationData()
  const personSchema = generatePersonSchema(userConfigurationData)
  const webSiteSchema = generateWebSiteSchema(siteConfigurationData)

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL),
  title: process.env.NEXT_PUBLIC_SERVER_URL,

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
