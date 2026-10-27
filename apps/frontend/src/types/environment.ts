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

  NEXT_PUBLIC_UMAMI_URL: z.string(),
  NEXT_PUBLIC_UMAMI_SITE_ID: z.uuid(),

  NEXT_PUBLIC_ICONIFY_API: z.url().default('https://icons.heene.io'),

  NEXT_PUBLIC_SENTRY_DSN: emptyAsUndefined(z.url()),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: emptyAsUndefined(z.string()),
  NEXT_PUBLIC_SENTRY_RELEASE: emptyAsUndefined(z.string()),

  CLOUDFLARE_TUNNEL_HOST: emptyAsUndefined(z.string()),
  CLOUDFLARE_TUNNEL_URL: emptyAsUndefined(z.url()),
  CLOUDFLARE_TUNNEL_TOKEN: emptyAsUndefined(z.string()),

  PAYLOAD_API_URL: z.url(),
  PAYLOAD_API_KEY: z.string(),
  REVALIDATE_SECRET: z.string(),
})

export type Env = z.infer<typeof envSchema>
