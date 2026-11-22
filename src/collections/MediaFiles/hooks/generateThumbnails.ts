import type { CollectionAfterChangeHook } from 'payload'

import { enqueueDocumentTask } from '@/lib/documentTasks/enqueueDocumentTask'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'
import { MediaFile } from '@/types/payload'

export const generateThumbnails: CollectionAfterChangeHook<MediaFile> = async ({
  context,
  doc,
  req,
  previousDoc,
  operation,
}) => {
  if (context.skipGenerateDocumentThumbnails) return doc

  // page thumbnails are rendered with pdf.js
  if (doc.mimeType !== 'application/pdf') return doc

  if (
    (operation === 'create' || operation === 'update') &&
    doc.checksum !== previousDoc?.checksum
  ) {
    await enqueueDocumentTask({
      payload: req.payload,
      task: TaskSlug.GenerateDocumentThumbnails,
      collection: CollectionSlug.MediaFiles,
      doc,
    })
  }
}
