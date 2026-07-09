import { env } from '@/types/environment'
import { withPayload } from '@payloadcms/next/withPayload'
import { NextConfig } from 'next'
import { z } from 'zod'
import { ChildProcess, spawn } from 'node:child_process'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'


const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})


let server: ChildProcess
const createTunnel = (token: string) => new Promise<ChildProcess | null>((resolve) => {
  const childProcess = spawn(
    'npx wrangler tunnel run',
    [
      `--token ${token}`,
    ],
    {
      shell: true,
      stdio: 'ignore',
    },
  )
  childProcess.once('spawn', () => {
    resolve(childProcess)
  })
  childProcess.once('error', () => {
    resolve(null)
  })
})


export default async (phase, { defaultConfig }) => {

  console.debug(process.env)
  const parsedEnv = env.safeParse(process.env)
  if (!parsedEnv.success) {
    console.error('\n' + z.prettifyError(parsedEnv.error) + '\n')
    process.exit(1)
  }
  console.debug(parsedEnv.data)

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    if (!server && process.env.CLOUDFLARE_TUNNEL_URL && process.env.CLOUDFLARE_TUNNEL_HOST && process.env.CLOUDFLARE_TUNNEL_TOKEN) {
      server = await createTunnel(parsedEnv.data.CLOUDFLARE_TUNNEL_TOKEN)
    }
    if (server) {
      process.env.SERVER_HOST = process.env.CLOUDFLARE_TUNNEL_HOST
      process.env.SERVER_URL = process.env.CLOUDFLARE_TUNNEL_URL
    }
  }


  const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    eslint: {
      ignoreDuringBuilds: true,
    },
    experimental: {
      // cacheComponents: true,
      // viewTransition: true,
    },
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


    // webpack: (config, options) => {
    //   config.resolve.extensionAlias = {
    //     '.cjs': ['.cts', '.cjs'],
    //     '.js': ['.ts', '.tsx', '.js', '.jsx'],
    //     '.mjs': ['.mts', '.mjs'],
    //   }
    //
    //   config.plugins.push(new MiniCssExtractPlugin())
    //
    //   config.module.rules.push({
    //     test: /\.css$/i,
    //     use: [MiniCssExtractPlugin.loader, 'css-loader', '@tailwindcss/webpack'],
    //   },)
    //
    //   return config
    // },

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
    // [withSentryConfig, {
    //   org: process.env.SENTRY_ORG,
    //   project: process.env.SENTRY_PROJECT,
    //
    //   // Only print logs for uploading source maps in CI
    //   authToken: process.env.SENTRY_AUTH_TOKEN,
    //   silent: !process.env.CI,
    //   // Upload a larger set of source maps for prettier stack traces
    //   widenClientFileUpload: true,
    //   tunnelRoute: "/monitoring",
    //   webpack: {
    //     treeshake: {
    //       // Automatically tree-shake Sentry logger statements to reduce bundle size
    //       removeDebugLogging: true,
    //     },
    //   }
    // }],
  ].reduce((acc, [plugin, options]) => plugin(acc, options), nextConfig)
}
