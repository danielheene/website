import { NextRequest, NextResponse } from 'next/server'

import { fetchRedirect } from '@/lib/redirects/redirectCache'

/** Paths that must never be redirected, regardless of stored rows. */
const REDIRECT_EXEMPT = [
  '/admin',
  '/api',
  '/_next',
  '/next',
]

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
    return await fetchRedirect(pathname)
  } catch {
    return null
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

  return NextResponse.next()
}
