import { generateImageAlternativeText } from '@/lib/generateImageAlternativeText'
import { CollectionBeforeChangeHook } from 'payload'

/**
 * Generate alt text for a media image.
 * This function is used as a beforeChange hook for the MediaImage collection.
 * It generates alternative text for images based on their content.
 */
export const generateAlt: CollectionBeforeChangeHook = async ({ data, req: { file } }) => {
  /* req.file is only set when uploading a file */
  if (!file || !file?.mimetype?.includes('image')) return data

  const alt = await generateImageAlternativeText(file.data)
  return { ...data, alt }
}
