import type { Metadata } from 'next'
import React, { JSX, ReactNode } from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Toasty } from '@/components/Toasty'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import '@styles/fonts/inter.css'
import '@styles/fonts/jetbrains-mono.css'
import '@styles/fonts/pp-supply-mono.css'
import '@styles/frontend.css'

export default async function RootLayout({
  children,
}: {
  children: ReactNode | ReactNode[]
}): Promise<JSX.Element> {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <LivePreviewListener />
        <div id="layout">
          <Header />
          {children}
          <Footer />
        </div>
        <Analytics />
        <SpeedInsights />
        <Toasty />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL),
  creator: 'Daniel Heene',
  publisher: 'Daniel Heene',
  openGraph: {
    images: `/og-image.webp`,
  },
  icons: [
    { url: `/favicon.ico`, rel: 'icon', sizes: '32x32' },
    {
      url: `/favicon.svg`,
      rel: 'icon',
      type: 'image/svg+xml',
    },
  ],
}
