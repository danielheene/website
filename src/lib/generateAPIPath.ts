import { CollectionSlugValue } from '@/types/collections'

/**
 * Generates a api path based on the collection and id
 * @param collection
 * @param id
 */
export const generateAPIPath = (collection: CollectionSlugValue, id: string): string => {
  return `/api/${collection}/${id}`
}
