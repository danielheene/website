import { describe, expect, it, vi } from 'vitest'

import { generateContentURL } from './generateContentURL'

describe('generateContentURL', () => {
  it('builds an absolute URL from collection and slug', () => {
    vi.stubEnv('SERVER_URL', 'https://example.test')
    expect(
      generateContentURL({
        collection: 'posts',
        slug: 'my-post',
      }),
    ).toBe('https://example.test/posts/my-post')
  })

  it('uses an explicit path when given', () => {
    vi.stubEnv('SERVER_URL', 'https://example.test')
    expect(
      generateContentURL({
        path: '/custom/path',
      }),
    ).toBe('https://example.test/custom/path')
  })

  it('appends params from a plain object', () => {
    vi.stubEnv('SERVER_URL', 'https://example.test')
    expect(
      generateContentURL({
        path: '/p',
        params: {
          a: '1',
          b: '2',
        },
      }),
    ).toBe('https://example.test/p?a=1&b=2')
  })

  it('appends params from URLSearchParams', () => {
    vi.stubEnv('SERVER_URL', 'https://example.test')
    const params = new URLSearchParams({
      q: 'x',
    })
    expect(
      generateContentURL({
        path: '/p',
        params,
      }),
    ).toBe('https://example.test/p?q=x')
  })

  it('URI-encodes the path', () => {
    vi.stubEnv('SERVER_URL', 'https://example.test')
    expect(
      generateContentURL({
        path: '/with space',
      }),
    ).toBe('https://example.test/with%20space')
  })
})
