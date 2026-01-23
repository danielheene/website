namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string

    NEXT_PUBLIC_SERVER_HOST: string
    NEXT_PUBLIC_SERVER_URL: string

    PAYLOAD_SECRET: string
    PREVIEW_SECRET: string
    CRON_SECRET: string

    DATABASE_URL: string
    REDIS_URL: string

    S3_BUCKET: string
    S3_ACCESS_KEY: string
    S3_SECRET_KEY: string
    S3_REGION: string
    S3_ENDPOINT: string

    UMAMI_HOST_URL: string
    UMAMI_WEBSITE_ID: string

    USESEND_URL: string
    USESEND_API_KEY: string
    USESEND_DEFAULT_FROM_ADDRESS: string
    USESEND_DEFAULT_FROM_NAME: string

    OPENAI_API_KEY: string
  }
}
