import { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

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
