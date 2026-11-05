import { NextRequest } from 'next/server'

import { afterEach, describe, expect, it, vi } from 'vitest'

import proxy from './proxy'

const { fetchRedirect } = vi.hoisted(() => ({
  fetchRedirect: vi.fn(async () => null),
}))

vi.mock('@/lib/redirects/redirectCache', () => ({
  fetchRedirect,
}))

afterEach(() => {
  fetchRedirect.mockClear()
  fetchRedirect.mockResolvedValue(null)
})

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
