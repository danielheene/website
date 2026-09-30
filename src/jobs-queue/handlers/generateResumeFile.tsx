import { renderToBuffer } from '@react-pdf/renderer'
import type { TaskHandler } from 'payload'

import * as Sentry from '@sentry/nextjs'

import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { ResumeDocument } from '@/pdf'
import { DocumentData } from '@/pdf/types'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['GenerateResumeFile']> = async ({ input, req: { payload } }) => {
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
      generatorFlags: ['resume-asset', 'thumbnail', 'document'],
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
}

export const handler = wrapHandler(TaskSlug.GenerateResumeFile, run)
