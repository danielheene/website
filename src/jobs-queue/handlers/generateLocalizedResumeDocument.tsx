import type { TaskHandler } from 'payload'

import * as Sentry from '@sentry/nextjs'

import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['GenerateLocalizedResumeDocument']> = async ({
  tasks,
  input,
  req: { payload },
}) => {
  const { locale, customId, filenameTemplate, createdAt, documentSlug } = input

  payload.logger.info(`Generating resume document for locale: ${locale}`)

  // Each tasks.X() call below runs through withTaskObservability (applied
  // once, to every entry in TASKS) — a failure inside any of these is
  // captured to Sentry with the task's own span/slug/job-id context, so
  // no per-step try/catch is needed here.
  const { filename } = await tasks.generateResumeFilename(`GenerateFilename:${locale}`, {
    input: {
      filenameTemplate,
      customId,
      locale,
    },
  })

  const { resumeDocumentData } = await tasks.buildLocalizedResumeData(`BuildResumeData:${locale}`, {
    input: {
      locale,
      filename,
      createdAt,
      documentSlug,
    },
  })

  const { resumeFileId, resumeFileChecksum } = await tasks.generateResumeFile(
    `BuildResumeFile:${locale}`,
    {
      input: {
        filename,
        createdAt,
        resumeDocumentData,
        locale,
      },
    },
  )

  payload.logger.info('Uploading resume thumbnails')

  const { thumbnailIDs: resumeThumbnailIds } = await tasks.generateDocumentThumbnails(
    `BuildResumeThumbnails:${locale}`,
    {
      input: {
        documentId: resumeFileId,
        maxThumbnails: Number.MAX_SAFE_INTEGER,
      },
    },
  )

  payload.logger.info(`Finished generating resume document for locale: ${locale}`)

  // Business KPI, not a span metric: how often a resume actually gets
  // produced per locale, i.e. the core product outcome this whole
  // workflow exists for — distinct from whether the underlying tasks
  // succeeded quickly, which withTaskObservability's spans already cover.
  Sentry.metrics.count('resume_document.generated', 1, {
    attributes: {
      locale,
    },
  })

  return {
    output: {
      resumeFileId,
      resumeFileChecksum,
      resumeThumbnailIds,
      resumeDocumentData,
    },
  }
}

export const handler = wrapHandler(TaskSlug.GenerateLocalizedResumeDocument, run)
