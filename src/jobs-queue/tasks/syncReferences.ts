import type { TaskConfig } from 'payload'

import {
  documentTaskConcurrency,
  documentTaskInputSchema,
} from '@/jobs-queue/lib/documentTaskConfig'
import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

/** Rewrites one document's rows in the reference index, or clears them once it is deleted. */
export const syncReferences: TaskConfig<TaskSlug['SyncReferences']> = {
  slug: TaskSlug.SyncReferences,
  label: 'Sync References',
  retries: 2,
  concurrency: documentTaskConcurrency(TaskSlug.SyncReferences),
  inputSchema: documentTaskInputSchema(TaskSlug.SyncReferences),
  outputSchema: [
    {
      name: 'references',
      type: 'number',
    },
  ],
  handler: handlerPath('syncReferences.ts'),
}
