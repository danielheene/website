import type { TaskConfig } from 'payload'

import {
  documentTaskConcurrency,
  documentTaskInputSchema,
} from '@/jobs-queue/lib/documentTaskConfig'
import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

/** Clears the frontend cache tags and paths that show one document. */
export const revalidateDocument: TaskConfig<TaskSlug['RevalidateDocument']> = {
  slug: TaskSlug.RevalidateDocument,
  label: 'Revalidate Document',
  retries: 2,
  concurrency: documentTaskConcurrency(TaskSlug.RevalidateDocument),
  inputSchema: documentTaskInputSchema(TaskSlug.RevalidateDocument),
  outputSchema: [
    {
      name: 'updated',
      type: 'checkbox',
    },
  ],
  handler: handlerPath('revalidateDocument.ts'),
}
