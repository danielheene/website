import { EventEmitter } from 'node:events'

import * as Sentry from '@sentry/nextjs'

/**
 * Server and edge runtime initialisation.
 *
 * Next calls this once per runtime before any application code runs, which is
 * what lets Sentry instrument Payload, the jobs queue and route handlers.
 */
export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    EventEmitter.defaultMaxListeners = 20
  }

  const { SENTRY_ENABLED, sharedSentryOptions } = await import('@/lib/sentry/options')

  if (!SENTRY_ENABLED) return

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      ...sharedSentryOptions,
      /**
       * Tracing being enabled (see `tracesSampler` in sentry/options.ts) makes
       * the SDK auto-load its default tracing integrations
       * (dataloaderIntegration, mongooseIntegration, redisIntegration, a pino
       * logger hook, ...), each of which patches `require()` for its target
       * package at runtime. Under Turbopack those patched requires resolve to
       * unresolvable content-hashed module ids (e.g. `dataloader-<hash>`,
       * `pino-<hash>`) baked into `instrumentation.js`, crashing the server on
       * every boot — this is independent of `withSentryConfig`/orchestrion's
       * build-time config; it is the SDK's runtime auto-instrumentation.
       * Disabling it and listing only the integrations below keeps error
       * capture, logs and the integrations we actually want working, without
       * the auto-instrumented packages that break under Turbopack.
       */
      defaultIntegrations: false,
      integrations: [
        Sentry.redisIntegration(),
        Sentry.mongooseIntegration(),
        Sentry.zodErrorsIntegration(),
        Sentry.vercelAIIntegration(),
        // captures console.* as structured logs alongside errors
        Sentry.consoleLoggingIntegration({
          levels: ['warn', 'error'],
        }),
      ],
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init(sharedSentryOptions)
  }
}

/**
 * Reports errors thrown by Server Components, route handlers and middleware.
 * Without this only client-side errors would reach Sentry.
 */
export const onRequestError = Sentry.captureRequestError
