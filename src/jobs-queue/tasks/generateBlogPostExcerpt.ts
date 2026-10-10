import type { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

export const generateBlogPostExcerpt: TaskConfig<TaskSlug['GenerateBlogPostExcerpt']> = {
  slug: TaskSlug.GenerateBlogPostExcerpt,
  label: 'Generate Blog Post Excerpt',
  retries: 2,
  concurrency: {
    key: ({ input: { postId } }) => `${TaskSlug.GenerateBlogPostExcerpt}:${postId}`,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'postId',
      type: 'text',
      required: true,
    },
  ],
  outputSchema: [
    {
      name: 'generated',
      type: 'checkbox',
    },
  ],
  handler: handlerPath('generateBlogPostExcerpt.ts'),
}
