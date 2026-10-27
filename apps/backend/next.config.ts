import { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

import z from 'zod'

import { envSchema } from '@/types/environment'

import { name as packageName, version as packageVersion } from './package.json'

const sentryRelease = `${packageName}@${packageVersion}`

export default async (_phase, { defaultConfig: _defaultConfig }) => {
  const parsedEnv = envSchema.safeParse(process.env)

  if (!parsedEnv.success) {
    console.error(`\n${z.prettifyError(parsedEnv.error)}\n`)
    process.exit(1)
  }

  const serverExternalPackages = [
    'mediabunny',
    '@mediabunny/server',
    '@react-pdf/renderer',
    'svgo',
    'pdf-parse',
    'node-av',
    '@takumi-rs/core',
    '@napi-rs/canvas',
  ]

  const nextConfig: NextConfig = {
    basePath: '/admin',

    poweredByHeader: false,
    productionBrowserSourceMaps: true,
    reactStrictMode: true,
    cacheComponents: true,
    // Explicitly opt out of Partial Prefetching: the app was built against the
    // legacy behaviour where dynamic data is included in the prefetch.
    partialPrefetching: false,

    compiler: {
      define: {},
      defineServer: {},
    },

    experimental: {
      turbopackServerFastRefresh: true,
      serverActions: {
        bodySizeLimit: '10mb',
      },
      optimizePackageImports: [
        '@payloadcms/next',
        '@payloadcms/translations',
        '@payloadcms/ui',
        'shiki',
        'usehooks-ts',
      ],
    },

    allowedDevOrigins: [
      'localhost:3000',
      '*.localhost:3000',
      'daniel.heene.nexus',
      '*.daniel.heene.nexus',
      'daniel.heene.local',
      '*.daniel.heene.local',
    ],

    env: {
      NEXT_PUBLIC_SENTRY_RELEASE: sentryRelease,
    },

    logging: {
      fetches: {
        fullUrl: true,
        hmrRefreshes: true,
      },
      serverFunctions: true,
      incomingRequests: true,
      browserToTerminal: 'error',
    },

    serverExternalPackages,

    turbopack: {
      resolveExtensions: [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.mjs',
        '.cjs',
        '.mdx',
        '.wasm',
        '.json',
        '.css',
        '.scss',
        '.svg',
      ],
    },

    images: {
      formats: ['image/webp', 'image/avif'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      remotePatterns: [
        new URL('http://localhost:3000/**'),
        new URL('https://daniel.heene.io/**'),
        new URL('https://daniel.heene.dev/**'),
        new URL('https://daniel.heene.review/**'),
        new URL('https://daniel.heene.nexus/**'),
        new URL('https://daniel.heene.local/**'),
        new URL('https://fsn1.your-objectstorage.com/**'),
        new URL('https://nbg1.your-objectstorage.com/**'),
        new URL('https://hel1.your-objectstorage.com/**'),
        new URL('https://cdn.pixabay.com/**'),
        new URL('https://images.unsplash.com/**'),
      ],
      localPatterns: [
        {
          pathname: '**',
        },
      ],
      contentDispositionType: 'inline',
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      dangerouslyAllowSVG: true,
    },

    async headers() {
      return [
        {
          source: '/:path*{/}?',
          headers: [
            {
              key: 'X-Accel-Buffering',
              value: 'no',
            },
          ],
        },
      ]
    },
  }

  const configWithPayload = withPayload(nextConfig, {
    devBundleServerPackages: false,
  })

  return configWithPayload
}
