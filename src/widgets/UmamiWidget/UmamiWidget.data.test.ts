import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/RedisHandler', () => ({
  get: vi.fn(async () => null),
  set: vi.fn(async () => undefined),
}))

const { fetchWebsite, getToken } = await import('./UmamiWidget.data')

describe('UmamiWidget data', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_UMAMI_URL', 'https://umami.example.com')
    vi.stubEnv('NEXT_PUBLIC_UMAMI_SITE_ID', 'site-abc')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns null instead of throwing when Umami is unreachable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))

    await expect(getToken()).resolves.toBeNull()
    await expect(fetchWebsite()).resolves.toBeNull()
  })

  it('returns null when the data request fails after a successful login', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          json: async () => ({
            token: 'token-abc',
          }),
        })
        .mockRejectedValueOnce(new TypeError('fetch failed')),
    )

    await expect(fetchWebsite()).resolves.toBeNull()
  })
})
