import type { TaskConfig } from 'payload'

import {
  documentTaskConcurrency,
  documentTaskInputSchema,
} from '@/jobs-queue/lib/documentTaskConfig'
import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

/** Word count and reading time of a post, queued when its content changes. */
export const calculateReadingTime: TaskConfig<TaskSlug['CalculateReadingTime']> = {
  slug: TaskSlug.CalculateReadingTime,
  label: 'Calculate Reading Time',
  retries: 2,
  concurrency: documentTaskConcurrency(TaskSlug.CalculateReadingTime),
  inputSchema: documentTaskInputSchema(TaskSlug.CalculateReadingTime),
  outputSchema: [
    {
      name: 'updated',
      type: 'checkbox',
    },
  ],
  handler: handlerPath('calculateReadingTime.ts'),
}
