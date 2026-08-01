import { NextRequest, NextResponse } from 'next/server'

import { fetchLatestResumeDocumentCore } from '@/lib/fetchers/fetchLatestResumeDocumentCore'
import { generateAPIPath } from '@/lib/generateAPIPath'
import { generateContentPath } from '@/lib/generateContentPath'
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
 * Middleware cannot load Payload, so the lookup goes through an internal route.
 * Failures are swallowed: a redirect lookup must never take down a page.
 */
const lookupRedirect = async (
  request: NextRequest,
): Promise<{
  destination: string
  statusCode: number
} | null> => {
  const { pathname } = request.nextUrl

  if (REDIRECT_EXEMPT.some((prefix) => pathname.startsWith(prefix))) return null

  try {
    const lookupURL = new URL('/api/redirect-lookup', request.url)
    lookupURL.searchParams.set('pathname', pathname)

    const response = await fetch(lookupURL, {
      headers: {
        accept: 'application/json',
      },
    })
    if (!response.ok) return null

    return (await response.json()) as {
      destination: string
      statusCode: number
    } | null
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
