import type { CollectionAfterChangeHook } from 'payload'
import { MediaVideo } from '@/types/payload'

export const generateThumbnail: CollectionAfterChangeHook<MediaVideo> = async ({
                                                                                 context,
                                                                                 doc,
                                                                                 req,
                                                                                 previousDoc,
                                                                                 operation,
                                                                               }) => {
  if (context.skipGenerateDocumentThumbnail) return doc


  if ((operation === 'create' || operation === 'update') && (doc.checksum !== previousDoc.checksum)) {
    // const job = await req.payload.jobs.queue({
    //   task: 'generateVideoThumbnailTask',
    //   queue: 'default',
    //   input: {
    //     videoId: doc.id,
    //   },
    // })
  }
}
