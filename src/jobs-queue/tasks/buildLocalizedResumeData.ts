import { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

export const buildLocalizedResumeData: TaskConfig<TaskSlug['BuildLocalizedResumeData']> = {
  slug: TaskSlug.BuildLocalizedResumeData,
  label: 'Build Localized Resume Data',
  retries: 3,
  inputSchema: [
    {
      type: 'text',
      name: 'locale',
      required: true,
      typescriptSchema: [
        () => ({
          type: 'string',
          enum: [
            'en',
            'de',
          ],
          required: true,
        }),
      ],
    },
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
      type: 'text',
      name: 'documentSlug',
      required: true,
    },
  ],
  outputSchema: [
    {
      type: 'json',
      name: 'resumeDocumentData',
      required: true,
    },
  ],
  handler: handlerPath('buildLocalizedResumeData.ts'),
}
