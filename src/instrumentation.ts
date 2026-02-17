import { initializeLogsExporter } from '@/lib/otel/log-exporter'
import { OTLPHttpJsonTraceExporter, registerOTel } from '@vercel/otel'

export function register() {
  registerOTel({
    serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME,
    attributes: {
      NODE_ENV: process.env.NODE_ENV,
    },
    traceExporter: new OTLPHttpJsonTraceExporter({ url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT }),
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: [/jsonplaceholder\.typicode\.com/, /httpbin\.org/, /api\.openweathermap\.org/],
        ignoreUrls: [],
        resourceNameTemplate: '{http.method} {http.host}{http.target}',
      },
    },
  })

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    initializeLogsExporter()
  }
}
