import { OTLPHttpJsonTraceExporter, registerOTel } from '@vercel/otel'

import { initializeLogsExporter } from '@/lib/otel/log-exporter'

export function register() {
  registerOTel({
    serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME,
    attributes: {
      NODE_ENV: process.env.NODE_ENV,
    },
    traceExporter: new OTLPHttpJsonTraceExporter({ url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT }),
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: [
          /heene.review/,
          /heene.dev/,
          /heene.io/,
          /api.anthropic.com/,
          /api.openai.com/,
          /api.mapbox.com/,
          /api.cloudflare.com/,
        ],
        ignoreUrls: [],
        resourceNameTemplate: '{http.method} {http.host}{http.target}',
      },
    },
  })

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    initializeLogsExporter()
  }
}
