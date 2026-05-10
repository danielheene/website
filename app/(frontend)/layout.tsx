import '@/styles/frontend.css'

import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
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
import { getCachedSiteConfigurationData } from '@/lib/getSiteConfigurationData'
import { getCachedUserConfigurationData } from '@/lib/getUserConfigurationData'
import {
  generatePersonSchema,
  generateWebSiteSchema,
  JsonLd,
} from '@/lib/jsonLd'

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
      className={`${PPSupplyMono.variable} ${PPFrama.variable} ${PPFramaText.variable}`}
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
      rel: 'icon',
      url: '/favicon.ico',
      sizes: '32x32',
    },
    {
      rel: 'icon',
      url: '/favicon.svg',
      type: 'image/svg+xml',
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
