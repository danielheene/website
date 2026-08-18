import { renderToBuffer } from '@react-pdf/renderer'
import { TaskConfig } from 'payload'

import * as Sentry from '@sentry/nextjs'

import { ResumeDocument } from '@/pdf'
import { DocumentData } from '@/pdf/types'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

export const generateResumeFile: TaskConfig<TaskSlug['GenerateResumeFile']> = {
  slug: TaskSlug.GenerateResumeFile,
  label: 'Render and Upload Resume File',
  retries: 3,
  inputSchema: [
    {
      type: 'text',
      name: 'filename',
      required: true,
    },
    {
      type: 'date',
      name: 'createdAt',
      required: true,
    },
    {
      type: 'json',
      name: 'resumeDocumentData',
      required: true,
    },
    {
      // Only used to tag the resume.file.size_bytes metric below — not
      // referenced by rendering or upload.
      type: 'text',
      name: 'locale',
      required: true,
    },
  ],
  outputSchema: [
    {
      type: 'text',
      name: 'resumeFileId',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeFileChecksum',
      required: true,
    },
  ],
  handler: async ({ input, req: { payload } }) => {
    'use server'

    const { filename, createdAt, resumeDocumentData, locale } = input

    payload.logger.info(`Rendering resume PDF: ${filename}`)

    // The rendered buffer stays local to this task — it is never passed
    // through a task's input/output, which would persist it as JSON.
    const arrayBufferLike = await renderToBuffer(
      <ResumeDocument {...(resumeDocumentData as DocumentData)} />,
    )
    const fileSizeBytes = Buffer.byteLength(arrayBufferLike)

    payload.logger.info(`Uploading resume file: ${filename}`)

    const { id, checksum } = await payload.create({
      collection: CollectionSlug.MediaDocuments,
      data: {
        createdAt,
        generatorFlags: [
          'resume-asset',
          'thumbnail',
          'document',
        ],
      },
      file: {
        data: Buffer.from(arrayBufferLike),
        name: `${filename}.pdf`,
        mimetype: 'application/pdf',
        size: fileSizeBytes,
      },
      context: {
        skipGenerateDocumentThumbnails: true,
      },
    })

    payload.logger.info(`Uploaded resume file: ${filename}`)

    // Business KPI, not a span metric: tracks how generated-resume PDF size
    // trends over time per locale. Duration/success are already covered by
    // withJobObservability's span on this task.
    Sentry.metrics.distribution('resume.file.size_bytes', fileSizeBytes, {
      unit: 'byte',
      attributes: {
        locale,
      },
    })

    return {
      output: {
        resumeFileId: id,
        resumeFileChecksum: checksum,
      },
    }
  },
}
