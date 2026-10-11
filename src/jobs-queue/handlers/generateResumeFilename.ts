import type { TaskHandler } from 'payload'

import { renderTemplate } from '@/lib/renderTemplate'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['GenerateResumeFilename']> = async ({
  input,
  req: { payload },
}) => {
  const { filenameTemplate, customId, locale } = input

  payload.logger.info(`Generating resume filename for locale: ${locale}`)

  const { result, error } = await renderTemplate({
    template: filenameTemplate,
    data: {
      customId,
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
}

export const handler = run
