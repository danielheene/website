import { NextRequest } from 'next/server'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { CollectionSlug } from '@/types/collections'

import proxy from './proxy'

const KNOWN_PAGE_SLUGS = ['any-path', 'old-path', 'same-path']

const { fetchRedirect, fetchPublishedSlugs } = vi.hoisted(() => ({
  fetchRedirect: vi.fn(async () => null),
  fetchPublishedSlugs: vi.fn(async (): Promise<string[]> => []),
}))

// oxlint-disable-next-line anti-slop/no-module-mocking -- the proxy is Next's entry point and takes no injected dependencies
vi.mock('@/lib/routeSlugs/publishedSlugs', () => ({
  fetchPublishedSlugs,
}))

vi.mock('@/lib/redirects/redirectCache', () => ({
  fetchRedirect,
}))

afterEach(() => {
  fetchRedirect.mockClear()
  fetchRedirect.mockResolvedValue(null)
  fetchPublishedSlugs.mockReset()
  fetchPublishedSlugs.mockResolvedValue(KNOWN_PAGE_SLUGS)
})

fetchPublishedSlugs.mockResolvedValue(KNOWN_PAGE_SLUGS)

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

describe('proxy unknown slugs', () => {
  const rewriteOf = (response: Response) => response.headers.get('x-middleware-rewrite')

  it('rewrites an unknown page slug to the 404 route', async () => {
    const response = await proxy(new NextRequest('https://site.test/missing'))

    expect(rewriteOf(response)).toBe('https://site.test/404')
  })

  it('passes known slugs through', async () => {
    const response = await proxy(new NextRequest('https://site.test/any-path'))

    expect(rewriteOf(response)).toBeNull()
  })

  it('looks up the collection of the matched route', async () => {
    fetchPublishedSlugs.mockResolvedValue(['hello-world'])

    const known = await proxy(new NextRequest('https://site.test/blog/post/hello-world'))
    const unknown = await proxy(new NextRequest('https://site.test/blog/post/missing'))

    expect(fetchPublishedSlugs).toHaveBeenCalledWith(CollectionSlug.BlogPosts)
    expect(rewriteOf(known)).toBeNull()
    expect(rewriteOf(unknown)).toBe('https://site.test/404')
  })

  it('rejects reserved topic slugs without a lookup', async () => {
    const response = await proxy(new NextRequest('https://site.test/blog/post'))

    expect(rewriteOf(response)).toBe('https://site.test/404')
    expect(fetchPublishedSlugs).not.toHaveBeenCalled()
  })

  it('serves the latest résumé without a lookup', async () => {
    const response = await proxy(new NextRequest('https://site.test/resume/latest'))

    expect(rewriteOf(response)).toBeNull()
    expect(fetchPublishedSlugs).not.toHaveBeenCalled()
  })

  it('skips the check in draft mode', async () => {
    const request = new NextRequest('https://site.test/missing', {
      headers: { cookie: '__prerender_bypass=token' },
    })

    expect(rewriteOf(await proxy(request))).toBeNull()
    expect(fetchPublishedSlugs).not.toHaveBeenCalled()
  })

  it('lets the request through when the lookup fails', async () => {
    fetchPublishedSlugs.mockRejectedValue(new Error('redis down'))

    expect(rewriteOf(await proxy(new NextRequest('https://site.test/missing')))).toBeNull()
  })

  it('leaves files, the home page and static routes alone', async () => {
    for (const path of ['/', '/blog', '/blog/feed.xml', '/robots.txt', '/api/health']) {
      expect(rewriteOf(await proxy(new NextRequest(`https://site.test${path}`)))).toBeNull()
    }

    expect(fetchPublishedSlugs).not.toHaveBeenCalled()
  })
})
