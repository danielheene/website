import { NextRequest, NextResponse } from 'next/server'

import { resolveBlogListingUrl } from '@/lib/blog/listing'
import { fetchRedirect } from '@/lib/redirects/redirectCache'
import { isValidatedPath, normalizePath, NOT_FOUND_PATH } from '@/lib/routeIndex/paths'
import { hasRoute } from '@/lib/routeIndex/routeIndexStore'

// Set by `draftMode().enable()`.
const DRAFT_MODE_COOKIE = '__prerender_bypass'

/** Paths that must never be redirected, regardless of stored rows. */
const REDIRECT_EXEMPT = ['/admin', '/api', '/_next', '/next', '/stats']

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

/**
 * Whether the frontend has nothing at this path. With Cache Components the
 * dynamic routes send their prerendered shell, and with it a `200`, before the
 * page runs `notFound()`, so a real `404` has to be decided here, against the
 * route index the sitemap is built from.
 *
 * Draft mode previews unpublished documents and skips the check. Failures
 * answer "known": a lookup must never take down a page.
 */
const isUnknownPath = async (request: NextRequest): Promise<boolean> => {
  const { pathname } = request.nextUrl

  if (request.cookies.has(DRAFT_MODE_COOKIE) || !isValidatedPath(pathname)) return false

  try {
    return !(await hasRoute(normalizePath(pathname)))
  } catch {
    return false
  }
}

export default async function proxy(request: NextRequest) {
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
   * forms (`page=1`, unknown sorts, …) redirect to their canonical URL here:
   * the listing reads its params inside a Suspense boundary, where it can no
   * longer change the response status.
   */
  const listing = resolveBlogListingUrl(request.nextUrl.pathname, request.nextUrl.search)

  if (listing?.redirect) {
    return NextResponse.redirect(new URL(listing.redirect, request.url), 308)
  }

  if (await isUnknownPath(request)) {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url))
  }

  const response = NextResponse.next()

  // alternative sort orders duplicate the default listing's content
  if (listing && !listing.indexable) {
    response.headers.set('X-Robots-Tag', 'noindex, follow')
  }

  response.headers.set('X-Current-Path', request.nextUrl.pathname)

  return response
}
