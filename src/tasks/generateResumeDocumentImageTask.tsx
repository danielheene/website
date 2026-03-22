import { TaskConfig } from 'payload'
import { PDFParse } from 'pdf-parse'
import { logger } from '@/lib/otel/logger'

export const generateResumeDocumentImageTask: TaskConfig<'generateResumeDocumentImageTask'> = {
  slug: 'generateResumeDocumentImageTask',
  label: 'Generate Resume Document Image',
  retries: 3,
  inputSchema: [
    {
      name: 'b64File',
      type: 'text',
    },
  ],
  outputSchema: [
    {
      name: 'b64Image',
      type: 'text',
    },
    {
      name: 'height',
      type: 'number',
    },
    {
      name: 'width',
      type: 'number',
    },
  ],
  handler: async ({ job, input: { b64File } }) => {
    'use server'

    try {
      logger.info('Generating resume document image')
      const parser = new PDFParse({ data: Buffer.from(b64File, 'base64') })
      const result = await parser.getScreenshot({ first: 1 })
      const { data, height, width } = result.pages[0]
      const b64Image = Buffer.from(data).toString('base64')
      logger.info('Generated resume document image')
      return { output: { b64Image, height, width } }
    } catch (error) {
      logger.error('Error generating resume document image:', error)
      throw error
    }
  },
}

export default generateResumeDocumentImageTask
