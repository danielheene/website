import type { CollectionAfterChangeHook } from 'payload'

import { enqueueDocumentTask } from '@/lib/documentTasks/enqueueDocumentTask'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'
import type { MediaVideo } from '@/types/payload'

/**
 * Queues poster-frame extraction instead of decoding inline, so uploads return
 * immediately and frame decoding gets retries. The work itself lives in
 * `@/jobs-queue/tasks/generateVideoThumbnails`.
 */
export const generateThumbnail: CollectionAfterChangeHook<MediaVideo> = async ({
  context,
  doc,
  req,
  previousDoc,
  operation,
}) => {
  if (context.skipGenerateVideoThumbnails) return doc

  if (
    (operation === 'create' || operation === 'update') &&
    doc.checksum !== previousDoc?.checksum
  ) {
    await enqueueDocumentTask({
      payload: req.payload,
      task: TaskSlug.GenerateVideoThumbnails,
      collection: CollectionSlug.MediaVideos,
      doc,
    })
  }

  return doc
}
