import configPromise from '@payload-config'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import { unstable_cache } from 'next/cache'
import { snakeCase } from 'lodash-es'
import { Global, GlobalData } from '@custom-types'

async function getGlobal<S extends Global>(slug: S, depth = 1): Promise<GlobalData<S>> {
  const payload = await getPayloadHMR({ config: configPromise })

  const data = await payload.findGlobal<S>({
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
