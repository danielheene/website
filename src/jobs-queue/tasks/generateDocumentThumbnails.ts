import type { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

export const generateDocumentThumbnails: TaskConfig<TaskSlug['GenerateDocumentThumbnails']> = {
  slug: TaskSlug.GenerateDocumentThumbnails,
  label: 'Generate Document Thumbnails',
  retries: 3,
  concurrency: {
    key: ({ input }) => `${TaskSlug.GenerateDocumentThumbnails}:${input.documentId}`,
    exclusive: true,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'documentId',
      type: 'text',
      required: true,
    },
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
