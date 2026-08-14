import { TaskConfig } from 'payload'

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
  label: 'Generate ResumeDocument for Locale',
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

    // TEMPORARY DIAGNOSTIC: Payload's TaskError wrapper only preserves
    // err.message, discarding the original stack, even for a task called via
    // tasks.X() from another task's handler. Name the failing step and log
    // the raw stack here so it survives into the job's logger output. Remove
    // once the "Cannot read properties of null (reading 'url')" crash is found.
    const runStep = async <T,>(step: string, run: () => Promise<T>): Promise<T> => {
      try {
        return await run()
      } catch (err) {
        payload.logger.error(
          `RAW ERROR STACK [${step}:${locale}]: ${err instanceof Error ? err.stack : String(err)}`,
        )
        throw err
      }
    }

    payload.logger.info(`Generating resume document for locale: ${locale}`)

    const { filename } = await runStep('GenerateResumeFilename', () =>
      tasks.GenerateResumeFilename(`GenerateFilename:${locale}`, {
        input: {
          filenameTemplate,
          sharedId,
          locale,
        },
      }),
    )

    const { resumeDocumentData } = await runStep('BuildLocalizedResumeData', () =>
      tasks.BuildLocalizedResumeData(`BuildResumeData:${locale}`, {
        input: {
          locale,
          filename,
          createdAt,
          documentSlug,
        },
      }),
    )

    const { resumeFileId, resumeFileChecksum } = await runStep('GenerateResumeFile', () =>
      tasks.GenerateResumeFile(`BuildResumeFile:${locale}`, {
        input: {
          filename,
          createdAt,
          resumeDocumentData,
        },
      }),
    )

    payload.logger.info('Uploading resume thumbnails')

    const { thumbnailIDs: resumeThumbnailIds } = await runStep('GenerateDocumentThumbnails', () =>
      tasks.GenerateDocumentThumbnails(`BuildResumeThumbnails:${locale}`, {
        input: {
          documentId: resumeFileId,
          maxThumbnails: Number.MAX_SAFE_INTEGER,
        },
      }),
    )

    payload.logger.info(`Finished generating resume document for locale: ${locale}`)

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
