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
