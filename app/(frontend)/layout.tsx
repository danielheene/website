import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Toasty } from '@/components/Toasty'

import '@styles/frontend.css'
import { UIProvider } from '@/contexts/UI'
import { UmamiProvider } from '@/contexts/Umami'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import React, { JSX, ReactNode } from 'react'

export default async function RootLayout({ children }: { children: ReactNode | ReactNode[] }): Promise<JSX.Element> {
  return (
    <html lang="en" data-theme="system" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider disableTransitionOnChange enableColorScheme enableSystem>
          <UmamiProvider src="/stats/script.js" websiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}>
            <UIProvider>
              <Header />
              {children}
              <Footer />
            </UIProvider>
            <SpeedInsights />
            <Toasty />
          </UmamiProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_SERVER_URL,
    template: '%s | ' + process.env.NEXT_PUBLIC_SERVER_URL,
  },
  icons: [
    { rel: 'icon', url: '/favicon.ico', sizes: '32x32' },
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
  ],

  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL),

  category: 'website',

  creator: 'Daniel Heene',
  publisher: 'Daniel Heene',
  openGraph: {
    images: `/og-image.webp`,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
}
