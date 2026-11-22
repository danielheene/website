import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { NextRequest } from 'next/server'

import { ogTargetFromSearchParams } from '@/lib/og/ogTarget'
import { renderOgImageForTarget } from '@/lib/og/renderOgImageForTarget'

/**
 * The finished card served when a card can't be built: its document is missing or rendering
 * failed (e.g. the database is down). Never cached, so the real card replaces it once it renders.
 * The path stays literal so Next's output tracing ships the file.
 */
const fallbackImage = async () =>
  new Response(
    new Uint8Array(await readFile(join(process.cwd(), 'public/og-image-fallback.webp'))),
    {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'no-cache',
      },
    },
  )

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

  try {
    const image = await renderOgImageForTarget(target)

    if (!image) return fallbackImage()

    // read here so a failure while rendering still falls back, rather than breaking the stream
    const body = await image.arrayBuffer()

    image.headers.set(
      'Cache-Control',
      searchParams.has('v') ? 'public, max-age=31536000, immutable' : 'no-cache',
    )

    return new Response(body, {
      headers: image.headers,
    })
  } catch (caught) {
    console.error('Open Graph image failed:', caught)

    return fallbackImage()
  }
}
