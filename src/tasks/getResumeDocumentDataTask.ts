import { TaskConfig } from 'payload'
import { getResumeDocumentData } from '@/lib/getResumeDocumentData'
import { logger } from '@/lib/otel/logger'

/**
 * Fetches resume document data from collections and globals
 */
export const getResumeDocumentDataTask: TaskConfig<'getResumeDocumentDataTask'> = {
  slug: 'getResumeDocumentDataTask',
  label: 'Fetches resume document data from collections and globals',
  retries: 3,
  inputSchema: [
    {
      name: 'locale',
      type: 'text',
      required: true,
    },
  ],
  outputSchema: [
    {
      name: 'locale',
      type: 'text',
    },
    {
      name: 'userMetaData',
      type: 'json',
    },
    {
      name: 'aboutMe',
      type: 'json',
    },
    {
      name: 'contact',
      type: 'json',
    },
    {
      name: 'customers',
      type: 'json',
    },
    {
      name: 'downloads',
      type: 'json',
    },
    {
      name: 'experience',
      type: 'json',
    },
    {
      name: 'projects',
      type: 'json',
    },
  ],
  handler: async ({ input: { locale }, job }) => {
    'use server'

    try {
      logger.info(`Fetching resume document data for locale: ${locale}`, { locale })
      const data = await getResumeDocumentData(locale as 'en' | 'de') as Record<string, any>
      logger.info(`Fetched resume document data for locale: ${locale}`, { locale })
      return { output: { ...data } }
    } catch (error) {
      logger.error(`Failed to fetch cached resume document data for locale: ${locale}`, error, { locale })
      throw error
    }
  },
}

export default getResumeDocumentDataTask
