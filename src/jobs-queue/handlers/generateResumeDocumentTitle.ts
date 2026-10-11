import type { TaskHandler } from 'payload'

import { renderTemplate } from '@/lib/renderTemplate'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['GenerateResumeDocumentTitle']> = async ({
  input,
  req: { payload },
}) => {
  const { documentTitleTemplate, customId } = input

  payload.logger.info('Generating document title')

  const { result, error } = await renderTemplate({
    template: documentTitleTemplate,
    data: {
      customId,
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
}

export const handler = run
