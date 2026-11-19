import type { NextRequest } from 'next/server'

import { ogTargetFromSearchParams } from '@/lib/og/ogTarget'
import { renderOgImageForTarget } from '@/lib/og/renderOgImageForTarget'

/**
 * The site's Open Graph images, one route for all of them so any card can be
 * previewed in the browser:
 *
 * - `/api/og-image?path=/blog/post/my-post`
 * - `/api/og-image?collection=posts&slug=my-post`
 *
 * Page metadata links here with a `v` (the document's `updatedAt`) that changes
 * the URL on every edit, so those URLs are cached for good; previews without
 * one always render fresh.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const target = ogTargetFromSearchParams(searchParams)

  if (!target) {
    return new Response(
      'Expected ?path=/some/page, or ?collection=pages|posts|topics|resume-documents&slug=…',
      {
        status: 400,
      },
    )
  }

  const image = await renderOgImageForTarget(target)

  if (!image) {
    return new Response('Not found', {
      status: 404,
    })
  }

  image.headers.set(
    'Cache-Control',
    searchParams.has('v') ? 'public, max-age=31536000, immutable' : 'no-cache',
  )

  return image
}
