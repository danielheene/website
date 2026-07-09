import type { TaskConfig } from 'payload'

import { buildResumeDocumentData } from '@pdf/lib/buildResumeDocumentData'
import { Locale } from '@/lib/i18n'
import { TaskSlug } from '@/types/queue'
import { z } from 'zod'

export const generateResumeLocalizedData: TaskConfig<TaskSlug['GenerateResumeLocalizedData']> = {
  slug: TaskSlug.GenerateResumeLocalizedData,
  concurrency: {
    key: ({ input }) => `GenerateResumeLocalizedData:${input?.locale?.toUpperCase()}`,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'locale',
      type: 'text',
      required: true,
    },
    {
      name: 'fileName',
      type: 'text',
      required: true,
    },
    {
      name: 'fileUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'creationDate',
      type: 'text',
      required: true,
    },
  ],
  outputSchema: [
    {
      name: 'data',
      type: 'json',
    },
    {
      name: 'error',
      type: 'json',
    },
  ],
  handler: async ({ input, req }) => {
    'use server'

    const { fileName, fileUrl } = input
    const creationDate = new Date(input.creationDate)
    const locale: Locale = input?.locale === 'de' ? 'de' : 'en'

    const result = await buildResumeDocumentData({
      fileName,
      fileUrl,
      creationDate,
      locale,
    })

    if(!result.success) {
      return {
        output: {
          result: null,
          error: z.prettifyError(result.error),
        },
      }
    }

    return {
      output: {
result:        result.data,
        error: null,
      },
    }
  },
}
