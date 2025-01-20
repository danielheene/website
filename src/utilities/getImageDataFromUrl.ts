import { createCanvas, Image, ImageData, loadImage } from '@napi-rs/canvas'

export type { Image, ImageData }

/**
 * wraps loadImage for having image related stuff together
 * @param url
 */
export const getImageFromUrl = async (url: string): Promise<Image> => {
  return await loadImage(url)
}

/**
 * creates a headless canvas on server and retrieves image date fom it
 * @param url
 */
export const getImageDataFromUrl = async (url: string): Promise<ImageData> => {
  const image = await loadImage(url)
  const canvas = createCanvas(image.width, image.height)
  const context = canvas.getContext('2d')

  context.drawImage(image, 0, 0)

  return context.getImageData(0, 0, image.width, image.height)
}
