import '#frontend.css'
import { JSX, ReactNode, Suspense, ViewTransition } from 'react'
import type { Metadata, Viewport } from 'next'

import { DraftModeListener } from '@website/app-components/LivePreviewListener/index'
import { AllProviders } from '@website/app-components/Providers/index'
import { SkipToMainContent } from '@website/app-components/SkipToMainContent/index'
import { Toasty } from '@website/app-components/Toasty/index'
import { UmamiSuppressionFlag } from '@website/app-components/UmamiSuppressionFlag/index'
import PPFramaText from '@website/font-pp-frama-text/next'
import PPFrama from '@website/font-pp-frama/next'
import PPSupplyMono from '@website/font-pp-supply-mono/next'
import PPSupplySans from '@website/font-pp-supply-sans/next'
import { BLOG_FEED_PATH } from '@website/lib/blog/feed'
import { generatePersonSchema, generateWebSiteSchema, JsonLd } from '@website/lib/jsonLd'
import { cn } from 'tailwind-variants'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'

export default async function RootLayout({
  children,
}: {
  children: ReactNode | ReactNode[]
}): Promise<JSX.Element> {
  const [globalUserSettings, SiteSettings] = await Promise.all([
    fetchGlobalUserSettingsCached(),
    fetchSiteSettingsCached(),
  ])

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
        <JsonLd data={[personSchema, webSiteSchema]} />
      </head>
      <body>
        {/*
          `draftMode()` is a runtime API, so it is read inside this boundary
          rather than in the layout body — otherwise it blocks the whole route
          from prerendering under `cacheComponents`.
        */}
        <Suspense fallback={null}>
          <DraftModeListener />
        </Suspense>
        {/*
          `isTrackingSuppressed()` calls `cookies()` — a runtime API — so it
          is read inside this boundary rather than in the layout body,
          otherwise it blocks the whole route from prerendering under
          `cacheComponents`.
        */}
        <Suspense fallback={null}>
          <UmamiSuppressionFlag />
        </Suspense>
        <AllProviders>
          <SkipToMainContent targetId="main-content" />
          <Header />
          {/*
            Route navigations crossfade this block; header and footer stay put
            (see "View transitions" in frontend.css). It lives in the layout, so
            a navigation updates it rather than remounting it: the animation
            has to go on `update`, not `share`.
          */}
          <Suspense fallback={null}>
            <ViewTransition name="page-content" update="page-transition" default="none">
              <div id="main-content">{children}</div>
            </ViewTransition>
          </Suspense>
          <Footer />
        </AllProviders>
        <Toasty />
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const serverUrl = process.env.SERVER_URL
  const SiteSettings = await fetchSiteSettingsCached()

  return {
    metadataBase: serverUrl ? new URL(serverUrl) : undefined,
    title: SiteSettings.general?.siteName,

    // feed autodiscovery (`<link rel="alternate" type="application/rss+xml">`)
    alternates: {
      types: {
        'application/rss+xml': [
          {
            url: BLOG_FEED_PATH,
            title: 'Blog',
          },
        ],
      },
    },

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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
}
