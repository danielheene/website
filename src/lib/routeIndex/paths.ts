import { generateContentPath } from '@/lib/generateContentPath'

/** The path the proxy rewrites unknown paths to; its page 404s while prerendering. */
export const NOT_FOUND_PATH = '/404'

// Framework, admin and API routes: never in the index, always let through.
const UNVALIDATED_PREFIXES = ['/_next', '/admin', '/api']

/** Drops trailing slashes, keeping `/` itself. */
export const normalizePath = (pathname: string): string =>
  pathname === '/' ? pathname : pathname.replace(/\/+$/, '') || '/'

/**
 * Whether the proxy checks this path against the route index. Files (any last
 * segment with a dot: `robots.txt`, `feed.xml`, `resume.pdf`, public assets)
 * and the framework, admin and API routes are let through unchecked.
 */
export const isValidatedPath = (pathname: string): boolean => {
  const path = normalizePath(pathname)

  if (UNVALIDATED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)))
    return false

  return !(path.split('/').at(-1) ?? '').includes('.')
}

/** The frontend path of a document, `/` for the home page. */
export const documentPath = (collection: string, slug: string): string =>
  generateContentPath(collection, slug)
