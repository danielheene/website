import { afterEach, describe, expect, it, vi } from 'vitest'

import { isProductionHost } from './isProductionHost'

describe('isProductionHost', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is true when SERVER_HOST equals PRODUCTION_HOST', () => {
    vi.stubEnv('PRODUCTION_HOST', 'example.com')
    vi.stubEnv('SERVER_HOST', 'example.com')

    expect(isProductionHost()).toBe(true)
  })

  it('is false on any other host', () => {
    vi.stubEnv('PRODUCTION_HOST', 'example.com')
    vi.stubEnv('SERVER_HOST', 'dev.example.com')

    expect(isProductionHost()).toBe(false)
  })

  it('is false when PRODUCTION_HOST is unset or empty, even if SERVER_HOST is too', () => {
    vi.stubEnv('PRODUCTION_HOST', '')
    vi.stubEnv('SERVER_HOST', '')

    expect(isProductionHost()).toBe(false)

    vi.stubEnv('PRODUCTION_HOST', undefined)
    vi.stubEnv('SERVER_HOST', undefined)

    expect(isProductionHost()).toBe(false)
  })
})
