import * as Sentry from '@sentry/nextjs'

/**
 * Server and edge runtime initialisation.
 *
 * Next calls this once per runtime before any application code runs, which is
 * what lets Sentry instrument Payload, the jobs queue and route handlers.
 */
export const register = async () => {
  const { SENTRY_ENABLED, sharedSentryOptions } = await import('@/lib/sentry/options')

  if (!SENTRY_ENABLED) return

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      ...sharedSentryOptions,
      integrations: [
        Sentry.redisIntegration(),
        Sentry.mongooseIntegration(),
        Sentry.zodErrorsIntegration(),
        // captures console.* as structured logs alongside errors
        Sentry.consoleLoggingIntegration({
          levels: [
            'warn',
            'error',
          ],
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
