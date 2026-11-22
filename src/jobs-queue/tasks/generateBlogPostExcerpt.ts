import type { TaskConfig } from 'payload'

import {
  documentTaskConcurrency,
  documentTaskInputSchema,
} from '@/jobs-queue/lib/documentTaskConfig'
import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

/** Has Claude write a post's excerpt; queued when a post is published without one. */
export const generateBlogPostExcerpt: TaskConfig<TaskSlug['GenerateBlogPostExcerpt']> = {
  slug: TaskSlug.GenerateBlogPostExcerpt,
  label: 'Generate Blog Post Excerpt',
  retries: 2,
  concurrency: documentTaskConcurrency(TaskSlug.GenerateBlogPostExcerpt),
  inputSchema: documentTaskInputSchema(TaskSlug.GenerateBlogPostExcerpt),
  outputSchema: [
    {
      name: 'generated',
      type: 'checkbox',
    },
  ],
  handler: handlerPath('generateBlogPostExcerpt.ts'),
}
