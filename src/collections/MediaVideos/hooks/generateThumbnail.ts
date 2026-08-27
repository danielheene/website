import type { CollectionAfterChangeHook } from 'payload'

import { QueueSlug, TaskSlug } from '@/types/jobs-queue'
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
    await req.payload.jobs.queue({
      task: TaskSlug.GenerateVideoThumbnails,
      queue: QueueSlug.Default,
      input: {
        videoId: doc.id,
      },
    })
  }

  return doc
}
