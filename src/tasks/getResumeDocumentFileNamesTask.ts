import { TaskConfig } from 'payload'
import { generateUniqueResumeDocumentName } from '@/lib/generateUniqueResumeDocumentName'

export const getResumeDocumentFileNamesTask: TaskConfig<'getResumeDocumentFileNamesTask'> = {
  slug: 'getResumeDocumentFileNamesTask',
  label: '2Get unique file names for each document version and a general name for the document entry',
  retries: 3,
  inputSchema: [
    {
      name: 'authorName',
      type: 'text',
      required: true,
    },
    {
      name: 'locale',
      type: 'text',
      required: true,
    },
    {
      name: 'id',
      type: 'text',
      required: true,
    },
  ],
  outputSchema: [
    {
      name: 'filename',
      type: 'text',
    },
  ],
  handler: async ({ input: { id, authorName, locale } }) => {
    'use server'

    try {
      const filename = generateUniqueResumeDocumentName(authorName, locale, id)
      return { output: { filename } }
    } catch (error) {
      console.error('Error generating file names:', error)
      throw error
    }
  },
}

export default getResumeDocumentFileNamesTask

