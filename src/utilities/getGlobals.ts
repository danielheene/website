import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { snakeCase } from 'lodash-es'
import { Global, GlobalData } from '@custom-types'
import { getPayload } from 'payload'

async function getGlobal<S extends Global>(slug: S, depth = 1): Promise<GlobalData<S>> {
  const payload = await getPayload({ config: configPromise })

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
export const getCachedGlobal = <S extends Global>(
  slug: S,
  depth = 1,
): (() => Promise<GlobalData<S>>) =>
  unstable_cache(async () => getGlobal(slug, depth), [slug], {
    tags: [`${snakeCase(slug)}`],
  })
