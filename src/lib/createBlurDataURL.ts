import sharp from 'sharp'

/** A tiny JPEG of the image as a data URL, shown blurred while the image loads. */
export const createBlurDataURL = async (image: Buffer): Promise<string> => {
  const resized = await sharp(image)
    .autoOrient()
    .jpeg({
      quality: 50,
    })
    .resize({
      width: 10,
      height: 10,
      // at least 10×10 while keeping the aspect ratio
      fit: 'outside',
    })
    .toBuffer()

  return `data:image/jpeg;base64,${resized.toString('base64')}`
}
