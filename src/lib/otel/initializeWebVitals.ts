'use client'

import { metrics } from '@opentelemetry/api'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { Metric, onCLS, onINP, onLCP } from 'web-vitals'

let isInitialized = false

export function initializeWebVitals() {
  if (typeof window === 'undefined' || isInitialized) return

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME,
  })

  const reader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_METRICS_ENDPOINT }),
    exportIntervalMillis: 10000,
  })

  const meterProvider = new MeterProvider({ resource, readers: [reader] })
  metrics.setGlobalMeterProvider(meterProvider)
  const meter = metrics.getMeter('web-vitals')

  const lcp = meter.createHistogram('web_vitals_lcp', { unit: 'ms' })
  const inp = meter.createHistogram('web_vitals_inp', { unit: 'ms' })
  const cls = meter.createUpDownCounter('web_vitals_cls', { unit: '1' })

  const record = (metric: Metric) => {
    const attrs = {
      page: window.location.pathname,
      rating: metric.rating,
    }
    if (metric.name === 'LCP') lcp.record(metric.value, attrs)
    else if (metric.name === 'INP') inp.record(metric.value, attrs)
    else if (metric.name === 'CLS') cls.add(metric.value, attrs)
  }

  onLCP(record)
  onINP(record)
  onCLS(record)
  isInitialized = true
}
