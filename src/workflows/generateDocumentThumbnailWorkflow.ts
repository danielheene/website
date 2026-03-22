import { WorkflowConfig } from 'payload'
import { ResumeDocumentData } from '@custom-types'
import { customAlphabet } from 'nanoid'
import { logger } from '@/lib/otel/logger'

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 5)

export const generateDocumentThumbnailWorkflow: WorkflowConfig<'generateDocumentThumbnailWorkflow'> = {
  slug: 'generateDocumentThumbnailWorkflow',
  label: 'Generate Document Thumbnail',
  retries: 3,
  queue: 'default',
  concurrency: {
    key: ({ input }) => `generate:document:${input.id}`,
    exclusive: true,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'id',
      required: true,
      type: 'text',
    },
    {
      name: 'filename',
      required: true,
      type: 'text',
    },
    {
      name: 'b64File',
      required: true,
      type: 'text',
    },
  ],
  handler: async ({ req, job, tasks }) => {
    const { id, filename, b64File } = job.input


    /**
     * Generate the resume document image and get its base64 representation
     */
    const { b64Image, height, width } = await tasks.generateResumeDocumentImageTask('step:4', {
      input: { b64File },
    })


    const { imageID } = await tasks.createOrUpdateResumeDocumentImageTask('step:5', {
      input: {
        filename,
        b64Image,
        width,
        height,
      },
    })

    /**
     * Create or update the resume document file with the generated file and link it to the generated image, then get the document ID
     */
    const { fileID } = await tasks.createOrUpdateResumeDocumentFileTask('step:6', {
      input: {
        filename,
        b64File,
        locale,
        imageID,
      },
    })

    logger.info('Resume document workflow completed successfully')
  },
}

export default generateDocumentThumbnailWorkflow
