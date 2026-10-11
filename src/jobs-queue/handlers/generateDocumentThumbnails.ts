import type { TaskHandler } from 'payload'

import { PDFParse } from 'pdf-parse'

import type { GeneratorFlag } from '@/fields/GeneratorFlags'
import {
  deleteThumbnails,
  stripExtension,
  toMediaImageRelations,
} from '@/jobs-queue/lib/thumbnails'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * Renders a PDF document's pages to thumbnail images and attaches them.
 *
 * Old thumbnails are deleted before the new ones are created: `MediaDocuments`'
 * `adminThumbnail` builds its preview URL from a fixed filename pattern, so
 * the new files must land on those exact names, not whatever
 * `getSafeFileName` renames them to if the old ones are still there. The
 * delete is best-effort so a failure there can't block regeneration.
 */
const run: TaskHandler<TaskSlug['GenerateDocumentThumbnails']> = async ({
  input: { documentId, maxThumbnails },
  req: { payload },
}) => {
  payload.logger.info(`Generating thumbnails for document: ${documentId}`)

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

  const { pages: thumbnails } = await (async () => {
    try {
      return await parser.getScreenshot({ first: maxThumbnails })
    } finally {
      await parser.destroy()
    }
  })()

  if (Array.isArray(document.thumbnails) && document.thumbnails.length > 0) {
    try {
      await deleteThumbnails(payload, document.thumbnails)
    } catch (error) {
      payload.logger.error(`Failed to delete old document thumbnails: ${error}`)
    }
  }

  const filenameBase = stripExtension(document.filename ?? String(documentId))
  const generatorFlags: GeneratorFlag[] = [
    'document-thumbnail',
    'thumbnail',
    ...(filenameBase.toLowerCase().includes('resume') ? (['resume-asset'] as const) : []),
  ]

  const ids: string[] = []
  for (const [index, thumbnail] of thumbnails.entries()) {
    const { id } = await payload.create({
      collection: CollectionSlug.MediaImages,
      data: {
        width: thumbnail.width,
        height: thumbnail.height,
        generatorFlags,
      },
      file: {
        data: Buffer.from(thumbnail.data),
        name: `${filenameBase}-${index + 1}.png`,
        mimetype: 'image/png',
        size: Buffer.byteLength(thumbnail.data),
      },
    })
    ids.push(id)
  }

  await payload.update({
    collection: CollectionSlug.MediaDocuments,
    id: documentId,
    data: {
      thumbnails: toMediaImageRelations(ids),
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
}

export const handler = run
