import type { CollectionAfterChangeHook } from 'payload'

import type { MediaDocument } from '@/types/payload'

export const generateDocumentThumbnail: CollectionAfterChangeHook<
  MediaDocument
> = async ({
  context,
  data,
  doc,
  req: { payload },
  previousDoc,
  operation,
}) => {
  if (context.skipGenerateDocumentThumbnail) return doc

  const createdOrUpdated =
    operation === 'create' ||
    (operation === 'update' && doc.filename !== previousDoc.filename)
  const hasNoThumbnail =
    !doc.thumbnail || doc.thumbnail === '' || doc.thumbnail === null

  if (createdOrUpdated && hasNoThumbnail) {
    payload.logger.info(
      `document uploaded or updated without current thumbnail: ${doc.filename}`,
    )
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
