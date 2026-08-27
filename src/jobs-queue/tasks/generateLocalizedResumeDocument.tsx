import { TaskConfig } from 'payload'

import * as Sentry from '@sentry/nextjs'

import { TaskSlug } from '@/types/jobs-queue'

/**
 * Orchestrates the steps needed to generate one localized resume document.
 * Each step below is its own top-level task (own slug, own file) rather than
 * an inline sub-step here — a crash surfaces with the specific task's slug
 * instead of collapsing into one large handler, and no task passes a large
 * blob (the rendered PDF buffer) through its input/output; that stays local
 * to GenerateResumeFile.
 */
export const generateLocalizedResumeDocument: TaskConfig<
  TaskSlug['GenerateLocalizedResumeDocument']
> = {
  slug: TaskSlug.GenerateLocalizedResumeDocument,
  label: 'Generate ResumeDocument for BilingualLanguage',
  retries: 3,
  concurrency: {
    key: ({ input }) =>
      `${TaskSlug.GenerateLocalizedResumeDocument}:${input.sharedId}:${input.locale}`,
    exclusive: true,
  },
  inputSchema: [
    {
      type: 'text',
      name: 'locale',
      required: true,
      typescriptSchema: [
        () => ({
          type: 'string',
          enum: [
            'en',
            'de',
          ],
          required: true,
        }),
      ],
    },
    {
      type: 'text',
      name: 'sharedId',
      required: true,
    },
    {
      type: 'text',
      name: 'filenameTemplate',
      required: true,
    },
    {
      type: 'date',
      name: 'createdAt',
      required: true,
    },
    {
      type: 'text',
      name: 'documentSlug',
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
    {
      type: 'text',
      name: 'resumeThumbnailIds',
      required: true,
      hasMany: true,
    },
    {
      type: 'json',
      name: 'resumeDocumentData',
      required: true,
    },
  ],
  handler: async ({ tasks, input, req: { payload } }) => {
    'use server'

    const { locale, sharedId, filenameTemplate, createdAt, documentSlug } = input

    payload.logger.info(`Generating resume document for locale: ${locale}`)

    // Each tasks.X() call below runs through withTaskObservability (applied
    // once, to every entry in TASKS) — a failure inside any of these is
    // captured to Sentry with the task's own span/slug/job-id context, so
    // no per-step try/catch is needed here.
    const { filename } = await tasks.GenerateResumeFilename(`GenerateFilename:${locale}`, {
      input: {
        filenameTemplate,
        sharedId,
        locale,
      },
    })

    const { resumeDocumentData } = await tasks.BuildLocalizedResumeData(
      `BuildResumeData:${locale}`,
      {
        input: {
          locale,
          filename,
          createdAt,
          documentSlug,
        },
      },
    )

    const { resumeFileId, resumeFileChecksum } = await tasks.GenerateResumeFile(
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

    const { thumbnailIDs: resumeThumbnailIds } = await tasks.GenerateDocumentThumbnails(
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
  },
}
