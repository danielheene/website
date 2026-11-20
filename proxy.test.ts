import { NextRequest } from 'next/server'

import { afterEach, describe, expect, it, vi } from 'vitest'

import proxy from './proxy'

const KNOWN_PATHS = ['/', '/blog', '/any-path', '/old-path', '/same-path', '/blog/post/hello-world']

const { fetchRedirect, hasRoute } = vi.hoisted(() => ({
  fetchRedirect: vi.fn(async () => null),
  hasRoute: vi.fn(async (_path: string): Promise<boolean> => true),
}))

// oxlint-disable-next-line anti-slop/no-module-mocking -- the proxy is Next's entry point and takes no injected dependencies
vi.mock('@/lib/routeIndex/routeIndexStore', () => ({
  hasRoute,
}))

vi.mock('@/lib/redirects/redirectCache', () => ({
  fetchRedirect,
}))

afterEach(() => {
  fetchRedirect.mockClear()
  fetchRedirect.mockResolvedValue(null)
  hasRoute.mockReset()
  hasRoute.mockImplementation(async (path) => KNOWN_PATHS.includes(path))
})

hasRoute.mockImplementation(async (path) => KNOWN_PATHS.includes(path))

describe('proxy redirects', () => {
  it('redirects to a stored destination', async () => {
    fetchRedirect.mockResolvedValue({
      destination: '/new-path',
      statusCode: 301,
    })

    const response = await proxy(new NextRequest('https://site.test/old-path'))

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('https://site.test/new-path')
  })

  it('preserves the incoming query string unless the destination defines its own', async () => {
    fetchRedirect.mockResolvedValue({
      destination: '/new-path',
      statusCode: 301,
    })

    const response = await proxy(new NextRequest('https://site.test/old-path?x=1'))

    expect(response.headers.get('location')).toBe('https://site.test/new-path?x=1')
  })

  it('does not redirect exempt paths', async () => {
    fetchRedirect.mockResolvedValue({
      destination: '/new-path',
      statusCode: 301,
    })

    const response = await proxy(new NextRequest('https://site.test/admin/anything'))

    expect(response.status).toBe(200)
    expect(fetchRedirect).not.toHaveBeenCalled()
  })

  it('does not redirect when the destination matches the current path', async () => {
    fetchRedirect.mockResolvedValue({
      destination: '/same-path',
      statusCode: 301,
    })

    const response = await proxy(new NextRequest('https://site.test/same-path'))

    expect(response.status).toBe(200)
  })

  it('swallows redirect lookup failures', async () => {
    fetchRedirect.mockRejectedValue(new Error('boom'))

    const response = await proxy(new NextRequest('https://site.test/any-path'))

    expect(response.status).toBe(200)
  })
})

describe('proxy blog listing canonicalisation', () => {
  it('redirects non-canonical listing URLs', async () => {
    const response = await proxy(new NextRequest('https://site.test/blog?page=1'))

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://site.test/blog')
  })

  it('leaves canonical listing URLs alone', async () => {
    const response = await proxy(new NextRequest('https://site.test/blog'))

    expect(response.status).toBe(200)
  })

  it('marks non-default sort orders as noindex', async () => {
    const response = await proxy(new NextRequest('https://site.test/blog?sort=title'))

    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, follow')
  })

  it('does not set X-Robots-Tag for the default listing', async () => {
    const response = await proxy(new NextRequest('https://site.test/blog'))

    expect(response.headers.get('X-Robots-Tag')).toBeNull()
  })
})

describe('proxy unknown paths', () => {
  const rewriteOf = (response: Response) => response.headers.get('x-middleware-rewrite')

  it('rewrites a path missing from the route index to the 404 route', async () => {
    const response = await proxy(new NextRequest('https://site.test/missing'))

    expect(rewriteOf(response)).toBe('https://site.test/404')
  })

  it('checks deeper paths too', async () => {
    const response = await proxy(new NextRequest('https://site.test/a/b/c'))

    expect(rewriteOf(response)).toBe('https://site.test/404')
  })

  it('passes known paths through, ignoring a trailing slash', async () => {
    for (const path of ['/any-path', '/blog/post/hello-world', '/any-path/']) {
      expect(rewriteOf(await proxy(new NextRequest(`https://site.test${path}`)))).toBeNull()
    }
  })

  it('skips the check in draft mode', async () => {
    const request = new NextRequest('https://site.test/missing', {
      headers: { cookie: '__prerender_bypass=token' },
    })

    expect(rewriteOf(await proxy(request))).toBeNull()
    expect(hasRoute).not.toHaveBeenCalled()
  })

  it('lets the request through when the lookup fails', async () => {
    hasRoute.mockRejectedValue(new Error('redis down'))

    expect(rewriteOf(await proxy(new NextRequest('https://site.test/missing')))).toBeNull()
  })

  it('lets files and the framework, admin and API routes through unchecked', async () => {
    for (const path of [
      '/_next/static/a.js',
      '/admin/x',
      '/api/health',
      '/robots.txt',
      '/blog/feed.xml',
    ]) {
      expect(rewriteOf(await proxy(new NextRequest(`https://site.test${path}`)))).toBeNull()
    }

    expect(hasRoute).not.toHaveBeenCalled()
  })
})
