import type { CollectionBeforeChangeHook } from 'payload'

import sharp from 'sharp'

import type { MediaImage } from '@/types/payload'

/**
 * Generate a blur data URL for a media image.
 * This function is used as a beforeChange hook for the MediaImage collection.
 * It resizes the image to a small thumbnail and converts it to a base64-encoded data URL.
 * The blurDataURL is then added to the image data.
 */
export const generateBlurDataURL: CollectionBeforeChangeHook<MediaImage> = async ({
  data,
  req: { file },
}) => {
  if (!file?.mimetype?.includes('image')) return data

  const resizedImageBuffer = await sharp(file.data)
    .autoOrient()
    .jpeg({
      quality: 50,
    })
    .resize({
      width: 10,
      height: 10,
      fit: 'outside', // resize the image to at least the specified dimensions while maintaining the aspect ratio.
    })
    .toBuffer()

  const blurDataURL = `data:image/jpeg;base64,${resizedImageBuffer.toString('base64')}`

  return {
    ...data,
    blurDataURL,
  }
}
