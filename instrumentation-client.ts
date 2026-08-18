import * as Sentry from '@sentry/nextjs'

import { SENTRY_ENABLED, sharedSentryOptions } from '@/lib/sentry/options'
import { track } from '@/lib/umami/track'

if (SENTRY_ENABLED) {
  Sentry.init({
    ...sharedSentryOptions,

    /**
     * Session replay is opt-in per deployment: it is the most expensive
     * feature by quota and captures user interaction, so it stays off unless
     * SENTRY_REPLAY_SAMPLE_RATE is set.
     */
    replaysSessionSampleRate: Number.parseFloat(process.env.NEXT_PUBLIC_SENTRY_REPLAY_RATE ?? '0'),
    replaysOnErrorSampleRate: Number.parseFloat(
      process.env.NEXT_PUBLIC_SENTRY_REPLAY_ERROR_RATE ?? '0',
    ),

    integrations: [
      // browser tracing records navigation/page-load spans, which is also what
      // carries Web Vitals (LCP, CLS, INP, TTFB) into the performance view
      Sentry.browserTracingIntegration(),
    ],
  })
}

/**
 * Required for Sentry to instrument client-side navigations. Also fires an
 * Umami pageview on each transition, replacing the auto-tracking Umami's
 * vendor script used to do via `data-auto-track`.
 */
export const onRouterTransitionStart = (href: string, navigationType: string): void => {
  Sentry.captureRouterTransitionStart(href, navigationType)
  track()
}
