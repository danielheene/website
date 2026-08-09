import type { CollectionAfterChangeHook } from 'payload'

import { MediaAudio } from '@/types/payload'

export const generateThumbnail: CollectionAfterChangeHook<MediaAudio> = async ({
  context,
  doc,
  req,
  previousDoc,
  operation,
}) => {
  if (context.skipGenerateDocumentThumbnails) return doc

  if ((operation === 'create' || operation === 'update') && doc.checksum !== previousDoc.checksum) {
    // const job = await req.payload.jobs.queue({
    //   task: 'generateAudioThumbnailTask',
    //   queue: 'default',
    //   input: {
    //     audioId: doc.id,
    //   },
    // })
  }
}
