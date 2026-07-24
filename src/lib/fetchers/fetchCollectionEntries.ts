'use server'

import config from '@payload-config'
import { FindOptions, getPayload, SelectType } from 'payload'

import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionData, RegisteredCollectionSlug } from '@/types/collections'
import { GlobalSlugValue } from '@/types/globals'

export const fetchCollectionEntries = async <
  T extends RegisteredCollectionSlug = RegisteredCollectionSlug,
>(
  collectionSlug: T,
  options?: Omit<FindOptions<T, SelectType>, 'collection'>,
): Promise<CollectionData<T>> => {
  const payload = await getPayload({
    config,
  })

  let data: CollectionData<T> = await payload.kv.get(collectionSlug)
  if (!data) {
    const rawData = await payload.find({
      collection: collectionSlug,
      pagination: true,

      draft: false,
    })
    const enhancedData = await resolveRelations(rawData)
    data = JSON.parse(JSON.stringify(enhancedData))
    await payload.kv.set(collectionSlug, data)
  }

  return data
}

export const invalidateGlobalData = async (globalSlug: GlobalSlugValue) => {
  const payload = await getPayload({
    config,
  })

  await payload.kv.delete(globalSlug)
}
