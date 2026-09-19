'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug } from '@/types/collections'
import type { MediaImage, MediaVideo } from '@/types/payload'

export interface UploadHeroSlideMediaResult {
  id: string
  kind: 'image' | 'video'
  doc: MediaImage | MediaVideo
}

/**
 * Creates a `MediaImages`/`MediaVideos` document from a file picked through
 * `AddSlideMenu`'s "Upload Image"/"Upload Video" actions — through Payload's
 * local API, so each collection's own hooks run exactly as they do for a
 * manual upload in the admin UI (`generateChecksum`, `MediaVideos`'
 * `generateThumbnail`, etc.).
 *
 * Takes a `FormData` (not a typed object) because a browser `File` only
 * survives a Server Action boundary inside `FormData` — passing it as a
 * plain object argument would serialize it away. The caller (the hero-slide
 * array editor) builds this from the file the native `<input type="file">`
 * handed back.
 */
export const uploadHeroSlideMedia = async (
  formData: FormData,
): Promise<UploadHeroSlideMediaResult> => {
  const file = formData.get('file')
  const kind = formData.get('kind')

  if (!(file instanceof File)) {
    throw new Error('No file was provided.')
  }
  if (kind !== 'image' && kind !== 'video') {
    throw new Error(`Unexpected upload kind: ${String(kind)}`)
  }

  const arrayBuffer = await file.arrayBuffer()
  const data = Buffer.from(arrayBuffer)

  const payload = await getPayload({
    config,
  })

  const collection = kind === 'image' ? CollectionSlug.MediaImages : CollectionSlug.MediaVideos

  const doc = await payload.create({
    collection,
    data: {},
    file: {
      data,
      name: file.name,
      mimetype: file.type,
      size: data.byteLength,
    },
  })

  return {
    id: String(doc.id),
    kind,
    doc: doc as MediaImage | MediaVideo,
  }
}
