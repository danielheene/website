import { type NextRequest, NextResponse } from 'next/server'

// Proxy browser-side Umami analytics requests through /stats so the
// outgoing host is the site's own domain rather than the Umami server,
// keeping it out of ad-blocker filter lists that target known analytics
// hosts/paths.
//
// The Umami URL is read here at request time (not at build time), so one
// compiled output works across environments without embedding the value
// into routes-manifest.json (which would trigger check-env-leak in CI).
// `sendUmamiPayload.ts` routes browser requests to /stats/api/send.

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const umamiUrl = process.env['NEXT_PUBLIC_UMAMI_URL']
  if (!umamiUrl) {
    return new NextResponse(null, { status: 204 })
  }

  const { path } = await params
  const destination = `${umamiUrl}/${path.join('/')}`

  const headers = new Headers(req.headers)
  headers.delete('host')

  const upstream = await fetch(destination, {
    method: 'POST',
    headers,
    body: req.body,
    // @ts-ignore -- duplex is required for streaming request bodies in Node fetch
    duplex: 'half',
  })

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  })
}
