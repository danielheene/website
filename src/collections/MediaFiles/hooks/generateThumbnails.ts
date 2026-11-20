import type { CollectionAfterChangeHook } from 'payload'

import { QueueSlug, TaskSlug } from '@/types/jobs-queue'
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

  if ((operation === 'create' || operation === 'update') && doc.checksum !== previousDoc.checksum) {
    await req.payload.jobs.queue({
      task: TaskSlug.GenerateDocumentThumbnails,
      queue: QueueSlug.HookHandler,
      input: {
        documentId: doc.id,
      },
    })
  }
}
