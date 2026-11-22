import type { TaskHandler } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { loadLatestDocument, latestWriteOptions } from '@/jobs-queue/lib/documentTaskHandler'
import { calculateReadingTime } from '@/lib/blog/readingTime'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['CalculateReadingTime']> = async ({ input, req: { payload } }) => {
  const post = await loadLatestDocument(payload, CollectionSlug.BlogPosts, input.id)

  if (!post) return { output: { updated: false } }

  // SAFETY: `content` is a Lexical rich-text field
  const { readingTime, wordCount } = calculateReadingTime(
    post.content as SerializedEditorState | undefined,
  )

  if (post.readingTime === readingTime && post.wordCount === wordCount) {
    return { output: { updated: false } }
  }

  await payload.update({
    ...latestWriteOptions(payload, TaskSlug.CalculateReadingTime, CollectionSlug.BlogPosts, post),
    collection: CollectionSlug.BlogPosts,
    data: {
      readingTime,
      wordCount,
    },
  })

  return { output: { updated: true } }
}

export const handler = run
