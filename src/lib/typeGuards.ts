import type {
  MediaAudio,
  MediaDocument,
  MediaImage,
  MediaVideo,
} from '@/types/payload'

export const isMediaImage = (media: unknown): media is MediaImage =>
  media &&
  typeof media === 'object' &&
  'mimeType' in media &&
  typeof media.mimeType === 'string' &&
  media.mimeType.startsWith('image/')

export const isMediaVideo = (media: unknown): media is MediaVideo =>
  media &&
  typeof media === 'object' &&
  'mimeType' in media &&
  typeof media.mimeType === 'string' &&
  media.mimeType.startsWith('video/')

export const isMediaDocument = (media: unknown): media is MediaDocument =>
  media &&
  typeof media === 'object' &&
  'mimeType' in media &&
  typeof media.mimeType === 'string' &&
  media.mimeType.startsWith('application/')

export const isMediaAudio = (media: unknown): media is MediaAudio =>
  media &&
  typeof media === 'object' &&
  'mimeType' in media &&
  typeof media.mimeType === 'string' &&
  media.mimeType.startsWith('audio/')

export const isHeroMedia = (media: unknown): media is MediaImage | MediaVideo =>
  isMediaImage(media) || isMediaVideo(media)

export const isHeroMediaArray = (
  media: unknown,
): media is (MediaImage | MediaVideo)[] =>
  Array.isArray(media) && media.length > 0 && media.every(isHeroMedia)
