import type { GlobalData, RegisteredGlobalSlug } from '@custom-types'
import { config } from '@payload-config'
import { snakeCase } from 'lodash-es'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export const getGlobal = async <S extends RegisteredGlobalSlug>(slug: S, depth = 2): Promise<GlobalData<S>> => {
  const payload = await getPayload({ config })

  const data = await payload.findGlobal({
    slug,
    draft: false,
    depth,
  })

  return {
    ...data,
    globalType: slug,
  }
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = <S extends RegisteredGlobalSlug>(slug: S, depth = 2): (() => Promise<GlobalData<S>>) =>
  unstable_cache(async () => getGlobal(slug, depth), [slug], {
    tags: [`${snakeCase(slug)}`],
  })
