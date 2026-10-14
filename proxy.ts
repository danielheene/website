import { NextRequest, NextResponse } from 'next/server'

import { resolveBlogListingUrl } from '@/lib/blog/listing'
import { pageSlugExists } from '@/lib/pages/pageSlugCache'
import { fetchRedirect } from '@/lib/redirects/redirectCache'
import { getRuntimeConfig } from '@/lib/runtimeConfig'

/** Paths that must never be redirected, regardless of stored rows. */
const REDIRECT_EXEMPT = ['/admin', '/api', '/_next', '/next']

/** Top-level segments routed elsewhere, so an unmatched one can't fall through to `[slug]`. */
const RESERVED_TOP_LEVEL_SEGMENTS = new Set(['admin', 'api', 'blog', 'download', 'resume', 'stats'])

/**
 * Checks whether `pathname` would reach `app/(frontend)/[slug]/page.tsx` for
 * an unknown page, so `proxy` can 404 it before the response starts
 * streaming. `[slug]` only matches a single top-level segment — anything
 * nested, or under a reserved segment handled by its own route, is left to
 * that route (including Next internals and static files, which never reach
 * `proxy` as rewritable paths in the first place).
 */
const isUnknownSlugCandidate = (pathname: string): string | null => {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length !== 1) return null

  const [slug] = segments

  // A dotted last segment (favicon.ico, robots.txt, ...) is a static file
  // under `public/`, never a page slug.
  if (RESERVED_TOP_LEVEL_SEGMENTS.has(slug) || slug.includes('.')) return null

  return slug
}

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

  /**
   * [slug]/page.tsx renders inside the root layout's `<Suspense>` boundary,
   * so by the time it calls `notFound()` the static shell has already
   * streamed as a 200 and the status can no longer change (see "Calling
   * notFound() after streaming has started" in Next's `notFound()` docs).
   * Checking existence here, before that shell streams, is what lets an
   * unknown top-level path return a real 404.
   *
   * Draft previews read unpublished pages (`overrideAccess: true`), which
   * `pageSlugExists` deliberately does not — skip the check so a draft-only
   * page isn't 404'd before `[slug]/page.tsx` gets to render it.
   */
  const isDraftRequest = request.cookies.has('__prerender_bypass')
  const slugCandidate = isDraftRequest ? null : isUnknownSlugCandidate(request.nextUrl.pathname)

  if (slugCandidate && !(await pageSlugExists(slugCandidate))) {
    return new NextResponse(null, { status: 404 })
  }

  const response = NextResponse.next()

  // alternative sort orders duplicate the default listing's content
  if (listing && !listing.indexable) {
    response.headers.set('X-Robots-Tag', 'noindex, follow')
  }

  return response
}
