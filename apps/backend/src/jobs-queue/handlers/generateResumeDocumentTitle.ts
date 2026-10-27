import type { TaskHandler } from 'payload'

import { TaskSlug } from '@website/types/jobs-queue'

import { renderTemplate } from '@/lib/renderTemplate'

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
