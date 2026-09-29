import { NextRequest } from 'next/server'

import { afterEach, describe, expect, it, vi } from 'vitest'

import proxy from './proxy'

vi.mock('@/lib/redirects/redirectCache', () => ({
  fetchRedirect: vi.fn(async () => null),
}))

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('proxy /stats forwarding', () => {
  it('rewrites /stats/* to the Umami URL read at runtime', async () => {
    vi.stubEnv('NEXT_PUBLIC_UMAMI_URL', 'https://umami.example.test')

    const response = await proxy(
      new NextRequest('https://site.test/stats/api/send?x=1', {
        method: 'POST',
      }),
    )

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://umami.example.test/api/send?x=1',
    )
  })

  it('does not rewrite when no Umami URL is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_UMAMI_URL', '')

    const response = await proxy(new NextRequest('https://site.test/stats/api/send'))

    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('leaves other paths alone', async () => {
    vi.stubEnv('NEXT_PUBLIC_UMAMI_URL', 'https://umami.example.test')

    const response = await proxy(new NextRequest('https://site.test/about-me'))

    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
  })
})
