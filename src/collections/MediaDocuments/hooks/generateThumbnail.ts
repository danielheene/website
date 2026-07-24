import type { CollectionAfterChangeHook } from 'payload'
import { MediaDocument } from '@/types/payload'

export const generateThumbnail: CollectionAfterChangeHook<MediaDocument> = async ({
                                                                                    context,
                                                                                    doc,
                                                                                    req,
                                                                                    previousDoc,
                                                                                    operation,
                                                                                  }) => {
  if (context.skipGenerateThumbnail) return doc


  if ((operation === 'create' || operation === 'update') && (doc.checksum !== previousDoc.checksum)) {
    const job = await req.payload.jobs.queue({
      task: 'generateDocumentThumbnailTask',
      queue: 'default',
      input: {
        documentId: doc.id,
      },
    })
  }
}
