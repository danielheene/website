/**
 * Shared Sentry configuration.
 *
 * Every runtime reads `NEXT_PUBLIC_SENTRY_DSN`; when it is absent `Sentry.init`
 * is skipped entirely, so the SDK stays inert in development and in any
 * deployment that has not been given a project yet. DSN/environment/release
 * are `NEXT_PUBLIC_` because `instrumentation-client.ts` reads the same values
 * directly in the browser bundle — no runtime-config indirection needed since
 * each environment now builds its own artifact.
 */

/** Sampling rates default low in production and full in development. */
const rate = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseFloat(value ?? '')

  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback
}

export const createSentryOptions = () =>
  ({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,

    /**
     * Set to `<name>@<package.json version>` at build time (see
     * next.config.ts). The same for every environment's build of that
     * version, so safe to inline (the environment tag distinguishes
     * deployments).
     */
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

    /** Forwards console calls and structured logs to Sentry. */
    enableLogs: true,

    debug: false,

    /**
     * Traces power the span/transaction view. `tracesSampler` is used instead of
     * `tracesSampleRate` because Sentry ignores the sampler when a flat rate is
     * also set — and the sampler is what drops the noisy endpoints.
     *
     * The heartbeat and SSE routes are polled constantly or long-lived; their
     * traces carry no signal and would dominate the quota. Everything else
     * samples fully in development and at 10% in production, overridable with
     * SENTRY_TRACES_SAMPLE_RATE.
     */
    tracesSampler: ({
      name,
      attributes,
      inheritOrSampleWith,
    }: {
      name: string
      attributes?: Record<string, unknown>
      inheritOrSampleWith: (fallback: number) => number
    }) => {
      // `name` is only the method (e.g. "GET") for server transactions; the path
      // arrives via attributes, so both are checked
      const target = [
        name,
        String(attributes?.['http.target'] ?? ''),
        String(attributes?.['url.path'] ?? ''),
        String(attributes?.['http.route'] ?? ''),
      ].join(' ')

      if (target.includes('/api/sse') || target.includes('/api/health')) return 0

      return inheritOrSampleWith(
        rate(
          process.env.SENTRY_TRACES_SAMPLE_RATE,
          process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1,
        ),
      )
    },
  }) as const

export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
export const SENTRY_ENABLED = Boolean(SENTRY_DSN)
export const sharedSentryOptions = createSentryOptions()
