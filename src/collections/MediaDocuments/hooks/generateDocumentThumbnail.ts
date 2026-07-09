import type { CollectionAfterChangeHook } from 'payload'

import { CollectionData, CollectionSlug } from '@/types/collections'

export const generateDocumentThumbnail: CollectionAfterChangeHook<
  CollectionData<CollectionSlug['MediaDocuments']>
> = async ({ context, data, doc, req: { payload }, previousDoc, operation }) => {
  if (context.skipGenerateDocumentThumbnail) return doc

  console.log(data, doc)

  /**
   * Evaluates whether a document was created or updated.
   * In case of an update, we are testing further fields to determine that the uploaded file has changed.
   *
   * @type {boolean}
   */
  const createdOrUpdated =
    operation === 'create' || (operation === 'update' && (doc.filename !== previousDoc.filename) || (doc.filesize !== previousDoc.filesize) || (doc.mimeType !== previousDoc.mimeType))

  if (createdOrUpdated && !doc.thumbnail) {
    payload.logger.info(`document uploaded or updated without current thumbnail: ${doc.filename}`)
    const job = await payload.jobs.queue({
      task: 'generateDocumentThumbnailTask',
      queue: 'default',
      input: {
        documentId: doc.id,
      },
    })
    payload.logger.info(
      `added job ${job.id} for running "${job.taskSlug}" on ${doc.filename} to queue "${job.queue}"`,
    )
  }
}
