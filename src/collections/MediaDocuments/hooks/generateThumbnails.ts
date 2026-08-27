import type { CollectionAfterChangeHook } from 'payload'

import { QueueSlug, TaskSlug } from '@/types/jobs-queue'
import { MediaDocument } from '@/types/payload'

export const generateThumbnails: CollectionAfterChangeHook<MediaDocument> = async ({
  context,
  doc,
  req,
  previousDoc,
  operation,
}) => {
  if (context.skipGenerateDocumentThumbnails) return doc

  if ((operation === 'create' || operation === 'update') && doc.checksum !== previousDoc.checksum) {
    await req.payload.jobs.queue({
      task: TaskSlug.GenerateDocumentThumbnails,
      queue: QueueSlug.Default,
      input: {
        documentId: doc.id,
      },
    })
  }
}
