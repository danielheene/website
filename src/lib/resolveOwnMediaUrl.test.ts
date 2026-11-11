import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { resolveOwnMediaUrl } from './resolveOwnMediaUrl'

describe('resolveOwnMediaUrl', () => {
  beforeEach(() => {
    vi.stubEnv('SERVER_URL', 'https://example.com')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('resolves a relative upload path against the site', () => {
    expect(resolveOwnMediaUrl('/api/images/file/photo.jpg').href).toBe(
      'https://example.com/api/images/file/photo.jpg',
    )
  })

  it('accepts an absolute URL on the same origin', () => {
    expect(resolveOwnMediaUrl('https://example.com/api/images/file/photo.jpg').pathname).toBe(
      '/api/images/file/photo.jpg',
    )
  })

  it.each([
    'https://evil.example/photo.jpg',
    'http://example.com/photo.jpg',
    'http://169.254.169.254/latest/meta-data',
    '//evil.example/photo.jpg',
  ])('rejects %s', (url) => {
    expect(() => resolveOwnMediaUrl(url)).toThrow(/another origin/)
  })

  it.each([undefined, null, ''])('rejects a missing URL (%s)', (url) => {
    expect(() => resolveOwnMediaUrl(url)).toThrow(/no URL/)
  })
})
