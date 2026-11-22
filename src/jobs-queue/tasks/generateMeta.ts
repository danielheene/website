import type { TaskConfig } from 'payload'

import {
  documentTaskConcurrency,
  documentTaskInputSchema,
} from '@/jobs-queue/lib/documentTaskConfig'
import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

/** Meta title and/or Claude meta description of a page, post or topic (`DOCUMENT_TASK_DEFINITIONS`). */
export const generateMeta: TaskConfig<TaskSlug['GenerateMeta']> = {
  slug: TaskSlug.GenerateMeta,
  label: 'Generate Meta Data',
  retries: 2,
  concurrency: documentTaskConcurrency(TaskSlug.GenerateMeta),
  inputSchema: documentTaskInputSchema(TaskSlug.GenerateMeta),
  outputSchema: [
    {
      name: 'updated',
      type: 'checkbox',
    },
  ],
  handler: handlerPath('generateMeta.ts'),
}
