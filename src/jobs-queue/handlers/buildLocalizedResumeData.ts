import type { TaskHandler } from 'payload'

import z from 'zod'

import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { generateResumeDocumentRedirectURL } from '@/lib/generateResumeDocumentRedirectURL'
import { buildResumeDocumentData } from '@/pdf/lib/buildResumeDocumentData'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['BuildLocalizedResumeData']> = async ({
  input,
  req: { payload },
}) => {
  const { locale, createdAt, documentSlug } = input

  payload.logger.info(`Building resume document data for locale: ${locale}`)

  const { data, success, error } = await buildResumeDocumentData({
    locale,
    creationDate: new Date(createdAt),
    documentUrl: generateResumeDocumentRedirectURL(documentSlug),
  })

  if (!success) {
    throw new Error(z.prettifyError(error))
  }

  payload.logger.info(`Built resume document data for locale: ${locale}`)

  return {
    output: {
      resumeDocumentData: data,
    },
  }
}

export const handler = wrapHandler(TaskSlug.BuildLocalizedResumeData, run)
