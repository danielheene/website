import React from 'react'
import { TaskConfig } from 'payload'
import { CollectionSlug } from '@custom-types'
import { logger } from '@/lib/otel/logger'
import { MediaDocument } from '@payload-types'

/**
 * Creates or updates a document file in the MediaDocuments collection
 */
export const createOrUpdateResumeDocumentFileTask: TaskConfig<'createOrUpdateResumeDocumentFileTask'> = {
  slug: 'createOrUpdateResumeDocumentFileTask',
  label: 'Create or update document file',
  retries: 3,
  inputSchema: [
    { name: 'filename', required: true, type: 'text' },
    { name: 'b64File', required: true, type: 'text' },
    { name: 'imageID', required: true, type: 'text' },
    { name: 'locale', required: true, type: 'text' },
  ],
  outputSchema: [
    { name: 'fileID', type: 'text' },
  ],
  handler: async ({ input, req, job }) => {
    'use server'

    const { filename, b64File, imageID } = input
    const locale = input.locale === 'de' ? 'de' : 'en'
    const fileBuffer = Buffer.from(b64File, 'base64')

    const data = {
      filename: `${filename}.pdf`,
      thumbnail: imageID,
      slug: `resume:${locale}`,
    }

    const file = {
      data: fileBuffer,
      name: `${filename}.pdf`,
      mimetype: 'application/pdf',
      size: fileBuffer.byteLength,
    }

    try {
      logger.info('Creating or updating document file', { locale })
      let document: MediaDocument

      logger.info('Checking for existing document file', { locale })
      const { docs: [existingDoc] } = await req.payload.find({
        collection: CollectionSlug.MediaDocuments,
        depth: 10,
        limit: 1,
        pagination: false,
        locale,
        where: {
          slug: { equals: `resume:${locale}` },
        },
      })

      if (existingDoc) {
        logger.info('Existing document file found', { locale })
        document = await req.payload.update({
          collection: CollectionSlug.MediaDocuments,
          id: existingDoc.id,
          data,
          file,
          overwriteExistingFiles: true,
        })
        logger.info('Document file updated successfully', { locale })
      } else {
        logger.info('No existing document file found, creating new one', { locale })
        document = await req.payload.create({
          collection: 'documents',
          data,
          file,
        })
        logger.info('New document file created successfully', { locale })
      }

      return {
        output: {
          fileID: document.id,
        },
      }
    } catch (error) {
      logger.error('Error creating or updating document file:', error)
      throw error
    }
  },
}

export default createOrUpdateResumeDocumentFileTask
