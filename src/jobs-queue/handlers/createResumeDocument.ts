import type { TaskHandler } from 'payload'
import { formatAdminURL } from 'payload/shared'

import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['CreateResumeDocument']> = async ({ input, req: { payload } }) => {
  const {
    documentTitle,
    documentSlug,
    createdAt,
    jobId,
    resumeFileIdEn,
    resumeFileChecksumEn,
    resumeThumbnailIdsEn,
    resumeDocumentDataEn,
    resumeFileIdDe,
    resumeFileChecksumDe,
    resumeThumbnailIdsDe,
    resumeDocumentDataDe,
  } = input

  payload.logger.info(`Creating ResumeDocument: ${documentTitle}`)

  const doc = await payload.create({
    collection: CollectionSlug.ResumeDocuments,
    data: {
      title: documentTitle,
      slug: documentSlug,
      createdAt,
      jobId,
      document_en: {
        relationTo: CollectionSlug.MediaDocuments,
        value: resumeFileIdEn,
      },
      checksum_en: resumeFileChecksumEn,
      thumbnails_en: resumeThumbnailIdsEn.map((id) => ({
        relationTo: CollectionSlug.MediaImages,
        value: id,
      })),
      document_de: {
        relationTo: CollectionSlug.MediaDocuments,
        value: resumeFileIdDe,
      },
      checksum_de: resumeFileChecksumDe,
      thumbnails_de: resumeThumbnailIdsDe.map((id) => ({
        relationTo: CollectionSlug.MediaImages,
        value: id,
      })),
      data_en: resumeDocumentDataEn,
      data_de: resumeDocumentDataDe,
    },
  })

  payload.logger.info(`Successfully created ResumeDocument: ${doc.title}`)
  payload.logger.info(
    `open document: ${formatAdminURL({
      adminRoute: payload.config.routes.admin,
      path: `/${CollectionSlug.ResumeDocuments}/${doc.id}`,
    })}`,
  )

  return {
    output: {
      success: true,
    },
  }
}

export const handler = wrapHandler(TaskSlug.CreateResumeDocument, run)
