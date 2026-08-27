import { TaskConfig } from 'payload'

import { renderTemplate } from '@/lib/renderTemplate'
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
      name: 'sharedId',
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
  handler: async ({ input, req: { payload } }) => {
    'use server'

    const { filenameTemplate, sharedId, locale } = input

    payload.logger.info(`Generating resume filename for locale: ${locale}`)

    const { result, error } = await renderTemplate({
      template: filenameTemplate,
      data: {
        nanoid: sharedId,
      },
      locale,
    })

    if (error) {
      throw new Error(error)
    }

    payload.logger.info(`Generated resume filename: ${result}`)

    return {
      output: {
        filename: result,
      },
    }
  },
}
