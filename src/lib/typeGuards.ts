import { CollectionSlug } from '@/types/collections'
import type { MediaAudio, MediaDocument, MediaImage, MediaVideo } from '@/types/payload'

export const isMediaObject = (
  media: unknown,
): media is MediaImage | MediaVideo | MediaDocument | MediaAudio =>
  media && typeof media === 'object' && 'mimeType' in media && typeof media.mimeType === 'string'

export const isMediaImage = (media: unknown): media is MediaImage =>
  isMediaObject(media) && media.mimeType.startsWith('image/')

export const isMediaVideo = (media: unknown): media is MediaVideo =>
  isMediaObject(media) && media.mimeType.startsWith('video/')

export const isMediaDocument = (media: unknown): media is MediaDocument =>
  isMediaObject(media) && media.mimeType.startsWith('application/')

export const isMediaAudio = (media: unknown): media is MediaAudio =>
  isMediaObject(media) && media.mimeType.startsWith('audio/')

export const isHeroMedia = (media: unknown): media is MediaImage | MediaVideo =>
  isMediaImage(media) || isMediaVideo(media)

export const isHeroMediaArray = (media: unknown): media is (MediaImage | MediaVideo)[] =>
  Array.isArray(media) && media.length > 0 && media.every(isHeroMedia)

/**
 * Narrows a `MediaImage` to one that is actually renderable by `ImageMedia`.
 *
 * `MediaImage.url` is optional/nullable in the generated Payload types, but
 * `ImageMedia` does `new URL(src)` on it — which throws on a relative or
 * missing value. Guarding with this before rendering keeps a half-populated
 * upload from taking down the whole page, and narrows `url` to `string` so
 * callers don't need a non-null assertion.
 */
export const isRenderableImage = (
  media: unknown,
): media is MediaImage & {
  url: string
} => isMediaImage(media) && typeof media.url === 'string' && media.url.length > 0

/**
 * Narrows a Payload upload/relationship field (`{ relationTo, value }`) to one
 * whose `value` has been populated into a renderable `MediaImage` rather than
 * left as an unpopulated ID string.
 */
export const isRenderableImageRelation = (
  object: unknown,
): object is {
  relationTo: CollectionSlug['MediaImages']
  value: MediaImage & {
    url: string
  }
} =>
  !!object &&
  typeof object === 'object' &&
  'value' in object &&
  isRenderableImage(
    (
      object as {
        value: unknown
      }
    ).value,
  )

export const isMediaImageReference = (
  object: unknown,
): object is {
  referenceTo: CollectionSlug['MediaImages']
  value: MediaImage
} =>
  object &&
  typeof object === 'object' &&
  'referenceTo' in object &&
  object.referenceTo === CollectionSlug.MediaImages &&
  'value' in object &&
  isMediaImage(object.value)

export const isMediaVideoReference = (
  object: unknown,
): object is {
  referenceTo: CollectionSlug['MediaVideos']
  value: MediaVideo
} =>
  object &&
  typeof object === 'object' &&
  'referenceTo' in object &&
  object.referenceTo === CollectionSlug.MediaVideos &&
  'value' in object &&
  isMediaVideo(object.value)
