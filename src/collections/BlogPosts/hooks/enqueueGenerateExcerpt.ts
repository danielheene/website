import type { CollectionAfterChangeHook } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'
import type { BlogPostData } from '@/types/payload'

/**
 * Excerpts are written by hand. A post published without one gets an excerpt
 * from Claude through the `generateBlogPostExcerpt` task, which runs on the
 * worker so the publish request never waits on the API.
 *
 * Every published save with an empty excerpt queues it, so a failed run is
 * retried by the next publish. Draft saves, trashed posts and posts without
 * content are left alone.
 */
export const enqueueGenerateExcerpt: CollectionAfterChangeHook<BlogPostData> = async ({
  doc,
  req,
}) => {
  if (doc._status !== 'published' || doc.deletedAt) return doc
  if (!isEmptyValue(doc.excerpt as SerializedEditorState | undefined)) return doc
  if (isEmptyValue(doc.content as SerializedEditorState | undefined)) return doc

  await req.payload.jobs.queue({
    task: TaskSlug.GenerateBlogPostExcerpt,
    input: {
      postId: String(doc.id),
    },
    queue: QueueSlug.HookHandler,
  })

  return doc
}
