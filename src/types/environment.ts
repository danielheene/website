import { z } from 'zod'

const env = z.object({
  NODE_ENV: z
    .enum([
      'development',
      'production',
      'test',
    ])
    .default('development'),

  NEXT_PUBLIC_SERVER_HOST: z.string(),
  NEXT_PUBLIC_SERVER_URL: z.string(),

  PAYLOAD_SECRET: z.string(),
  PREVIEWS_SECRET: z.string(),
  CRON_SECRET: z.string(),

  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),

  S3_BUCKET: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_REGION: z.string(),
  S3_ENDPOINT: z.string(),

  UMAMI_USERNAME: z.string(),
  UMAMI_PASSWORD: z.string(),
  UMAMI_HOST_URL: z.string(),
  NEXT_PUBLIC_UMAMI_SITE_ID: z.uuid(),

  USESEND_URL: z.string(),
  USESEND_API_KEY: z.string(),
  USESEND_DEFAULT_FROM_ADDRESS: z.string(),
  USESEND_DEFAULT_FROM_NAME: z.string(),

  OPENAI_API_KEY: z.string(),
  ANTRHROPIC_API_KEY: z.string(),
  MAPBOX_API_KEY: z.string(),

  NEXT_PUBLIC_STATUS_PAGE_URL: z.url(),
  STATUS_PAGE_HEARTBEAT_API_URL: z.url(),
})
