import { cacheLife, cacheTag } from 'next/cache'

// imported from the leaf module, not `@/components/Icon`: that barrel re-exports
// a `'use client'` module, so on the server this name would resolve to a client
// reference stub instead of the URL string
import { ICONIFY_API } from '@/components/Icon/api'
import {
  type CollectionResponse,
  type IconCollection,
  isAllowedPrefix,
  parseCollection,
} from '@/fields/Icon/collection'
import { FAVORITE_COLLECTIONS } from '@/fields/Icon/favorites'

/**
 * One collection's icon names, cached server-side.
 *
 * `cacheLife('max')` because a self-hosted Iconify only gains icons when the
 * sets behind it are redeployed — there is no upstream drift to chase on a
 * timer. `cacheTag` gives that deploy a manual lever: `revalidateTag('icons')`
 * clears every set, `icons:<prefix>` clears one.
 *
 * With `cacheHandler` wired to Redis this entry lives there, shared across
 * instances; until then it is Next's default store. Either way the browser
 * stops talking to the Iconify host directly.
 */
const getCollection = async (prefix: string): Promise<IconCollection> => {
  'use cache'
  cacheTag('icons', `icons:${prefix}`)
  cacheLife('max')

  const response = await fetch(`${ICONIFY_API}/collection?prefix=${encodeURIComponent(prefix)}`)
  if (!response.ok) throw new Error(`Icon collection failed (HTTP ${response.status})`)

  return parseCollection(prefix, (await response.json()) as CollectionResponse)
}

export const GET = async (request: Request): Promise<Response> => {
  const prefix = new URL(request.url).searchParams.get('prefix')

  if (!isAllowedPrefix(prefix, FAVORITE_COLLECTIONS)) {
    return Response.json(
      {
        error: 'Unknown icon collection',
      },
      {
        status: 400,
      },
    )
  }

  try {
    return Response.json(await getCollection(prefix))
  } catch (caught) {
    console.error('Icon collection failed:', caught)
    return Response.json(
      {
        error: 'Icon collection failed',
      },
      {
        status: 502,
      },
    )
  }
}
