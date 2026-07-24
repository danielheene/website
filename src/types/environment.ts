import { z } from 'zod'

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
  // SENTRY_DSN: z.string(),
  // SENTRY_AUTH_TOKEN: z.string(),
  // SENTRY_ORG: z.string(),
  // SENTRY_PROJECT: z.string(),

  OPENAI_API_KEY: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  MAPBOX_API_KEY: z.string(),

  CLOUDFLARE_TUNNEL_HOST: z.string().optional(),
  CLOUDFLARE_TUNNEL_URL: z.url().optional(),
  CLOUDFLARE_TUNNEL_TOKEN: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>
