import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Toasty } from '@/components/Toasty'

import '@styles/frontend.css'

import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import { ThemeProvider } from 'next-themes'
import type { JSX, ReactNode } from 'react'

import { WebVitalsProvider } from '@/components/WebVitalsProvider'
import { UmamiProvider } from '@/contexts/Umami'
import { getCachedSiteMetaData } from '@/lib/getSiteMetaData'
import { getCachedUserMetaData } from '@/lib/getUserMetaData'
import { generatePersonSchema, generateWebSiteSchema, JsonLd } from '@/utilities/jsonLd'

export default async function RootLayout({ children }: { children: ReactNode | ReactNode[] }): Promise<JSX.Element> {
  const { isEnabled: draft } = await draftMode()
  const userMetaData = await getCachedUserMetaData()
  const siteMetaData = await getCachedSiteMetaData()
  const personSchema = generatePersonSchema(userMetaData)
  const webSiteSchema = generateWebSiteSchema(siteMetaData)

  return (
    <html lang="en" data-theme="system" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <JsonLd data={[personSchema, webSiteSchema]} />
      </head>
      <body>
        {draft && <LivePreviewListener />}
        <WebVitalsProvider>
          <ThemeProvider disableTransitionOnChange enableColorScheme enableSystem>
            <UmamiProvider src="/stats/script.js" websiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}>
              <Header />
              {children}
              <Footer />
              <Toasty />
            </UmamiProvider>
          </ThemeProvider>
        </WebVitalsProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL),
  title: process.env.NEXT_PUBLIC_SERVER_URL,
  icons: [
    { rel: 'icon', url: '/favicon.ico', sizes: '32x32' },
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
}
