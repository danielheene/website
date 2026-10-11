import { NextRequest, NextResponse } from 'next/server'

import { resolveBlogListingUrl } from '@/lib/blog/listing'
import { fetchRedirect } from '@/lib/redirects/redirectCache'
import { getRuntimeConfig } from '@/lib/runtimeConfig'

/** Paths that must never be redirected, regardless of stored rows. */
const REDIRECT_EXEMPT = ['/admin', '/api', '/_next', '/next']

/**
 * Resolves a redirect for the current request.
 *
 * Runs in-process: `proxy.ts` is on the Node runtime, so Payload loads here
 * directly. Results are memoized in the KV store and invalidated by the
 * Redirects collection hooks.
 *
 * Failures are swallowed: a redirect lookup must never take down a page.
 */
const lookupRedirect = async (request: NextRequest) => {
  const { pathname } = request.nextUrl

  if (REDIRECT_EXEMPT.some((prefix) => pathname.startsWith(prefix))) return null

  try {
    const redirect = await fetchRedirect(pathname)
    if (redirect && redirect.destination !== pathname) return redirect
    return null
  } catch {
    return null
  }
}

const STATS_PREFIX = '/stats/'

/**
 * Forwards `/stats/*` to the Umami instance. Done here instead of in
 * `next.config.ts` `rewrites()` because rewrites are baked into the compiled
 * routes manifest, which would tie the compile to one environment's Umami URL.
 */
const rewriteToUmami = (request: NextRequest): NextResponse | null => {
  const { pathname, search } = request.nextUrl
  const { umamiUrl } = getRuntimeConfig()

  if (!umamiUrl || !pathname.startsWith(STATS_PREFIX)) return null

  return NextResponse.rewrite(
    new URL(`${pathname.slice(STATS_PREFIX.length - 1)}${search}`, umamiUrl),
  )
}

export default async function proxy(request: NextRequest) {
  const stats = rewriteToUmami(request)
  if (stats) return stats

  const redirect = await lookupRedirect(request)
  if (redirect) {
    const destination = new URL(redirect.destination, request.url)
    // preserve the incoming query string unless the target defines its own
    if (!redirect.destination.includes('?')) {
      destination.search = request.nextUrl.search
    }
    return NextResponse.redirect(destination, redirect.statusCode)
  }

  /**
   * Blog listings paginate and sort via `?page=` / `?sort=`. Non-canonical
   * forms (legacy /page/<n> segments, `page=1`, unknown sorts, …) redirect to
   * their canonical URL here: the listing reads its params inside a Suspense
   * boundary, where it can no longer change the response status.
   */
  const listing = resolveBlogListingUrl(request.nextUrl.pathname, request.nextUrl.search)
  if (listing?.redirect) {
    return NextResponse.redirect(new URL(listing.redirect, request.url), 308)
  }

  const response = NextResponse.next()
  // alternative sort orders duplicate the default listing's content
  if (listing && !listing.indexable) {
    response.headers.set('X-Robots-Tag', 'noindex, follow')
  }

  return response
}
