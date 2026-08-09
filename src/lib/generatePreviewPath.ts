'use server'

import { generateContentPath } from './generateContentPath'

/**
 * Generates a preview path for a content item
 * @param collection
 * @param slug
 */
export const generatePreviewPath = async (
  collection: string,
  slug: string,
): Promise<string | null> => {
  if (slug === undefined || slug === null || slug === '') return null

  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: generateContentPath(collection, slug),
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  return `/api/preview?${encodedParams.toString()}`
}
