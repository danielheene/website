import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
})

const { isUnsplashConfigured } = await import('./isConfigured')

describe('isUnsplashConfigured', () => {
  it('returns false when UNSPLASH_ACCESS_KEY is unset', async () => {
    vi.stubEnv('UNSPLASH_ACCESS_KEY', '')
    expect(await isUnsplashConfigured()).toBe(false)
  })

  it('returns true when UNSPLASH_ACCESS_KEY is set', async () => {
    vi.stubEnv('UNSPLASH_ACCESS_KEY', 'key-value')
    expect(await isUnsplashConfigured()).toBe(true)
  })
})
