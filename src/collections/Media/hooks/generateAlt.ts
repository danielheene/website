import { generateImageAlternativeText } from '@/data/generateImageAlternativeText'
import { CollectionBeforeChangeHook } from 'payload'

export const generateAlt: CollectionBeforeChangeHook = async ({ data, req: { file } }) => {
  if (!file || !file?.mimetype?.includes('image')) return data

  const alt = await generateImageAlternativeText(file.data)
  return { ...data, alt }
}
