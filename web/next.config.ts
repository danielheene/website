import { env } from '@/types/environment'
import { withPayload } from '@payloadcms/next/withPayload'
import { NextConfig } from 'next'
import { z } from 'zod'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadRootEnv } from './env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default async (phase, { defaultConfig }) => {
  loadRootEnv(dirname)

  const parsedEnv = env.safeParse(process.env)
  if (!parsedEnv.success) {
    console.error('\n' + z.prettifyError(parsedEnv.error) + '\n')
    process.exit(1)
  }

  const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,

    serverExternalPackages: ['@react-pdf/renderer', 'svgo', 'pdf-parse'],
    turbopack: {
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.wasm', '.json', '.css', '.scss', '.svg'],
    },
    images: {
      formats: ['image/webp', 'image/avif'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      remotePatterns: [
        new URL(`${process.env.SERVER_URL}/**`),
        new URL('https://daniel.heene.io/**'),
        new URL('https://daniel.heene.dev/**'),
        new URL('https://daniel.heene.review/**'),
        new URL('https://daniel.heene.nexus/**'),
        new URL('https://daniel.heene.local/**'),
        new URL('https://cdn.pixabay.com/**'),
        new URL('https://images.unsplash.com/**'),
      ],
      localPatterns: [{ pathname: '**' }],
      contentDispositionType: 'inline',
      contentSecurityPolicy: 'default-src \'self\'; script-src \'none\'; sandbox;',
      dangerouslyAllowSVG: true,
    },
    allowedDevOrigins: [
      'daniel.heene.nexus',
      '*.daniel.heene.nexus',
      'daniel.heene.local',
      '*.daniel.heene.local',
    ],

    env: {
      SERVER_HOST: process.env.SERVER_HOST,
      SERVER_URL: process.env.SERVER_URL,
      STATUS_PAGE_URL: process.env.STATUS_PAGE_URL,
      STATUS_PAGE_HEARTBEAT_URL: process.env.STATUS_PAGE_HEARTBEAT_URL,
      SENTRY_DSN: process.env.SENTRY_DSN,
    },

    webpack: (config, context) => {
      const nextConfig = { ...config }
      nextConfig.resolve = {
        ...config.resolve,
        extensionAlias: {
          '.cjs': ['.cts', '.cjs'],
          '.js': ['.ts', '.tsx', '.js', '.jsx'],
          '.mjs': ['.mts', '.mjs'],
        },
        alias: {
          ...config.resolve.alias,
          '@': path.resolve(__dirname, 'src'),

          '@access': path.resolve(dirname, './src/access/'),
          '@blocks': path.resolve(dirname, './src/blocks'),
          '@collections': path.resolve(dirname, './src/collections'),
          '@components': path.resolve(dirname, './src/components'),
          '@fields': path.resolve(dirname, './src/fields'),
          '@fonts': path.resolve(dirname, './src/fonts'),
          '@globals': path.resolve(dirname, './src/globals'),
          '@lib': path.resolve(dirname, './src/lib'),
          '@pdf': path.resolve(dirname, './src/pdf'),
          '@styles': path.resolve(dirname, './src/styles'),
          '@jobs-queue': path.resolve(dirname, './src/jobs-queue'),
          '@types': path.resolve(dirname, './src/types'),
        },
      }

      return config
    },

    async rewrites() {
      const rewrites = []

      if (process.env['NEXT_PUBLIC_UMAMI_URL']) {
        rewrites.push({
          source: '/stats/:match*',
          destination: `${process.env['NEXT_PUBLIC_UMAMI_URL']}/:match*`,
        })
      }

      return rewrites
    },
  }

  return [
    [withBundleAnalyzer, undefined],
    [withPayload, { devBundleServerPackages: false }],
  ].reduce((acc, [plugin, options]) => plugin(acc, options), nextConfig)
}
