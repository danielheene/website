import { COLLECTION_PREFIX_MAP } from '@/types/collections'

/**
 * Generates a content path based on the collection and slug
 * @param collection
 * @param slug
 */
export const generateContentPath = (
  collection: string,
  slug: string = '',
): string => {
  const path = [
    COLLECTION_PREFIX_MAP[collection],
    slug,
  ]
  return path.reduce((acc, curr) => {
    if (curr !== 'home') {
      return acc.endsWith('/') ? `${acc}${curr}` : `${acc}/${curr}`
    }
    return acc
  }, '/')
}
