import { z } from 'zod'

/**
 * Treats an empty string as "not set".
 *
 * A secret manager that holds a key with no value (Doppler, and CI systems that
 * expand unset references) hands the process an empty string rather than
 * omitting the variable, which would otherwise fail format checks like `z.url()`
 * instead of falling through to the optional branch.
 */
const emptyAsUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional())

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  SERVER_HOST: z.string().trim().min(1),
  SERVER_URL: z.url(),

  /**
   * Same value as `SERVER_URL`, duplicated under a `NEXT_PUBLIC_` prefix so
   * the one client component that needs it in the browser
   * (`LivePreviewListener`) can read it statically.
   */
  NEXT_PUBLIC_SERVER_URL: z.url(),

  NEXT_PUBLIC_STATUS_PAGE_URL: z.url(),
  STATUS_PAGE_HEARTBEAT_URL: z.url(),

  /**
   * Base URL used by generateResumeDocumentRedirectURL to build the
   * redirect target for /download/resume.pdf and localized resume jobs.
   */
  RESUME_REDIRECT_URL_BASE: z.url(),

  PAYLOAD_SECRET: z.string(),
  PREVIEW_SECRET: z.string(),
  CRON_SECRET: z.string(),

  PAYLOAD_JOBS_ENABLE_APP_WORKERS: z.enum(['true', 'false']).default('false'),

  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),

  S3_BUCKET: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_ENDPOINT: z.string(),

  UMAMI_USERNAME: z.string(),
  UMAMI_PASSWORD: z.string(),
  NEXT_PUBLIC_UMAMI_URL: z.string(),
  NEXT_PUBLIC_UMAMI_SITE_ID: z.uuid(),

  /**
   * Self-hosted Iconify API.
   *
   * Public because the browser resolves icon SVGs and runs picker searches
   * against it directly; the cached `/api/icons/collection` route uses the same
   * origin server-side.
   */
  NEXT_PUBLIC_ICONIFY_API: z.url().default('https://icons.heene.io'),

  USESEND_URL: z.url(),
  USESEND_API_KEY: z.string(),
  USESEND_DEFAULT_FROM_ADDRESS: z.email(),
  USESEND_DEFAULT_FROM_NAME: z.string().trim().min(1),

  OPENAI_API_KEY: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  MAPBOX_API_KEY: z.string(),
  UNSPLASH_ACCESS_KEY: emptyAsUndefined(z.string()),

  /**
   * Sentry is entirely optional: with no DSN the SDK is never initialized.
   * DSN/environment/release are `NEXT_PUBLIC_` because the browser bundle
   * (`instrumentation-client.ts`) reads them directly.
   */
  NEXT_PUBLIC_SENTRY_DSN: emptyAsUndefined(z.url()),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: emptyAsUndefined(z.string()),
  NEXT_PUBLIC_SENTRY_RELEASE: emptyAsUndefined(z.string()),
  SENTRY_TRACES_SAMPLE_RATE: emptyAsUndefined(z.string()),
  SENTRY_URL: emptyAsUndefined(z.url()),
  SENTRY_AUTH_TOKEN: emptyAsUndefined(z.string()),
  SENTRY_ORG: emptyAsUndefined(z.string()),
  SENTRY_PROJECT: emptyAsUndefined(z.string()),

  /**
   * Cloudflare Tunnel is used to expose the app to the internet on local development
   */
  CLOUDFLARE_TUNNEL_HOST: emptyAsUndefined(z.string()),
  CLOUDFLARE_TUNNEL_URL: emptyAsUndefined(z.url()),
  CLOUDFLARE_TUNNEL_TOKEN: emptyAsUndefined(z.string()),
})

export type Env = z.infer<typeof envSchema>
