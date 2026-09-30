import * as Sentry from '@sentry/nextjs'

import { getRuntimeConfig, type RuntimeConfig } from '@/lib/runtimeConfig'
import { createSentryOptions } from '@/lib/sentry/options'
import { trackPageview } from '@/lib/umami/track'

const initSentry = (config: RuntimeConfig): void => {
  if (!config.sentryDsn) return

  Sentry.init({
    ...createSentryOptions(config),

    integrations: [Sentry.browserTracingIntegration()],
  })
}

/**
 * DSN and environment are not inlined at compile time. Pages rendered by the
 * frontend layout carry them in `window.__RUNTIME_CONFIG__` (already present
 * here, since the script sits in <head>); other pages, such as the Payload
 * admin whose layout is generated and cannot host the script, fetch them.
 */
if (typeof window !== 'undefined') {
  if (window.__RUNTIME_CONFIG__) {
    initSentry(getRuntimeConfig())
  } else {
    fetch('/api/runtime-config')
      .then((response) => (response.ok ? (response.json() as Promise<RuntimeConfig>) : undefined))
      .then((config) => {
        if (config) {
          window.__RUNTIME_CONFIG__ = config
          initSentry(config)
        }
      })
      .catch(() => {
        // Error reporting is best-effort; never break the page over it.
      })
  }
}

/**
 * Fires an Umami pageview for the very first page load, before any
 * client-side navigation has happened. This is a genuine module-level side
 * effect that runs once per page load in the browser (and no-ops during
 * SSR/build, where `window` is undefined). Replaces the auto-tracking
 * Umami's vendor script used to do via `data-auto-track`, which tracked
 * every page view including the first.
 *
 * Note: `window.__UMAMI_SUPPRESSED__` is set by a Suspense-streamed script
 * rendered later in `<body>` (see `src/components/UmamiSuppressionFlag/`),
 * so at the moment this module first evaluates, that flag may not be set yet
 * even for a session that should be suppressed. This is the same accepted,
 * bounded race documented in `UmamiSuppressionFlag.tsx` — not something this
 * call needs to work around.
 */
if (typeof window !== 'undefined') {
  trackPageview()
}

/**
 * Required for Sentry to instrument client-side navigations. Also fires an
 * Umami pageview on each transition, replacing the auto-tracking Umami's
 * vendor script used to do via `data-auto-track`. `onRouterTransitionStart`
 * fires BEFORE `location` updates to the destination, so `href` is passed
 * explicitly rather than letting `trackPageview` derive the URL from
 * `location` (which would still point at the page being left).
 */
export const onRouterTransitionStart = (href: string, navigationType: string): void => {
  Sentry.captureRouterTransitionStart(href, navigationType)
  trackPageview(href)
}
