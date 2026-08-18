import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(),
  captureRouterTransitionStart: vi.fn(),
}))

vi.mock('@/lib/umami/track', () => ({
  track: vi.fn(),
}))

/**
 * The module reads `SENTRY_ENABLED` (derived from `SENTRY_DSN`) at import
 * time and calls `Sentry.init` as a side effect, so the DSN is stubbed empty
 * here to keep `Sentry.init` from running during the test.
 */
const loadInstrumentationClient = async () => {
  vi.resetModules()
  vi.stubEnv('SENTRY_DSN', '')
  return import('./instrumentation-client')
}

beforeEach(() => {
  vi.unstubAllEnvs()
})

describe('onRouterTransitionStart', () => {
  it('captures the router transition start and fires a bare Umami pageview', async () => {
    const Sentry = await import('@sentry/nextjs')
    const { track } = await import('@/lib/umami/track')
    const { onRouterTransitionStart } = await loadInstrumentationClient()

    onRouterTransitionStart('/some/path', 'push')

    expect(Sentry.captureRouterTransitionStart).toHaveBeenCalledWith('/some/path', 'push')
    expect(track).toHaveBeenCalledWith()
  })
})
