import type { TaskConfig } from 'payload'

import { TaskSlug } from '@website/types/jobs-queue'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'

export const generateResumeFile: TaskConfig<TaskSlug['GenerateResumeFile']> = {
  slug: TaskSlug.GenerateResumeFile,
  label: 'Render and Upload Resume File',
  retries: 3,
  inputSchema: [
    {
      type: 'text',
      name: 'filename',
      required: true,
    },
    {
      type: 'date',
      name: 'createdAt',
      required: true,
    },
    {
      type: 'json',
      name: 'resumeDocumentData',
      required: true,
    },
  ],
  outputSchema: [
    {
      type: 'text',
      name: 'resumeFileId',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeFileChecksum',
      required: true,
    },
  ],
  handler: handlerPath('generateResumeFile.tsx'),
}
