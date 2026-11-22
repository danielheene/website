import type { TaskConfig } from 'payload'

import {
  documentTaskConcurrency,
  documentTaskInputSchema,
} from '@/jobs-queue/lib/documentTaskConfig'
import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

export const generateDocumentThumbnails: TaskConfig<TaskSlug['GenerateDocumentThumbnails']> = {
  slug: TaskSlug.GenerateDocumentThumbnails,
  label: 'Generate Document Thumbnails',
  retries: 3,
  concurrency: documentTaskConcurrency(TaskSlug.GenerateDocumentThumbnails),
  inputSchema: [
    ...documentTaskInputSchema(TaskSlug.GenerateDocumentThumbnails),
    // the résumé workflow renders every page; uploads only need the first
    {
      name: 'maxThumbnails',
      type: 'number',
      defaultValue: 1,
    },
  ],
  outputSchema: [
    {
      name: 'thumbnailIDs',
      type: 'text',
      hasMany: true,
    },
  ],
  handler: handlerPath('generateDocumentThumbnails.ts'),
}
