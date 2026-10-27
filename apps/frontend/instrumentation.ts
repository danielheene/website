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

  const { SENTRY_ENABLED, sharedSentryOptions } = await import('@website/lib/sentry/options')

  if (!SENTRY_ENABLED) return

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      ...sharedSentryOptions,
      /**
       * `redisIntegration`, `mongooseIntegration` and the pino hook behind
       * `consoleLoggingIntegration`/`enableLogs` all patch `require()` for
       * their target package via `require-in-the-middle`. Under Turbopack
       * those patched requires resolve to unresolvable content-hashed module
       * ids (`mongoose-<hash>`, `pino-<hash>`, ...) baked into
       * `instrumentation.js`, crashing the server on every boot — confirmed
       * from the deployed container's actual logs, not just a local repro.
       * `zodErrorsIntegration`/`vercelAIIntegration` don't patch `require()`
       * and stay safe to keep. Error capture still works via the manual
       * `captureRequestError` below, independent of all of this.
       */
      defaultIntegrations: false,
      integrations: [Sentry.zodErrorsIntegration(), Sentry.vercelAIIntegration()],
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
