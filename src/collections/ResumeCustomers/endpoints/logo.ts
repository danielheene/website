import type { Endpoint } from 'payload'

import { createETag, isNotModified, validatorHeaders } from '@/lib/conditionalGet'
import { sanitizeSvg } from '@/lib/sanitizeSvg'
import { CollectionSlug } from '@/types/collections'

const IMMUTABLE = 'public, max-age=31536000, immutable'

/**
 * The file is only ever used as an image, but opened directly it is a document
 * of its own: no scripts, no outside resources.
 */
const SVG_HEADERS = {
  'Content-Type': 'image/svg+xml; charset=utf-8',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
  'X-Content-Type-Options': 'nosniff',
}

/** `GET /api/resume-customers/<slug>/logo.svg?v=<updatedAt>` — a customer's logo. */
export const logoEndpoint: Endpoint = {
  path: '/:slug/logo.svg',
  method: 'get',
  handler: async (req) => {
    const slug = String(req.routeParams?.slug ?? '')

    if (slug === '') return new Response(null, { status: 404 })

    // overrideAccess: false applies the collection's read access, so visitors
    // only ever see published customers.
    const {
      docs: [customer],
    } = await req.payload.find({
      collection: CollectionSlug.ResumeCustomers,
      where: {
        slug: {
          equals: slug,
        },
      },
      select: {
        svg: true,
        updatedAt: true,
      },
      limit: 1,
      pagination: false,
      depth: 0,
      overrideAccess: false,
      req,
    })

    if (!customer?.svg) return new Response(null, { status: 404 })

    // Also sanitized on write; this covers rows saved before that hook existed.
    const svg = sanitizeSvg(customer.svg)

    const validators = {
      etag: createETag(svg),
      lastModified: customer.updatedAt,
    }

    const headers = validatorHeaders(validators)

    for (const [name, value] of Object.entries(SVG_HEADERS)) headers.set(name, value)

    // Only the current version may be cached for good; a stale `v` from an
    // outdated page revalidates instead.
    const version = new URL(req.url ?? '', 'http://localhost').searchParams.get('v')

    headers.set('Cache-Control', version === customer.updatedAt ? IMMUTABLE : 'no-cache')

    if (isNotModified(req.headers, validators)) return new Response(null, { status: 304, headers })

    return new Response(svg, { status: 200, headers })
  },
}
