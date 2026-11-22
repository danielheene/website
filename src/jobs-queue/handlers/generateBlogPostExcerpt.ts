import type { TaskHandler } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { loadLatestDocument, latestWriteOptions } from '@/jobs-queue/lib/documentTaskHandler'
import { fetchAnthropicExcerpt } from '@/lib/anthropic/fetchExcerpt'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * Has Claude write a post's excerpt from its content, replacing the current one. The hook only
 * queues it for a post published without an excerpt; the edit view's menu runs it on request.
 */
const run: TaskHandler<TaskSlug['GenerateBlogPostExcerpt']> = async ({ input, req }) => {
  const { payload } = req
  const post = await loadLatestDocument(payload, CollectionSlug.BlogPosts, input.id)

  const skip = (reason: string) => {
    payload.logger.info(`Skipped excerpt for blog post ${input.id}: ${reason}`)

    return { output: { generated: false } }
  }

  if (!post) return skip('it no longer exists')

  // SAFETY: `content` is a Lexical rich-text field
  const content = post.content as SerializedEditorState | undefined

  if (isEmptyValue(content)) return skip('it has no content')

  const excerpt = await fetchAnthropicExcerpt(content)

  if (!excerpt || isEmptyValue(excerpt)) return skip('no excerpt was generated')

  // SAFETY: the excerpt is the same Lexical editor state the field stores
  await payload.update({
    ...latestWriteOptions(
      payload,
      TaskSlug.GenerateBlogPostExcerpt,
      CollectionSlug.BlogPosts,
      post,
    ),
    collection: CollectionSlug.BlogPosts,
    data: {
      excerpt: excerpt as typeof post.excerpt,
    },
  })

  payload.logger.info(`Generated excerpt for blog post ${input.id}`)

  return { output: { generated: true } }
}

export const handler = run
