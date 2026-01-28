import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Toasty } from '@/components/Toasty'

import '@styles/frontend.css'
import { UIProvider } from '@/contexts/UI'
import { UmamiProvider } from '@/contexts/Umami'
import { JsonLd, generatePerson, generateWebSite } from '@/utilities/jsonLd'
import { GlobalSlug } from '@custom-types'
import config from '@payload-config'
import type { Media as MediaType, ResumeAboutMeGlobalData, ResumeContactGlobalData } from '@payload-types'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { getPayload } from 'payload'
import React, { JSX, ReactNode } from 'react'

export default async function RootLayout({ children }: { children: ReactNode | ReactNode[] }): Promise<JSX.Element> {
  const payload = await getPayload({ config })

  // Fetch resume data for Person schema
  const aboutMe = await payload.findGlobal({
    slug: GlobalSlug.ResumeAboutMe,
  })

  const contact = await payload.findGlobal({
    slug: GlobalSlug.ResumeContact,
  })

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://danielheene.de'

  // Extract portrait image URL
  const portrait = aboutMe && 'portrait' in aboutMe && typeof aboutMe.portrait === 'object' ? (aboutMe.portrait as MediaType) : null
  const portraitUrl = portrait?.url ? `${baseUrl}${portrait.url}` : undefined

  const aboutMeTitle = aboutMe && 'title' in aboutMe ? aboutMe.title as string : undefined

  // Generate Person schema
  const personSchema = generatePerson({
    name: 'Daniel Heene',
    url: baseUrl,
    image: portraitUrl,
    description: aboutMeTitle,
  })

  // Generate WebSite schema
  const webSiteSchema = generateWebSite({
    name: process.env.NEXT_PUBLIC_SERVER_URL || 'Daniel Heene',
    url: baseUrl,
    description: aboutMeTitle,
  })

  return (
    <html lang="en" data-theme="system" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <JsonLd data={[personSchema, webSiteSchema]} />
      </head>
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
