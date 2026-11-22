import type { CollectionAfterChangeHook } from 'payload'

import { isTriggeredByTask } from '@/lib/documentTasks/context'
import { enqueueDocumentTask } from '@/lib/documentTasks/enqueueDocumentTask'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'
import type { MediaImage } from '@/types/payload'

/**
 * Queues the blur placeholder and alt text once a new file is stored; Payload already built the
 * sizes during the upload. `context.skipGenerateAlt` (the seeds) leaves the alt text out.
 */
export const enqueueProcessImage: CollectionAfterChangeHook<MediaImage> = async ({
  context,
  doc,
  previousDoc,
  req,
}) => {
  if (isTriggeredByTask(context, TaskSlug.ProcessImage)) return doc

  if (doc.checksum === previousDoc?.checksum) return doc

  await enqueueDocumentTask({
    payload: req.payload,
    task: TaskSlug.ProcessImage,
    collection: CollectionSlug.MediaImages,
    doc,
    steps: context.skipGenerateAlt ? ['blur'] : ['blur', 'alt'],
  })

  return doc
}
