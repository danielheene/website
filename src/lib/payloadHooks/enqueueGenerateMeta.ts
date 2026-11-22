import type { CollectionAfterChangeHook } from 'payload'

import { isTriggeredByTask } from '@/lib/documentTasks/context'
import { enqueueDocumentTask } from '@/lib/documentTasks/enqueueDocumentTask'
import { extractDocumentText } from '@/lib/extractDocumentText'
import { TaskSlug } from '@/types/jobs-queue'

type WithMeta = {
  id: string | number
  slug?: string | null
  title?: string | null
  _status?: 'draft' | 'published' | null
  meta?: {
    title?: string | null
    description?: string | null
  } | null
}

/**
 * Queues `generateMeta` after a save:
 * - the title on every save of a document with a title, so it follows the title and template;
 * - the description once the document is published and either has none yet or its text (the
 *   titles and rich text Claude describes) changed since the previous version.
 */
export const enqueueGenerateMeta =
  (collection: string): CollectionAfterChangeHook<WithMeta> =>
  async ({ context, doc, previousDoc, req }) => {
    if (isTriggeredByTask(context, TaskSlug.GenerateMeta)) return doc

    const steps: string[] = []

    if (doc.title) steps.push('title')

    if (
      doc._status === 'published' &&
      (!doc.meta?.description || extractDocumentText(doc) !== extractDocumentText(previousDoc))
    ) {
      steps.push('description')
    }

    if (steps.length > 0) {
      await enqueueDocumentTask({
        payload: req.payload,
        task: TaskSlug.GenerateMeta,
        collection,
        doc,
        steps,
      })
    }

    return doc
  }
