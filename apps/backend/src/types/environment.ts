import { z } from 'zod'

const emptyAsUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional())

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  SERVER_HOST: z.string().trim().min(1),
  SERVER_URL: z.url(),
  NEXT_PUBLIC_SERVER_URL: z.url(),

  NEXT_PUBLIC_STATUS_PAGE_URL: z.url(),
  STATUS_PAGE_HEARTBEAT_URL: z.url(),

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

  NEXT_PUBLIC_ICONIFY_API: z.url().default('https://icons.heene.io'),

  USESEND_URL: z.url(),
  USESEND_API_KEY: z.string(),
  USESEND_DEFAULT_FROM_ADDRESS: z.email(),
  USESEND_DEFAULT_FROM_NAME: z.string().trim().min(1),

  OPENAI_API_KEY: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  MAPBOX_API_KEY: z.string(),
  UNSPLASH_ACCESS_KEY: emptyAsUndefined(z.string()),

  NEXT_PUBLIC_SENTRY_DSN: emptyAsUndefined(z.url()),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: emptyAsUndefined(z.string()),
  NEXT_PUBLIC_SENTRY_RELEASE: emptyAsUndefined(z.string()),
  SENTRY_TRACES_SAMPLE_RATE: emptyAsUndefined(z.string()),
  SENTRY_URL: emptyAsUndefined(z.url()),
  SENTRY_AUTH_TOKEN: emptyAsUndefined(z.string()),
  SENTRY_ORG: emptyAsUndefined(z.string()),
  SENTRY_PROJECT: emptyAsUndefined(z.string()),

  CLOUDFLARE_TUNNEL_HOST: emptyAsUndefined(z.string()),
  CLOUDFLARE_TUNNEL_URL: emptyAsUndefined(z.url()),
  CLOUDFLARE_TUNNEL_TOKEN: emptyAsUndefined(z.string()),

  PAYLOAD_API_URL: z.url(),
  PAYLOAD_API_KEY: z.string(),
  PAYLOAD_FRONTEND_URL: z.url(),
  REVALIDATE_SECRET: z.string(),
})

export type Env = z.infer<typeof envSchema>
