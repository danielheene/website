import type { CollectionAfterChangeHook } from 'payload'

import { isTriggeredByTask } from '@/lib/documentTasks/context'
import { enqueueDocumentTask } from '@/lib/documentTasks/enqueueDocumentTask'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'
import type { BlogPostData } from '@/types/payload'

import { contentTextChanged } from './contentTextChanged'

/** Queues the reading time of a published post that has none yet or whose content text changed. */
export const enqueueCalculateReadingTime: CollectionAfterChangeHook<BlogPostData> = async ({
  context,
  doc,
  previousDoc,
  req,
}) => {
  if (isTriggeredByTask(context, TaskSlug.CalculateReadingTime)) return doc

  if (doc._status !== 'published' || doc.deletedAt) return doc

  const hasReadingTime = doc.readingTime !== null && doc.readingTime !== undefined

  if (hasReadingTime && !contentTextChanged(doc, previousDoc)) return doc

  await enqueueDocumentTask({
    payload: req.payload,
    task: TaskSlug.CalculateReadingTime,
    collection: CollectionSlug.BlogPosts,
    doc,
  })

  return doc
}
