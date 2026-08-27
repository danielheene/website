import { TaskConfig } from 'payload'

import { generateSlug } from '@/lib/generateSlug'
import { TaskSlug } from '@/types/jobs-queue'

export const generateResumeDocumentSlug: TaskConfig<TaskSlug['GenerateResumeDocumentSlug']> = {
  slug: TaskSlug.GenerateResumeDocumentSlug,
  label: 'Generate Resume Document Slug',
  retries: 3,
  inputSchema: [
    {
      type: 'text',
      name: 'documentTitle',
      required: true,
    },
  ],
  outputSchema: [
    {
      type: 'text',
      name: 'documentSlug',
      required: true,
    },
  ],
  handler: async ({ input, req: { payload } }) => {
    'use server'

    const { documentTitle } = input

    payload.logger.info('Generating document slug')

    const documentSlug = generateSlug(documentTitle)

    payload.logger.info(`Successfully generated document slug: ${documentSlug}`)

    return {
      output: {
        documentSlug,
      },
    }
  },
}
