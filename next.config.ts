import { ChildProcess, spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { NextConfig } from 'next'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'
import { withPayload } from '@payloadcms/next/withPayload'

import z from 'zod'

import { envSchema } from '@/types/environment'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

let server: ChildProcess
const createTunnel = (token: string) =>
  new Promise<ChildProcess | null>((resolve) => {
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
  const parsedEnv = envSchema.safeParse(process.env)
  if (!parsedEnv.success) {
    console.error(`\n${z.prettifyError(parsedEnv.error)}\n`)
    process.exit(1)
  }

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    if (
      !server &&
      process.env.CLOUDFLARE_TUNNEL_URL &&
      process.env.CLOUDFLARE_TUNNEL_HOST &&
      process.env.CLOUDFLARE_TUNNEL_TOKEN
    ) {
      server = await createTunnel(process.env.CLOUDFLARE_TUNNEL_TOKEN)
    }
    if (server) {
      process.env.SERVER_HOST = process.env.CLOUDFLARE_TUNNEL_HOST
      process.env.SERVER_URL = process.env.CLOUDFLARE_TUNNEL_URL
    }
  }

  const nextConfig: NextConfig = {
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    reactStrictMode: true,
    cacheComponents: true,
    // cacheHandler: require.resolve('./next.cache-handler.ts'),
    experimental: {
      viewTransition: true,
      appNewScrollHandler: true,
      serverActions: {
        bodySizeLimit: '10mb',
      },
    },

    /**
     *    Allowed Dev Origins
     */
    allowedDevOrigins: [
      'localhost:3000',
      // Docker-based Playwright E2E reaches the host dev server via this name
      'host.docker.internal:3000',
      '*.localhost:3000',
      'daniel.heene.nexus',
      '*.daniel.heene.nexus',
      'daniel.heene.local',
      '*.daniel.heene.local',
    ],

    /**
     *    Environment Variables
     */
    env: {
      SERVER_HOST: process.env.SERVER_HOST,
      SERVER_URL: process.env.SERVER_URL,
      STATUS_PAGE_URL: process.env.STATUS_PAGE_URL,
      STATUS_PAGE_HEARTBEAT_URL: process.env.STATUS_PAGE_HEARTBEAT_URL,
      SENTRY_DSN: process.env.SENTRY_DSN,
    },

    /**
     *    Logging
     */
    logging: {
      fetches: {
        fullUrl: true,
        hmrRefreshes: true,
      },
      serverFunctions: true,
      incomingRequests: true,
      browserToTerminal: 'error',
    },

    serverExternalPackages: [
      // WASM decoder must not be inlined by Turbopack (invalid octal escapes
      // in the generated template string break the server chunk)
      'mediabunny',
      '@mediabunny/server',
      '@react-pdf/renderer',
      'svgo',
      'pdf-parse',
      'node-av',
      '@takumi-rs/core',
      '@napi-rs/canvas',
    ],

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
      root: path.resolve(dirname),
    },

    /**
     * Configuration object for Next.js image optimization settings.
     * Defines supported image formats, responsive breakpoints, and security policies for image handling.
     */
    images: {
      formats: [
        'image/webp',
        'image/avif',
      ],
      deviceSizes: [
        640,
        750,
        828,
        1080,
        1200,
        1920,
        2048,
        3840,
      ],
      imageSizes: [
        16,
        32,
        48,
        64,
        96,
        128,
        256,
        384,
      ],
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
      localPatterns: [
        {
          pathname: '**',
        },
      ],
      contentDispositionType: 'inline',
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      dangerouslyAllowSVG: true,
    },

    // webpack: (config, context) => {
    //   const nextConfig = {
    //     ...config,
    //   }
    //   nextConfig.resolve = {
    //     ...config.resolve,
    //     extensionAlias: {
    //       '.cjs': [
    //         '.cts',
    //         '.cjs',
    //       ],
    //       '.js': [
    //         '.ts',
    //         '.tsx',
    //         '.js',
    //         '.jsx',
    //       ],
    //       '.mjs': [
    //         '.mts',
    //         '.mjs',
    //       ],
    //     },
    //     alias: {
    //       ...config.resolve.alias,
    //       '@': path.resolve(__dirname, 'src'),
    //     },
    //   }
    //
    //   return config
    // },

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

  return withPayload(nextConfig, {
    devBundleServerPackages: false,
  })
}
