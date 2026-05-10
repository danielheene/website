import type { Data, File, TaskConfig } from 'payload'
import { PDFParse, type Screenshot } from 'pdf-parse'

import { isMediaImage } from '@/lib/typeGuards'
import { CollectionSlug } from '@/types/collections'
import type { MediaDocument, MediaImage } from '@/types/payload'

export const generateDocumentThumbnailTask: TaskConfig<'generateDocumentThumbnailTask'> =
  {
    slug: 'generateDocumentThumbnailTask',
    label: 'Generate Document Thumbnail',
    retries: 3,
    concurrency: {
      key: ({ input }) => `generate:document:thumbnail:${input.documentId}`,
      exclusive: true,
      supersedes: true,
    },
    inputSchema: [
      {
        name: 'documentId',
        type: 'text',
        required: true,
      },
    ],
    handler: async ({ input: { documentId }, req }) => {
      'use server'

      console.log('Generating thumbnail for document:', documentId)

      let document: MediaDocument
      let documentThumbnail: MediaImage
      let previousThumbnail: MediaImage | null = null
      let thumbnailScreenshot: Screenshot

      try {
        document = await req.payload.findByID({
          collection: CollectionSlug.MediaDocuments,
          id: documentId,
          showHiddenFields: true,
        })
      } catch (error) {
        console.error('Error fetching document:', error)
        throw new Error('Failed to fetch document')
      }

      try {
        const parser = new PDFParse({
          url: document.url,
        })
        const {
          pages: [screenshot],
        } = await parser.getScreenshot({
          first: 1,
        })
        thumbnailScreenshot = screenshot
      } catch (error) {
        console.error('Error generating thumbnail screenshot:', error)
        throw new Error('Failed to generate thumbnail screenshot')
      }

      try {
        const filename = document?.filename?.replace(/(\.pdf)$/, '.png')

        if (isMediaImage(document?.thumbnail)) {
          previousThumbnail = document.thumbnail
        } else if (
          typeof document.thumbnail === 'string' &&
          document.thumbnail !== ''
        ) {
          previousThumbnail = await req.payload.findByID({
            collection: CollectionSlug.MediaImages,
            id: document.thumbnail,
          })
        }

        const data: Data = {
          // filename,
          width: thumbnailScreenshot.width,
          height: thumbnailScreenshot.height,
          ...(previousThumbnail
            ? {
                alt: previousThumbnail.alt,
                credits: previousThumbnail.credits,
                createdAt: previousThumbnail.createdAt,
                focalX: previousThumbnail.focalX,
                focalY: previousThumbnail.focalY,
              }
            : {}),
        }

        const file: File = {
          data: Buffer.from(thumbnailScreenshot.data),
          name: filename,
          mimetype: 'image/png',
          size: Buffer.byteLength(thumbnailScreenshot.data),
        }

        if (previousThumbnail) {
          console.info(
            `thumbnail for document "${document.filename}" already exists, updating it`,
          )
          documentThumbnail = await req.payload.update({
            collection: CollectionSlug.MediaImages,
            id: previousThumbnail.id,
            data,
            file,
            context: {
              skipGenerateAlt: true,
            },
            overwriteExistingFiles: true,
          })
          console.info(`updated thumbnail for document "${document.filename}"`)
        } else {
          console.info(
            `thumbnail for document "${document.filename}" does not exist, creating it`,
          )
          documentThumbnail = await req.payload.create({
            collection: CollectionSlug.MediaImages,
            data,
            file,
          })
          console.info(`created thumbnail for document "${document.filename}"`)
        }

        console.info(
          `updating document "${document.filename}" with thumbnail id "${documentThumbnail.id}"`,
        )
        await req.payload.update({
          collection: CollectionSlug.MediaDocuments,
          id: documentId,
          data: {
            thumbnail: documentThumbnail,
            // thumbnailURL: documentThumbnail.thumbnailURL,
            // blurDataURL: documentThumbnail.blurDataURL,
          },
          context: {
            skipGenerateDocumentThumbnail: true,
          },
        })

        console.info(
          `updated document "${document.filename}" with thumbnail id "${documentThumbnail.id}" successfully`,
        )
      } catch (error) {
        console.error('Error generating thumbnail:', error)
        throw error
      }

      return {
        output: {},
      }
    },
  }

export default generateDocumentThumbnailTask
