import { ChildProcess, spawn } from 'node:child_process'

import { NextConfig } from 'next'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'
import { withPayload } from '@payloadcms/next/withPayload'

import z from 'zod'

import { envSchema } from '@/types/environment'

import { name as packageName, version as packageVersion } from './package.json'

const sentryRelease = `${packageName}@${packageVersion}`

let server: ChildProcess | null = null

const createTunnel = (token: string) =>
  new Promise<ChildProcess | null>((resolve) => {
    // No `shell: true`: the token is passed as its own argv entry rather than
    // concatenated into a command string, which also silences DEP0190.
    const childProcess = spawn('npx', ['wrangler', 'tunnel', 'run', '--token', token], {
      stdio: 'ignore',
    })

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

export default async (phase, { defaultConfig: _defaultConfig }) => {
  /**
   *    The tunnel is opt-in via `bun run dev --tunnel`, which scripts/dev.mjs
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

  const serverExternalPackages = [
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
  ]

  const nextConfig: NextConfig = {
    poweredByHeader: false,
    /**
     * Enabled so sourcemaps can be uploaded to Rustrak (see the build step
     * that runs `sentry-cli sourcemaps upload`). The uploaded `.map` files are
     * then stripped from the deployed output before it ships — see
     * scripts/assemble-images.mjs — so they never reach the browser.
     */
    productionBrowserSourceMaps: true,
    reactStrictMode: true,
    cacheComponents: true,

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
        // 'payload',
        '@payloadcms/next',
        '@payloadcms/translations',
        '@payloadcms/ui',
        'shiki',
        // 'svgo',
        'usehooks-ts',
      ],
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
     *    `NEXT_PUBLIC_SENTRY_RELEASE` is the one build-time-computed value
     *    with no corresponding entry in Doppler/`.env.*` — it's derived from
     *    `package.json`, not set per-environment — so it's injected here
     *    rather than expected to already be in `process.env`.
     */
    env: {
      NEXT_PUBLIC_SENTRY_RELEASE: sentryRelease,
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

    serverExternalPackages,

    turbopack: {
      // Pins workspace-root inference to this file's own directory. Without
      // it, Turbopack can infer a different root at build time than at
      // runtime inside the container (both just `next start` from `/app`,
      // but detection otherwise walks up for a lockfile/workspace marker),
      // producing content-hashed external module ids (e.g. `pino-<hash>`)
      // that resolve during build but 404 as `Cannot find module` at boot.
      root: import.meta.dirname,
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
  }

  const configWithPayload = withPayload(nextConfig, {
    devBundleServerPackages: false,
  })

  /**
   * `withSentryConfig`'s Turbopack build-time support is what's unusable
   * here: even with `buildTimeInstrumentation: false`, it unconditionally
   * appends packages to `serverExternalPackages` for its auto-instrumentation
   * (a hardcoded, non-exhaustive list — `@sentry/server-runtime-injection`,
   * `dataloader`, `pino`, ... have each in turn come back as unresolvable
   * content-hashed `require()` calls baked into `instrumentation.js`,
   * crashing the server on every boot), and there is no option that
   * disables this on Turbopack (`webpack.disableSentryConfig` only applies
   * to webpack builds). Error capture doesn't need any of this — it comes
   * from the manual `Sentry.init(...)` in `instrumentation.ts`
   * (zodErrorsIntegration, vercelAIIntegration), which runs independently at
   * request time. Source maps are restored via a standalone `sentry-cli`
   * step in `.github/workflows/ci.yml`'s `compile` job (not a bundler
   * plugin), uploaded to the self-hosted Rustrak instance set as `SENTRY_URL`
   * — see that workflow for the exact scope and why it's not the full
   * `.next` tree.
   */
  return configWithPayload
}
