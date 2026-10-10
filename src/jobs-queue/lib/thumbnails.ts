import type { Payload } from 'payload'

import { isString } from 'lodash-es'

import { CollectionSlug } from '@/types/collections'

type ThumbnailRelation = {
  relationTo: string
  value: string | { id: string }
}

export const stripExtension = (filename: string): string => filename.replace(/\.[^/.]+$/, '')

export const toMediaImageRelations = (ids: string[]) =>
  ids.map((id) => ({
    relationTo: CollectionSlug.MediaImages,
    value: id,
  }))

/**
 * Delete each thumbnail doc a `MediaField` relation array points to.
 *
 * Called after the parent doc is repointed at its new thumbnails, so a
 * failure here never leaves the parent referencing an already-deleted doc.
 */
export const deleteThumbnails = async (
  payload: Payload,
  thumbnails: ThumbnailRelation[],
): Promise<void> => {
  for (const { relationTo, value } of thumbnails) {
    await payload.delete({
      collection: relationTo as never,
      id: isString(value) ? value : value.id,
    })
  }
}
