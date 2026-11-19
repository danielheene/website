import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import type { ImageObjectLeaf } from 'schema-dts'

import type { MediaImage } from '@/types/payload'

import { absoluteUrl, pixels } from './ids'

/** A Lexical value as plain text on one line, or undefined when it holds none. */
export const lexicalToText = (value: unknown): string | undefined => {
  if (!value || typeof value !== 'object' || !('root' in value)) return undefined

  // SAFETY: `root` is the one property every serialized Lexical state has.
  const text = convertLexicalToPlaintext({
    data: value as Parameters<typeof convertLexicalToPlaintext>[0]['data'],
  })
    .replaceAll(/\s+/g, ' ')
    .trim()

  return text || undefined
}

export type ImageLike = Pick<MediaImage, 'url'> &
  Partial<Pick<MediaImage, 'width' | 'height' | 'alt' | 'credits'>>

/**
 * A populated image upload. The images collection's default populate omits
 * `mimeType`, so a relation into it is recognized by its `url` alone; every
 * caller only passes values of fields that can only point at images.
 */
export const isImageLike = (value: unknown): value is ImageLike =>
  Boolean(value) &&
  typeof value === 'object' &&
  'url' in value &&
  typeof value.url === 'string' &&
  value.url.length > 0

/** An uploaded image as an `ImageObject`, with its credits as `creditText`. */
export const toImageObject = (media: ImageLike, siteUrl: string): ImageObjectLeaf | undefined => {
  if (!media.url) return undefined

  const url = absoluteUrl(media.url, siteUrl)

  const image: ImageObjectLeaf = {
    '@type': 'ImageObject',
    url,
    contentUrl: url,
  }

  if (media.width) image.width = pixels(media.width)

  if (media.height) image.height = pixels(media.height)

  if (media.alt) image.caption = media.alt

  const credits = lexicalToText(media.credits)

  if (credits) image.creditText = credits

  return image
}

/** Every populated image slide of a hero, in slide order. */
export const heroImageObjects = (slides: unknown, siteUrl: string): ImageObjectLeaf[] =>
  (Array.isArray(slides) ? slides : []).flatMap((slide: unknown) => {
    if (!slide || typeof slide !== 'object' || !('media' in slide)) return []

    const { media } = slide

    const isImageUpload =
      media && typeof media === 'object' && 'relationTo' in media && media.relationTo === 'images'

    const value = isImageUpload && 'value' in media ? media.value : undefined
    const image = isImageLike(value) ? toImageObject(value, siteUrl) : undefined

    return image ? [image] : []
  })
