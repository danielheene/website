import { ChildProcess, spawn } from 'node:child_process'

import { NextConfig } from 'next'
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants'
import { withPayload } from '@payloadcms/next/withPayload'

import { withSentryConfig } from '@sentry/nextjs'
import z from 'zod'

import { envSchema } from '@/types/environment'

let server: ChildProcess | null = null
const createTunnel = (token: string) =>
  new Promise<ChildProcess | null>((resolve) => {
    // No `shell: true`: the token is passed as its own argv entry rather than
    // concatenated into a command string, which also silences DEP0190.
    const childProcess = spawn(
      'npx',
      [
        'wrangler',
        'tunnel',
        'run',
        '--token',
        token,
      ],
      {
        stdio: 'ignore',
      },
    )

    /**
     *    Reap the tunnel with the dev server. Without this every `next dev`
     *    leaves a live `wrangler tunnel run` behind, and they accumulate
     *    silently across restarts.
     *
     *    Only `exit` is hooked: scripts/dev.mjs already forwards SIGINT/SIGTERM
     *    to this process and re-raises them, so adding handlers here would
     *    replace Node's default signal behaviour and let the wrapper's own
     *    exit-code handling be pre-empted by a hardcoded `process.exit(0)`.
     */
    process.once('exit', () => {
      if (!childProcess.killed) {
        childProcess.kill('SIGTERM')
      }
    })

    /**
     *    `spawn` fires for npx itself, so it only proves the launcher started —
     *    wrangler may still fail afterwards (missing binary, rejected token).
     *    An early exit is therefore treated as a failed tunnel, and whichever
     *    of the two settles first wins.
     */
    childProcess.once('spawn', () => {
      resolve(childProcess)
    })
    childProcess.once('error', () => {
      resolve(null)
    })
    childProcess.once('exit', (code) => {
      if (code !== 0) resolve(null)
    })
  })

export default async (phase, { defaultConfig }) => {
  /**
   *    The tunnel is opt-in via `pnpm dev --tunnel`, which scripts/dev.mjs
   *    translates into DEV_TUNNEL=1. Having the credentials in .env.local is
   *    no longer enough to start it — otherwise every `next dev` opens a
   *    public tunnel as a side effect of the file being present.
   *
   *    This runs before validation so the addresses it swaps in are the ones
   *    the schema checks.
   */
  const tunnelRequested = phase === PHASE_DEVELOPMENT_SERVER && process.env.DEV_TUNNEL === '1'

  if (tunnelRequested) {
    const { CLOUDFLARE_TUNNEL_URL, CLOUDFLARE_TUNNEL_HOST, CLOUDFLARE_TUNNEL_TOKEN } = process.env

    if (!CLOUDFLARE_TUNNEL_URL || !CLOUDFLARE_TUNNEL_HOST || !CLOUDFLARE_TUNNEL_TOKEN) {
      console.error(
        '\n[tunnel] --tunnel needs CLOUDFLARE_TUNNEL_URL, CLOUDFLARE_TUNNEL_HOST and CLOUDFLARE_TUNNEL_TOKEN\n',
      )
      process.exit(1)
    }

    process.env.SERVER_HOST = CLOUDFLARE_TUNNEL_HOST
    process.env.SERVER_URL = CLOUDFLARE_TUNNEL_URL
    process.env.HOST = CLOUDFLARE_TUNNEL_HOST
    process.env.PORT = String(443)
  }

  /* Environment validation */
  const parsedEnv = envSchema.safeParse(process.env)
  if (!parsedEnv.success) {
    console.error(`\n${z.prettifyError(parsedEnv.error)}\n`)
    process.exit(1)
  }

  if (tunnelRequested) {
    // Next reloads this config on edit; the tunnel outlives those reloads.
    if (!server) {
      server = await createTunnel(process.env.CLOUDFLARE_TUNNEL_TOKEN)

      if (!server) {
        console.error('\n[tunnel] failed to start `wrangler tunnel run` — is wrangler installed?\n')
        process.exit(1)
      }
    }

    /**
     *    Only this process has the tunnel URL — .env.local is loaded by Next,
     *    not by scripts/dev.mjs. Hand it to the wrapper, which splices it into
     *    Next's address block and swallows this marker.
     *
     *    stderr, not stdout: Next captures stdout while the config loads, so a
     *    marker written there never reaches the parent.
     */
    process.stderr.write(`__DEV_TUNNEL_URL__${process.env.SERVER_URL}\n`)
  }

  const nextConfig: NextConfig = {
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    reactStrictMode: true,
    cacheComponents: true,
    // cacheHandler: require.resolve('./next.cache-handler.ts'),

    experimental: {
      appNewScrollHandler: true,
      turbopackServerFastRefresh: true,
      serverActions: {
        bodySizeLimit: '10mb',
      },
    },

    /**
     *    Allowed Dev Origins
     */
    allowedDevOrigins: [
      'localhost:3000',
      '*.localhost:3000',
      'daniel.heene.nexus',
      '*.daniel.heene.nexus',
      'daniel.heene.local',
      '*.daniel.heene.local',
    ],

    /**
     *    Environment Variables
     *
     *    Anything listed here is INLINED into the compiled bundle by Next and
     *    can no longer be changed by the runtime environment.
     *
     *    These three are structurally build-time and cannot be made runtime,
     *    which is worth stating plainly because it is not obvious:
     *
     *      - SENTRY_DSN      → instrumentation-client.ts calls Sentry.init at
     *                          module scope, before any component renders.
     *      - SERVER_URL      → read by robots.ts and the root layout's
     *                          metadataBase, both of which are prerendered.
     *      - STATUS_PAGE_URL → reaches ServiceStatus through the Footer, which
     *                          renders inside the prerendered shell.
     *
     *    With `cacheComponents: true` nearly every route has a shell rendered
     *    at build time, so a process.env read on the server is captured into
     *    that shell and served from cache — moving the read up the tree does
     *    not change this. All three are public values (a DSN ships to the
     *    browser SDK; the other two are this site's own addresses), so the
     *    cost is that images are environment-specific, not that anything
     *    secret is baked in.
     *
     *    Everything else — every secret and all server-only config — is read
     *    from the container environment at boot and is genuinely runtime.
     */
    env: {
      SERVER_URL: process.env.SERVER_URL,
      STATUS_PAGE_URL: process.env.STATUS_PAGE_URL,
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
        new URL('http://localhost:3000/**'),
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

  const configWithPayload = withPayload(nextConfig, {
    devBundleServerPackages: false,
  })

  /**
   * Source maps are only uploaded when an auth token is present, so local and
   * CI builds without Sentry credentials behave exactly as before. Without the
   * upload, production stack traces stay minified but error capture still works.
   */
  const uploadSourceMaps = Boolean(
    process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
  )

  return withSentryConfig(configWithPayload, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,

    silent: !process.env.CI,
    sourcemaps: {
      disable: !uploadSourceMaps,
      // uploaded maps are deleted afterwards so they are never served publicly
      deleteSourcemapsAfterUpload: true,
    },

    // proxies Sentry requests through the app so ad blockers cannot drop them
    tunnelRoute: '/monitoring',

    // `disableLogger` and `automaticVercelMonitors` are deliberately omitted:
    // both are deprecated and webpack-only, and this project builds with
    // Turbopack, so setting them only emits warnings.
  })
}
