import { describe, expect, it } from 'vitest'

import { createETag, isNotModified, validatorHeaders } from './conditionalGet'

const etag = createETag('<rss />')
const lastModified = '2026-10-09T15:24:30.500Z'

const request = (headers: Record<string, string>) => new Headers(headers)

describe('createETag', () => {
  it('is quoted and stable for the same body', () => {
    expect(etag).toMatch(/^"[\w-]+"$/)
    expect(createETag('<rss />')).toBe(etag)
  })

  it('changes with the body', () => {
    expect(createETag('<rss></rss>')).not.toBe(etag)
  })
})

describe('validatorHeaders', () => {
  it('sends ETag and an HTTP-date Last-Modified', () => {
    const headers = validatorHeaders({
      etag,
      lastModified,
    })

    expect(headers.get('etag')).toBe(etag)
    expect(headers.get('last-modified')).toBe('Fri, 09 Oct 2026 15:24:30 GMT')
  })

  it('omits Last-Modified when no timestamp is known', () => {
    const headers = validatorHeaders({
      etag,
    })

    expect(headers.get('etag')).toBe(etag)
    expect(headers.has('last-modified')).toBe(false)
  })
})

describe('isNotModified', () => {
  const validators = {
    etag,
    lastModified,
  }

  it('is false for an unconditional request', () => {
    expect(isNotModified(request({}), validators)).toBe(false)
  })

  it('matches the current ETag, also among several and when weakened', () => {
    expect(isNotModified(request({ 'if-none-match': etag }), validators)).toBe(true)
    expect(isNotModified(request({ 'if-none-match': `"old", ${etag}` }), validators)).toBe(true)
    expect(isNotModified(request({ 'if-none-match': `W/${etag}` }), validators)).toBe(true)
    expect(isNotModified(request({ 'if-none-match': '*' }), validators)).toBe(true)
  })

  it('is false for a stale ETag, even with a fresh If-Modified-Since', () => {
    expect(
      isNotModified(
        request({
          'if-none-match': '"old"',
          'if-modified-since': 'Sat, 10 Oct 2026 00:00:00 GMT',
        }),
        validators,
      ),
    ).toBe(false)
  })

  it('compares If-Modified-Since at one-second resolution', () => {
    expect(
      isNotModified(request({ 'if-modified-since': 'Fri, 09 Oct 2026 15:24:30 GMT' }), validators),
    ).toBe(true)
    expect(
      isNotModified(request({ 'if-modified-since': 'Fri, 09 Oct 2026 15:24:29 GMT' }), validators),
    ).toBe(false)
  })

  it('ignores an unparseable If-Modified-Since or a missing timestamp', () => {
    expect(isNotModified(request({ 'if-modified-since': 'yesterday' }), validators)).toBe(false)
    expect(
      isNotModified(request({ 'if-modified-since': 'Fri, 09 Oct 2026 15:24:30 GMT' }), {
        etag,
      }),
    ).toBe(false)
  })
})
