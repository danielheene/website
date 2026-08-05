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
  NODE_ENV: z
    .enum([
      'development',
      'production',
      'test',
    ])
    .default('development'),

  SERVER_HOST: z.string().trim().min(1),
  SERVER_URL: z.url(),

  STATUS_PAGE_URL: z.url(),
  STATUS_PAGE_HEARTBEAT_URL: z.url(),

  PAYLOAD_SECRET: z.string(),
  PREVIEW_SECRET: z.string(),
  CRON_SECRET: z.string(),

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

  USESEND_URL: z.url(),
  USESEND_API_KEY: z.string(),
  USESEND_DEFAULT_FROM_ADDRESS: z.email(),
  USESEND_DEFAULT_FROM_NAME: z.string().trim().min(1),
  //
  /**
   * Sentry is entirely optional: with no DSN the SDK is never initialised, so
   * the app runs unchanged. The auth token trio is only needed to upload
   * source maps during a build.
   */
  SENTRY_DSN: emptyAsUndefined(z.url()),
  SENTRY_ENVIRONMENT: emptyAsUndefined(z.string()),
  SENTRY_RELEASE: emptyAsUndefined(z.string()),
  SENTRY_TRACES_SAMPLE_RATE: emptyAsUndefined(z.string()),
  SENTRY_AUTH_TOKEN: emptyAsUndefined(z.string()),
  SENTRY_ORG: emptyAsUndefined(z.string()),
  SENTRY_PROJECT: emptyAsUndefined(z.string()),
  NEXT_PUBLIC_SENTRY_REPLAY_RATE: emptyAsUndefined(z.string()),
  NEXT_PUBLIC_SENTRY_REPLAY_ERROR_RATE: emptyAsUndefined(z.string()),

  OPENAI_API_KEY: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  MAPBOX_API_KEY: z.string(),

  CLOUDFLARE_TUNNEL_HOST: emptyAsUndefined(z.string()),
  CLOUDFLARE_TUNNEL_URL: emptyAsUndefined(z.url()),
  CLOUDFLARE_TUNNEL_TOKEN: emptyAsUndefined(z.string()),
})

export type Env = z.infer<typeof envSchema>
