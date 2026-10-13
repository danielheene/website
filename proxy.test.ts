import { NextRequest } from 'next/server'

import { afterEach, describe, expect, it, vi } from 'vitest'

import proxy from './proxy'

vi.mock('@/lib/redirects/redirectCache', () => ({
  fetchRedirect: vi.fn(async () => null),
}))

const { pageSlugExists } = vi.hoisted(() => ({
  pageSlugExists: vi.fn(async () => true),
}))

vi.mock('@/lib/pages/pageSlugCache', () => ({
  pageSlugExists,
}))

afterEach(() => {
  vi.unstubAllEnvs()
  pageSlugExists.mockClear()
  pageSlugExists.mockResolvedValue(true)
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

describe('proxy unknown [slug] 404s', () => {
  it('404s a top-level path with no matching page', async () => {
    pageSlugExists.mockResolvedValue(false)

    const response = await proxy(new NextRequest('https://site.test/this-route-does-not-exist'))

    expect(response.status).toBe(404)
  })

  it('passes through a top-level path that matches a page', async () => {
    pageSlugExists.mockResolvedValue(true)

    const response = await proxy(new NextRequest('https://site.test/about-me'))

    expect(response.status).toBe(200)
    expect(pageSlugExists).toHaveBeenCalledWith('about-me')
  })

  it('does not check reserved top-level segments', async () => {
    const response = await proxy(new NextRequest('https://site.test/blog'))

    expect(response.status).toBe(200)
    expect(pageSlugExists).not.toHaveBeenCalled()
  })

  it('does not check nested paths', async () => {
    const response = await proxy(new NextRequest('https://site.test/foo/bar'))

    expect(response.status).toBe(200)
    expect(pageSlugExists).not.toHaveBeenCalled()
  })

  it('does not check dotted (static file) paths', async () => {
    const response = await proxy(new NextRequest('https://site.test/favicon.ico'))

    expect(response.status).toBe(200)
    expect(pageSlugExists).not.toHaveBeenCalled()
  })

  it('skips the check for draft-mode requests', async () => {
    pageSlugExists.mockResolvedValue(false)

    const response = await proxy(
      new NextRequest('https://site.test/this-route-does-not-exist', {
        headers: {
          cookie: '__prerender_bypass=1',
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(pageSlugExists).not.toHaveBeenCalled()
  })
})
