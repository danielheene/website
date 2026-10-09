/**
 * Environment-specific values that the browser (and module-scope code)
 * needs. They are deliberately NOT read through static `process.env.X`
 * references or `next.config.ts`'s `env` block: the bundler inlines those at
 * compile time, which would tie one compile to one environment. Instead the
 * server renders them into the page (`RuntimeConfigScript`), and every
 * consumer reads them through `getRuntimeConfig()`.
 */
export type RuntimeConfig = {
  serverUrl?: string
  statusPageUrl?: string
  umamiUrl?: string
  umamiSiteId?: string
  iconifyApi?: string
  sentryDsn?: string
  sentryEnvironment?: string
}

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: RuntimeConfig
  }
}

// Dynamic lookup on purpose: `process.env[name]` is never inlined at build time.
const readEnv = (name: string): string | undefined => process.env[name] || undefined

export const readRuntimeConfigFromEnv = (): RuntimeConfig => ({
  serverUrl: readEnv('SERVER_URL'),
  statusPageUrl: readEnv('STATUS_PAGE_URL'),
  umamiUrl: readEnv('NEXT_PUBLIC_UMAMI_URL'),
  umamiSiteId: readEnv('NEXT_PUBLIC_UMAMI_SITE_ID'),
  iconifyApi: readEnv('NEXT_PUBLIC_ICONIFY_API'),
  sentryDsn: readEnv('SENTRY_DSN'),
  sentryEnvironment: readEnv('SENTRY_ENVIRONMENT'),
})

/** Server: reads the environment. Browser: reads what the server rendered. */
export const getRuntimeConfig = (): RuntimeConfig =>
  typeof window === 'undefined' ? readRuntimeConfigFromEnv() : (window.__RUNTIME_CONFIG__ ?? {})

/** JSON that is safe to embed inside an inline <script>. */
export const serializeRuntimeConfig = (config: RuntimeConfig): string =>
  JSON.stringify(config)
    .replaceAll('<', '\\u003c')
    .replaceAll(' ', '\\u2028')
    .replaceAll(' ', '\\u2029')
