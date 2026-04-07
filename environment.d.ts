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

    UMAMI_USERNAME: string
    UMAMI_PASSWORD: string
    UMAMI_HOST_URL: string
    NEXT_PUBLIC_UMAMI_SITE_ID: string

    USESEND_URL: string
    USESEND_API_KEY: string
    USESEND_DEFAULT_FROM_ADDRESS: string
    USESEND_DEFAULT_FROM_NAME: string

    OPENAI_API_KEY: string
    ANTHROPIC_API_KEY: string
    MAPBOX_API_KEY: string

    NEXT_PUBLIC_STATUS_PAGE_URL: string
    STATUS_PAGE_HEARTBEAT_API_URL: string

    OTEL_LOG_LEVEL: string
    NEXT_OTEL_VERBOSE: number
    NEXT_PUBLIC_OTEL_SERVICE_NAME: string
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_COMPRESSION: string
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: string
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: string
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: string
  }

  type ReadableStream = import('typescript').ReadableStream
}
