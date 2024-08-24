import type { Metadata } from 'next'
import React, { JSX, ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { Toasty } from '@/components/Toasty/Toasty'

import '@styles/frontend.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default async function RootLayout({
  children,
}: {
  children: ReactNode | ReactNode[]
}): Promise<JSX.Element> {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <AdminBar />
          <LivePreviewListener />
          <div className="layout">
            <Header />
            {children}
            <Footer />
          </div>
          <Analytics />
          <SpeedInsights />
          <Toasty />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://payloadcms.com'),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
