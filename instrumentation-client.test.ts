// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(),
  captureRouterTransitionStart: vi.fn(),
}))

vi.mock('@/lib/umami/track', () => ({
  trackPageview: vi.fn(),
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

describe('module evaluation (initial page load)', () => {
  it('fires an initial bare Umami pageview when window is defined', async () => {
    const { trackPageview } = await import('@/lib/umami/track')

    await loadInstrumentationClient()

    expect(trackPageview).toHaveBeenCalledWith()
  })
})

describe('onRouterTransitionStart', () => {
  it('captures the router transition start and fires an Umami pageview for the destination href', async () => {
    const Sentry = await import('@sentry/nextjs')
    const { trackPageview } = await import('@/lib/umami/track')
    const { onRouterTransitionStart } = await loadInstrumentationClient()
    vi.mocked(trackPageview).mockClear()

    onRouterTransitionStart('/new/path', 'push')

    expect(Sentry.captureRouterTransitionStart).toHaveBeenCalledWith('/new/path', 'push')
    expect(trackPageview).toHaveBeenCalledWith('/new/path')
    expect(trackPageview).not.toHaveBeenCalledWith()
  })
})
