import { TaskConfig } from 'payload'
import { CollectionSlug } from '@custom-types'
import { MediaImage } from '@payload-types'
import { logger } from '@/lib/otel/logger'

export const createOrUpdateResumeDocumentImageTask: TaskConfig<'createOrUpdateResumeDocumentImageTask'> = {
  slug: 'createOrUpdateResumeDocumentImageTask',
  label: 'Create or update document image',
  retries: 3,
  inputSchema: [
    { name: 'filename', required: true, type: 'text' },
    { name: 'b64Image', required: true, type: 'text' },
    { name: 'width', required: true, type: 'number' },
    { name: 'height', required: true, type: 'number' },
    { name: 'locale', required: true, type: 'text' },
  ],
  outputSchema: [
    { name: 'imageID', type: 'text' },
  ],
  handler: async ({ input, req, job }) => {
    'use server'

    const { filename, b64Image, width, height } = input
    const locale = input.locale === 'de' ? 'de' : 'en'
    const imageBuffer = Buffer.from(b64Image, 'base64')

    const data = {
      filename: `${filename}.png`,
      width,
      height,
      slug: `resume:${locale}`,
    }

    const file = {
      data: imageBuffer,
      name: `${filename}.png`,
      mimetype: 'image/png',
      size: imageBuffer.byteLength,
    }

    try {
      logger.info('Creating or updating document image', { locale })
      let image: MediaImage

      logger.info('Checking for existing document image', { locale })
      const { docs: existingDoc } = await req.payload.find({
        collection: CollectionSlug.MediaImages,
        depth: 10,
        limit: 1,
        pagination: false,
        locale,
        where: {
          slug: { equals: `resume:${locale}` },
        },
      })

      if (existingDoc && existingDoc.length > 0) {
        logger.info('Existing document image found', { locale })
        image = await req.payload.update({
          collection: CollectionSlug.MediaImages,
          id: existingDoc[0].id,
          data,
          file,
          overwriteExistingFiles: true,
        })
        logger.info('Document image updated', { locale })
      } else {
        logger.info('No existing document image found, creating new one', { locale })
        image = await req.payload.create({
          collection: CollectionSlug.MediaImages,
          data,
          file,
        })
        logger.info('New document image created successfully', { locale })
      }

      return {
        output: {
          imageID: image.id,
        },
      }
    } catch (error) {
      logger.error('Error creating or updating document file:', error)
      throw error
    }
  },
}

export default createOrUpdateResumeDocumentImageTask
