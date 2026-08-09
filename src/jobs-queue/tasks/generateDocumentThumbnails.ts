import type { TaskConfig } from 'payload'

import { isString } from 'lodash-es'
import { PDFParse } from 'pdf-parse'

import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'
import { MediaDocument } from '@/types/payload'

export const generateDocumentThumbnails: TaskConfig<TaskSlug['GenerateDocumentThumbnails']> = {
  slug: TaskSlug.GenerateDocumentThumbnails,
  label: 'Generate Document Thumbnails',
  retries: 3,
  concurrency: {
    key: ({ input }) => `${TaskSlug.GenerateDocumentThumbnails}:${input.documentId}`,
    exclusive: true,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'documentId',
      type: 'text',
      required: true,
    },
    {
      name: 'maxThumbnails',
      type: 'number',
      defaultValue: 1,
    },
  ],
  outputSchema: [
    {
      name: 'thumbnailIDs',
      type: 'text',
      hasMany: true,
    },
  ],
  handler: async ({ input: { documentId, maxThumbnails }, req: { payload } }) => {
    'use server'

    console.log('Generating thumbnail for document:', documentId)

    const document = await payload.findByID({
      collection: CollectionSlug.MediaDocuments,
      id: documentId,
      showHiddenFields: true,
      select: {
        id: true,
        url: true,
        thumbnails: true,
        filename: true,
      },
    })

    const parser = new PDFParse({
      url: document.url,
    })

    const { pages: thumbnails } = await parser.getScreenshot({
      first: maxThumbnails,
    })

    /* when creating thumbnails was successful, delete old ones */
    if (Array.isArray(document.thumbnails) && document.thumbnails.length > 0) {
      for (const { relationTo, value } of document.thumbnails) {
        await payload.delete({
          collection: relationTo,
          id: isString(value) ? value : value.id,
        })
      }
    }

    const generatorFlags = [
      '+auto-generated',
      '+document-thumbnail',
      '+thumbnail',
    ] as MediaDocument['generatorFlags']
    const filenameBase = document?.filename?.replace(/\.[^/.]+$/, '')
    if (filenameBase.toLowerCase().includes('resume')) generatorFlags.push('+resume-asset')

    /* create image documents from new thumbnails */
    const ids: string[] = []
    let index = 0
    for (const thumbnail of thumbnails) {
      const { id } = await payload.create({
        collection: CollectionSlug.MediaImages,
        data: {
          width: thumbnail.width,
          height: thumbnail.height,
          generatorFlags,
        },
        file: {
          data: Buffer.from(thumbnail.data),
          name: `${filenameBase}-${++index}.png`,
          mimetype: 'image/png',
          size: Buffer.byteLength(thumbnail.data),
        },
      })
      ids.push(id)
    }

    /* update document with new thumbnails */
    await payload.update({
      collection: CollectionSlug.MediaDocuments,
      id: documentId,
      data: {
        thumbnails: ids.map((id) => ({
          relationTo: CollectionSlug.MediaImages,
          value: id,
        })),
      },
      context: {
        skipGenerateDocumentThumbnails: true,
      },
    })

    return {
      output: {
        thumbnailIDs: ids,
      },
    }
  },
}
