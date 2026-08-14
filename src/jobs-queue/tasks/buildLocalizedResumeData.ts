import { TaskConfig } from 'payload'

import z from 'zod'

import { generateContentURL } from '@/lib/generateContentURL'
import { buildResumeDocumentData } from '@/pdf/lib/buildResumeDocumentData'
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
  handler: async ({ input, req: { payload } }) => {
    'use server'

    const { locale, filename, createdAt, documentSlug } = input

    payload.logger.info(`Building resume document data for locale: ${locale}`)

    const { data, success, error } = await buildResumeDocumentData({
      locale,
      creationDate: new Date(createdAt),
      fileName: filename,
      fileUrl: generateContentURL({
        path: `/resume/${documentSlug}`,
      }),
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
  },
}
