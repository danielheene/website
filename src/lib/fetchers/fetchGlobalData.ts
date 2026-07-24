'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { resolveRelations } from '@/lib/resolveRelation'
import { GlobalData, GlobalSlugValue, RegisteredGlobalSlug } from '@/types/globals'

/**
 * Fetches global data for a specific global slug from the KV store. If the data is not found in the KV store,
 * it fetches the data from the source, resolves any relations, and caches the data in the KV store.
 *
 * @param {GlobalSlugValue} globalSlug - The unique identifier for the global data to be fetched
 * @returns {Promise<GlobalData<GlobalSlugValue>>} A promise that resolves to the fetched global data for the specified slug
 * @throws {Error} May throw if the invalidation or fetch operations fail
 */
export const fetchGlobalData = async <T extends RegisteredGlobalSlug>(
  globalSlug: T,
): Promise<GlobalData<T>> => {
  const payload = await getPayload({
    config,
  })

  let data: string = await payload.kv.get(globalSlug)
  if (!data) {
    const rawData = await payload.findGlobal({
      slug: globalSlug,
      draft: false,
    })
    const enhancedData = await resolveRelations(rawData)
    data = JSON.stringify(enhancedData)
    await payload.kv.set(globalSlug, data)
  }

  return (await JSON.parse(data)) as GlobalData<T>
}

/**
 * Invalidates the cached global data for a specific global slug by deleting the existing cache.
 *
 * @param {GlobalSlugValue} globalSlug - The unique identifier for the global data to be invalidated
 * @returns {Promise<void>} A promise that resolves when the cache invalidation is complete
 */
export const invalidateGlobalData = async (globalSlug: RegisteredGlobalSlug): Promise<void> => {
  const payload = await getPayload({
    config,
  })

  try {
    await payload.kv.delete(globalSlug)
  } catch (error) {
    console.error(`Failed to invalidate global data for ${globalSlug}:`, extractErrorMessage(error))
  }

  return void 0
}

/**
 * Updates the cached global data for a specific global slug by invalidating the existing cache
 * and fetching fresh data from the source.
 *
 * @param {GlobalSlugValue} globalSlug - The unique identifier for the global data to be updated
 * @returns {Promise<GlobalData<GlobalSlugValue>>} A promise that resolves to the freshly fetched global data for the specified slug
 * @throws {Error} May throw if the invalidation or fetch operations fail
 */
export const updateGlobalData = async <T extends RegisteredGlobalSlug>(
  globalSlug: T,
): Promise<GlobalData<T>> => {
  await invalidateGlobalData(globalSlug)
  return await fetchGlobalData(globalSlug)
}
