import type { TaskConfig } from 'payload'

import { TaskSlug } from '@website/types/jobs-queue'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'

export const generateResumeDocumentTitle: TaskConfig<TaskSlug['GenerateResumeDocumentTitle']> = {
  slug: TaskSlug.GenerateResumeDocumentTitle,
  label: 'Generate Resume Document Title',
  retries: 3,
  inputSchema: [
    {
      type: 'text',
      name: 'documentTitleTemplate',
      required: true,
    },
    {
      type: 'text',
      name: 'customId',
      required: true,
    },
  ],
  outputSchema: [
    {
      type: 'text',
      name: 'documentTitle',
      required: true,
    },
  ],
  handler: handlerPath('generateResumeDocumentTitle.ts'),
}
