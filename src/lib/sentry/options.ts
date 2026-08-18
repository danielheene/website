/**
 * Shared Sentry configuration.
 *
 * Every runtime reads `SENTRY_DSN`; when it is absent `Sentry.init` is skipped
 * entirely, so the SDK stays inert in development and in any deployment that
 * has not been given a project yet.
 */

/** Sampling rates default low in production and full in development. */
const rate = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseFloat(value ?? '')
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback
}

const isProduction = process.env.NODE_ENV === 'production'

export const SENTRY_DSN = process.env.SENTRY_DSN
export const SENTRY_ENABLED = Boolean(SENTRY_DSN)

export const sharedSentryOptions = {
  dsn: SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,

  /**
   * `SENTRY_RELEASE` is set at build time (see next.config.ts's `env` block
   * and `withSentryConfig`'s `release.name`) to `website@<package.json
   * version>` — the same string CI's semantic-release step creates the
   * Sentry release under. Both must derive from that one value: passing a
   * *different* release here (or hardcoding one) would silently tag events
   * under a release with no commits or deploy attached.
   */
  release: process.env.SENTRY_RELEASE,

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

    if (target.includes('/api/sse') || target.includes('/api/heartbeat')) return 0
    return inheritOrSampleWith(rate(process.env.SENTRY_TRACES_SAMPLE_RATE, isProduction ? 0.1 : 1))
  },
} as const
