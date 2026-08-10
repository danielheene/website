import { NextRequest, NextResponse } from 'next/server'

import { fetchLatestResumeDocumentCore } from '@/lib/fetchers/fetchLatestResumeDocumentCore'
import { generateAPIPath } from '@/lib/generateAPIPath'
import { generateContentPath } from '@/lib/generateContentPath'
import { fetchRedirect } from '@/lib/redirects/redirectCache'
import { CollectionSlug } from '@/types/collections'

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
  const resumeDocumentLatestContentPath = generateContentPath(
    CollectionSlug.ResumeDocuments,
    'latest',
  )
  const resumeDocumentLatestAPIPath = generateAPIPath(CollectionSlug.ResumeDocuments, 'latest')

  if (request.nextUrl.pathname.startsWith(resumeDocumentLatestContentPath)) {
    const { slug } = await fetchLatestResumeDocumentCore()
    const path = generateContentPath(CollectionSlug.ResumeDocuments, slug)
    return NextResponse.rewrite(new URL(path, request.url))
  }
  if (request.nextUrl.pathname.startsWith(resumeDocumentLatestAPIPath)) {
    const { id } = await fetchLatestResumeDocumentCore()
    const path = generateAPIPath(CollectionSlug.ResumeDocuments, id)
    return NextResponse.rewrite(new URL(path, request.url))
  }

  // pagination moved from ?page=<n> to a /page/<n> segment; redirect old links
  // here rather than in the pages themselves, where reading searchParams would
  // opt the routes out of prerendering under Cache Components.
  const legacyPage = request.nextUrl.searchParams.get('page')
  if (
    legacyPage &&
    /^\d+$/.test(legacyPage) &&
    /^\/blog(\/[^/]+)?$/.test(request.nextUrl.pathname)
  ) {
    const target = new URL(request.url)
    target.searchParams.delete('page')
    target.pathname =
      Number(legacyPage) > 1
        ? `${request.nextUrl.pathname.replace(/\/$/, '')}/page/${legacyPage}`
        : request.nextUrl.pathname
    return NextResponse.redirect(target, 301)
  }

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
