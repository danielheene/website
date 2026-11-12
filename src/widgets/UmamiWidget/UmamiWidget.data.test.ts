import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/RedisHandler', () => ({
  get: vi.fn(async () => null),
  set: vi.fn(async () => undefined),
}))

const requireSessionMock = vi.fn(async () => undefined)

vi.mock('@/lib/actions/requireSession', () => ({
  requireSession: () => requireSessionMock(),
}))

const { getToken } = await import('@/lib/umami/getToken')
const { fetchWebsite } = await import('./UmamiWidget.data')

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

  it('rejects without a session and never calls Umami', async () => {
    const fetchMock = vi.fn()

    vi.stubGlobal('fetch', fetchMock)
    requireSessionMock.mockRejectedValueOnce(new Error('You must be signed in to do this.'))

    await expect(fetchWebsite()).rejects.toThrow('You must be signed in to do this.')
    expect(fetchMock).not.toHaveBeenCalled()
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
