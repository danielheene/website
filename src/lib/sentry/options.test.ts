import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The module reads env at import time, so each case re-imports it with
 * `vi.resetModules()` after stubbing.
 */
const loadOptions = async () => {
  vi.resetModules()
  return import('./options')
}

beforeEach(() => {
  vi.stubEnv('SENTRY_DSN', '')
  vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', '')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('SENTRY_ENABLED', () => {
  it('is false without a DSN, so the SDK stays inert', async () => {
    vi.stubEnv('SENTRY_DSN', '')
    const { SENTRY_ENABLED } = await loadOptions()
    expect(SENTRY_ENABLED).toBe(false)
  })

  it('is true once a DSN is provided', async () => {
    vi.stubEnv('SENTRY_DSN', 'https://key@example.test/1')
    const { SENTRY_ENABLED } = await loadOptions()
    expect(SENTRY_ENABLED).toBe(true)
  })
})

describe('tracesSampler', () => {
  const inherit = (fallback: number) => fallback

  it('samples everything outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const { sharedSentryOptions } = await loadOptions()
    expect(
      sharedSentryOptions.tracesSampler({
        name: 'GET /blog',
        inheritOrSampleWith: inherit,
      }),
    ).toBe(1)
  })

  it('samples a fraction in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { sharedSentryOptions } = await loadOptions()
    expect(
      sharedSentryOptions.tracesSampler({
        name: 'GET /blog',
        inheritOrSampleWith: inherit,
      }),
    ).toBe(0.1)
  })

  it('honours an explicit rate', async () => {
    vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', '0.5')
    const { sharedSentryOptions } = await loadOptions()
    expect(
      sharedSentryOptions.tracesSampler({
        name: 'GET /blog',
        inheritOrSampleWith: inherit,
      }),
    ).toBe(0.5)
  })

  it('ignores out-of-range and non-numeric values', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    for (const value of [
      '2',
      '-1',
      'abc',
    ]) {
      vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', value)
      const { sharedSentryOptions } = await loadOptions()
      expect(
        sharedSentryOptions.tracesSampler({
          name: 'GET /blog',
          inheritOrSampleWith: inherit,
        }),
      ).toBe(0.1)
    }
  })

  it('does not set a flat tracesSampleRate, which would shadow the sampler', async () => {
    const { sharedSentryOptions } = await loadOptions()
    expect('tracesSampleRate' in sharedSentryOptions).toBe(false)
  })
})

describe('tracesSampler', () => {
  const inherit = (fallback: number) => fallback

  it('drops traces for the polled and long-lived endpoints', async () => {
    const { sharedSentryOptions } = await loadOptions()

    expect(
      sharedSentryOptions.tracesSampler({
        name: 'GET /api/sse',
        inheritOrSampleWith: inherit,
      }),
    ).toBe(0)
    expect(
      sharedSentryOptions.tracesSampler({
        name: 'GET /api/heartbeat',
        inheritOrSampleWith: inherit,
      }),
    ).toBe(0)
  })

  it('samples normal routes at the configured rate', async () => {
    vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', '0.25')
    const { sharedSentryOptions } = await loadOptions()

    expect(
      sharedSentryOptions.tracesSampler({
        name: 'GET /blog',
        inheritOrSampleWith: inherit,
      }),
    ).toBe(0.25)
  })
})

describe('enableLogs', () => {
  it('is on so console output and structured logs reach Sentry', async () => {
    const { sharedSentryOptions } = await loadOptions()
    expect(sharedSentryOptions.enableLogs).toBe(true)
  })
})
