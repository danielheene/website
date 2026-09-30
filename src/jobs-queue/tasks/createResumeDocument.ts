import { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

export const createResumeDocument: TaskConfig<TaskSlug['CreateResumeDocument']> = {
  slug: TaskSlug.CreateResumeDocument,
  label: 'Create Resume Document',
  retries: 3,
  inputSchema: [
    {
      type: 'text',
      name: 'documentTitle',
      required: true,
    },
    {
      type: 'text',
      name: 'documentSlug',
      required: true,
    },
    {
      type: 'date',
      name: 'createdAt',
      required: true,
    },
    {
      type: 'text',
      name: 'jobId',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeFileIdEn',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeFileChecksumEn',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeThumbnailIdsEn',
      required: true,
      hasMany: true,
    },
    {
      type: 'json',
      name: 'resumeDocumentDataEn',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeFileIdDe',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeFileChecksumDe',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeThumbnailIdsDe',
      required: true,
      hasMany: true,
    },
    {
      type: 'json',
      name: 'resumeDocumentDataDe',
      required: true,
    },
  ],
  outputSchema: [
    {
      type: 'checkbox',
      name: 'success',
      required: true,
    },
  ],
  handler: handlerPath('createResumeDocument.ts'),
}
