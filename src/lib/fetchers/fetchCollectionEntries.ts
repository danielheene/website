'use server'

import config from '@payload-config'
import { getPayload, TypedGlobal, TypedCollection, FindOptions, SelectType } from 'payload'

import { ResolvedRelations, resolveRelations } from '@/lib/resolveRelation'
import { GlobalSlugValue } from '@/types/globals'
import { CollectionSlugValue, TypedCollectionSelect, CollectionData, RegisteredCollectionSlug } from '@/types/collections'

export const fetchCollectionEntries = async <T extends RegisteredCollectionSlug = RegisteredCollectionSlug>(
  collectionSlug: T, options?: Omit<FindOptions<T, SelectType>, 'collection' >
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
