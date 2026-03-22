import React from 'react'
import { WorkflowConfig } from 'payload'
import { ResumeDocumentData } from '@custom-types'
import { customAlphabet } from 'nanoid'
import { logger } from '@/lib/otel/logger'

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 5)

export const generateResumeDocumentWorkflow: WorkflowConfig<'generateResumeDocumentWorkflow'> = {
  slug: 'generateResumeDocumentWorkflow',
  label: 'Generate Resume Document',
  retries: 3,
  queue: 'default',
  concurrency: {
    key: ({ input }) => `generate:resume:${input.locale}`,
    exclusive: true,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'locale',
      required: true,
      type: 'text',
      defaultValue: 'en',
    },
  ],
  handler: async ({ req, job, tasks }) => {
    const id = nanoid()
    const locale = job.input.locale === 'de' ? 'de' : 'en'

    /**
     * Fetch resume document data from collections and globals
     */
    const data = await tasks.getResumeDocumentDataTask('step:1', {
      input: {
        locale,
      },
    }) as unknown as ResumeDocumentData

    /**
     * Generate unique file names for each document version and a general name for the document entry
     */
    const { filename } = await tasks.getResumeDocumentFileNamesTask('step:2', {
        input: {
          id,
          locale,
          authorName: data.userMetaData?.name,
        },
      },
    )

    /**
     * Generate the resume document file get its base64 representation
     */
    const { b64File } = await tasks.generateResumeDocumentFileTask('step:3', {
      input: {
        locale,
        data,
      },
    })

    /**
     * Generate the resume document image and get its base64 representation
     */
    const { b64Image, height, width } = await tasks.generateResumeDocumentImageTask('step:4', {
      input: {
        b64File,
      },
    })


    const { imageID } = await tasks.createOrUpdateResumeDocumentImageTask('step:5', {
      input: {
        filename,
        b64Image,
        locale,
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

export default generateResumeDocumentWorkflow
