import type { CollectionBeforeValidateHook } from 'payload'

/**
 * Normalizes the source path so lookups can be a single exact match.
 *
 * Stored form: leading slash, no trailing slash, no query string or hash,
 * lowercased. `/` itself is preserved.
 */
export const normalizeRedirectPath = (input: string): string => {
  const withoutOrigin = input.trim().replace(/^https?:\/\/[^/]+/i, '')
  const withoutQuery = withoutOrigin.split(/[?#]/)[0]
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '')

  return (withoutTrailingSlash || '/').toLowerCase()
}

export const normalizeFromPath: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data

  if (typeof data.from === 'string') {
    data.from = normalizeRedirectPath(data.from)
  }

  // an internal target is normalized too, so loop detection compares like
  // with like; absolute URLs are left untouched
  if (typeof data.toPath === 'string' && data.toPath.trim() && !/^https?:\/\//i.test(data.toPath)) {
    data.toPath = normalizeRedirectPath(data.toPath)
  }

  return data
}
