import { createHash } from 'node:crypto'

export interface Validators {
  /** A strong entity tag, quotes included. */
  etag: string
  /** ISO timestamp of the newest change, when one is known. */
  lastModified?: string
}

/** A strong entity tag derived from the exact bytes of the body. */
export const createETag = (body: string): string =>
  `"${createHash('sha1').update(body).digest('base64url')}"`

/** The headers that let a client revalidate instead of downloading again. */
export const validatorHeaders = ({ etag, lastModified }: Validators): Headers => {
  const headers = new Headers({
    ETag: etag,
  })

  if (lastModified) headers.set('Last-Modified', new Date(lastModified).toUTCString())

  return headers
}

const stripWeak = (tag: string) => tag.trim().replace(/^W\//, '')

/**
 * Whether a GET can be answered with 304 (RFC 9110 §13.1). `If-None-Match`
 * wins when present and uses weak comparison, so a proxy that weakened the tag
 * still matches; `If-Modified-Since` is only consulted without it, at the
 * one-second resolution of HTTP dates.
 */
export const isNotModified = (headers: Headers, { etag, lastModified }: Validators): boolean => {
  const ifNoneMatch = headers.get('if-none-match')

  if (ifNoneMatch !== null) {
    if (ifNoneMatch.trim() === '*') return true

    return ifNoneMatch.split(',').map(stripWeak).includes(stripWeak(etag))
  }

  const ifModifiedSince = headers.get('if-modified-since')

  if (ifModifiedSince === null || !lastModified) return false

  const since = Date.parse(ifModifiedSince)
  const modified = Date.parse(lastModified)

  if (Number.isNaN(since) || Number.isNaN(modified)) return false

  return Math.floor(modified / 1000) * 1000 <= since
}
