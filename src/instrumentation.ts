import { OTLPHttpJsonTraceExporter, registerOTel } from '@vercel/otel'

export function register() {
  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME,
    traceExporter: new OTLPHttpJsonTraceExporter({ url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT }),
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: [/jsonplaceholder\.typicode\.com/, /httpbin\.org/, /api\.openweathermap\.org/],
        ignoreUrls: [],
        resourceNameTemplate: '{http.method} {http.host}{http.target}',
      },
    },
  })
}
