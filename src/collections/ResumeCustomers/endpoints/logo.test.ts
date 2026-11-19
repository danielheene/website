import type { PayloadRequest } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { logoEndpoint } from './logo'

const UPDATED_AT = '2026-09-30T02:18:47.604Z'
const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h1v1z"/></svg>'

const request = ({
  slug = 'acme',
  query = '',
  headers = {},
  docs = [{ svg: SVG, updatedAt: UPDATED_AT }],
}: {
  slug?: string
  query?: string
  headers?: Record<string, string>
  docs?: { svg?: string | null; updatedAt: string }[]
} = {}) => {
  const find = vi.fn().mockResolvedValue({ docs })

  // SAFETY: the handler only reads these fields of the request.
  const req = {
    routeParams: { slug },
    url: `http://localhost/api/resume-customers/${slug}/logo.svg${query}`,
    headers: new Headers(headers),
    payload: { find },
  } as unknown as PayloadRequest

  return { req, find }
}

describe('logoEndpoint', () => {
  it('reads with the collection access rules, so visitors never see drafts', async () => {
    const { req, find } = request()

    await logoEndpoint.handler(req)

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        overrideAccess: false,
        req,
        where: { slug: { equals: 'acme' } },
      }),
    )
  })

  it('serves the sanitized SVG with locked-down headers', async () => {
    const { req } = request({
      docs: [
        { svg: `<svg><script>alert(1)</script><path d="M0 0"/></svg>`, updatedAt: UPDATED_AT },
      ],
    })

    const response = await logoEndpoint.handler(req)
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(body).not.toContain('script')
    expect(response.headers.get('content-type')).toBe('image/svg+xml; charset=utf-8')
    expect(response.headers.get('content-security-policy')).toContain("default-src 'none'")
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('caches the current version as immutable and anything else not at all', async () => {
    const current = await logoEndpoint.handler(
      request({ query: `?v=${encodeURIComponent(UPDATED_AT)}` }).req,
    )
    const stale = await logoEndpoint.handler(request({ query: '?v=2020-01-01' }).req)

    expect(current.headers.get('cache-control')).toContain('immutable')
    expect(stale.headers.get('cache-control')).toBe('no-cache')
  })

  it('answers 304 when the client already has this version', async () => {
    const first = await logoEndpoint.handler(request().req)
    const etag = first.headers.get('etag')

    const second = await logoEndpoint.handler(request({ headers: { 'if-none-match': etag } }).req)

    expect(second.status).toBe(304)
  })

  it('answers 404 for unknown, unreadable or logo-less customers', async () => {
    expect((await logoEndpoint.handler(request({ docs: [] }).req)).status).toBe(404)
    expect(
      (await logoEndpoint.handler(request({ docs: [{ svg: null, updatedAt: UPDATED_AT }] }).req))
        .status,
    ).toBe(404)
    expect((await logoEndpoint.handler(request({ slug: '' }).req)).status).toBe(404)
  })
})
