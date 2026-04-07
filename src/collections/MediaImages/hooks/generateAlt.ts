import type { CollectionBeforeChangeHook } from 'payload'

import { generateImageAlternativeText } from '@/lib/generateImageAlternativeText'

/**
 * Generate alt text for a media image.
 * This function is used as a beforeChange hook for the MediaImage collection.
 * It generates alternative text for images based on their content.
 */
export const generateAlt: CollectionBeforeChangeHook = async ({ data, req: { file }, context }) => {
  if (context.skipGenerateAlt) return data

  /* req.file is only set when uploading a file */
  if (!file || !file?.mimetype?.includes('image')) return data

  const alt = await generateImageAlternativeText(file.data)
  return { ...data, alt }
}
