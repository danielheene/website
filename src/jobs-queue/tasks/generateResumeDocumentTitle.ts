import { TaskConfig } from 'payload'

import { renderTemplate } from '@/lib/renderTemplate'
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
      name: 'sharedId',
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
  handler: async ({ input, req: { payload } }) => {
    'use server'

    const { documentTitleTemplate, sharedId } = input

    payload.logger.info('Generating document title')

    const { result, error } = await renderTemplate({
      template: documentTitleTemplate,
      data: {
        nanoid: sharedId,
      },
      locale: 'en',
    })

    if (error) {
      throw new Error(error)
    }

    payload.logger.info(`Successfully generated document title: ${result}`)

    return {
      output: {
        documentTitle: result,
      },
    }
  },
}
