import { TaskConfig } from 'payload'

import { formatAdminURL } from 'payload/shared'

import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

export const createResumeDocument: TaskConfig<TaskSlug['CreateResumeDocument']> = {
  slug: TaskSlug.CreateResumeDocument,
  label: 'Create Resume Document',
  retries: 3,
  inputSchema: [
    {
      type: 'text',
      name: 'documentTitle',
      required: true,
    },
    {
      type: 'text',
      name: 'documentSlug',
      required: true,
    },
    {
      type: 'date',
      name: 'createdAt',
      required: true,
    },
    {
      type: 'text',
      name: 'jobId',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeFileIdEn',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeFileChecksumEn',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeThumbnailIdsEn',
      required: true,
      hasMany: true,
    },
    {
      type: 'json',
      name: 'resumeDocumentDataEn',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeFileIdDe',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeFileChecksumDe',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeThumbnailIdsDe',
      required: true,
      hasMany: true,
    },
    {
      type: 'json',
      name: 'resumeDocumentDataDe',
      required: true,
    },
  ],
  outputSchema: [
    {
      type: 'checkbox',
      name: 'success',
      required: true,
    },
  ],
  handler: async ({ input, req: { payload } }) => {
    'use server'

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
  },
}
