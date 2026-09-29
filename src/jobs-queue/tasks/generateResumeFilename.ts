import { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

export const generateResumeFilename: TaskConfig<TaskSlug['GenerateResumeFilename']> = {
  slug: TaskSlug.GenerateResumeFilename,
  label: 'Generate Resume Filename',
  retries: 3,
  inputSchema: [
    {
      type: 'text',
      name: 'filenameTemplate',
      required: true,
    },
    {
      type: 'text',
      name: 'customId',
      required: true,
    },
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
  ],
  outputSchema: [
    {
      type: 'text',
      name: 'filename',
      required: true,
    },
  ],
  handler: handlerPath('generateResumeFilename.ts'),
}
