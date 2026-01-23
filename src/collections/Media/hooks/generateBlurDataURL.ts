import { Media } from '@payload-types'
import { CollectionBeforeChangeHook } from 'payload'
import sharp from 'sharp'

export const generateBlurDataURL: CollectionBeforeChangeHook<Media> = async ({ data, req: { file } }) => {
  if (!file || !file?.mimetype?.includes('image')) return data

  const resizedImageBuffer = await sharp(file.data)
    .autoOrient()
    .jpeg({ quality: 50 })
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
