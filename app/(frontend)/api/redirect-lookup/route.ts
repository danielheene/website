import { type NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

import { resolveRedirect } from '@/lib/redirects'

/**
 * Redirect lookup for `proxy.ts`.
 *
 * Middleware cannot load Payload, so the proxy calls this route to resolve a
 * path. Responses are cached briefly: redirects change rarely, and this sits
 * in front of every request that would otherwise 404.
 */
export const GET = async (request: NextRequest) => {
  const pathname = request.nextUrl.searchParams.get('pathname')

  if (!pathname) {
    return NextResponse.json(
      {
        error: 'pathname is required',
      },
      {
        status: 400,
      },
    )
  }

  const payload = await getPayload({
    config,
  })

  const redirect = await resolveRedirect({
    payload,
    pathname,
  })

  return NextResponse.json(redirect ?? null, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  })
}
