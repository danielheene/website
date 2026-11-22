import type { CollectionAfterChangeHook } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { isTriggeredByTask } from '@/lib/documentTasks/context'
import { enqueueDocumentTask } from '@/lib/documentTasks/enqueueDocumentTask'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'
import type { BlogPostData } from '@/types/payload'

import { contentTextChanged } from './contentTextChanged'

/** Queues the excerpt of a published post that has none yet or whose content text changed. */
export const enqueueGenerateExcerpt: CollectionAfterChangeHook<BlogPostData> = async ({
  context,
  doc,
  previousDoc,
  req,
}) => {
  if (isTriggeredByTask(context, TaskSlug.GenerateBlogPostExcerpt)) return doc

  if (doc._status !== 'published' || doc.deletedAt) return doc

  // SAFETY: `content` and `excerpt` are Lexical rich-text fields
  if (isEmptyValue(doc.content as SerializedEditorState | undefined)) return doc

  // SAFETY: as above
  const hasExcerpt = !isEmptyValue(doc.excerpt as SerializedEditorState | undefined)

  if (hasExcerpt && !contentTextChanged(doc, previousDoc)) return doc

  await enqueueDocumentTask({
    payload: req.payload,
    task: TaskSlug.GenerateBlogPostExcerpt,
    collection: CollectionSlug.BlogPosts,
    doc,
  })

  return doc
}
