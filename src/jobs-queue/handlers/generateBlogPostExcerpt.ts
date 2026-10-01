import type { TaskHandler } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { fetchAnthropicExcerpt } from '@/lib/anthropic/fetchExcerpt'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * Has Claude write the excerpt of a post that was published without one (see
 * `enqueueGenerateExcerpt`).
 *
 * Everything is re-checked against the latest version, as the post may have
 * changed since the job was queued: a hand-written excerpt is never replaced,
 * and when a newer unpublished draft exists the job leaves the post alone,
 * since publishing the excerpt would publish that draft with it. The next
 * publish without an excerpt queues the job again.
 */
const run: TaskHandler<TaskSlug['GenerateBlogPostExcerpt']> = async ({
  input: { postId },
  req,
}) => {
  const { payload } = req

  const post = await payload.findByID({
    collection: CollectionSlug.BlogPosts,
    id: postId,
    draft: true,
    depth: 0,
    select: {
      content: true,
      excerpt: true,
      _status: true,
    },
  })

  const skip = (reason: string) => {
    payload.logger.info(`Skipped excerpt for blog post ${postId}: ${reason}`)

    return {
      output: {
        generated: false,
      },
    }
  }

  if (post._status !== 'published') return skip('latest version is not published')
  if (!isEmptyValue(post.excerpt as SerializedEditorState | undefined)) {
    return skip('it already has an excerpt')
  }

  const content = post.content as SerializedEditorState | undefined
  if (isEmptyValue(content)) return skip('it has no content')

  const excerpt = await fetchAnthropicExcerpt(content)
  if (!excerpt || isEmptyValue(excerpt)) return skip('no excerpt was generated')

  await payload.update({
    collection: CollectionSlug.BlogPosts,
    id: postId,
    draft: false,
    data: {
      excerpt: excerpt as typeof post.excerpt,
    },
  })

  payload.logger.info(`Generated excerpt for blog post ${postId}`)

  return {
    output: {
      generated: true,
    },
  }
}

export const handler = wrapHandler(TaskSlug.GenerateBlogPostExcerpt, run)
