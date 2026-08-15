import { WorkflowConfig } from 'payload'

import { secondsToMilliseconds } from 'date-fns'

import { getLocalISOString } from '@/lib/date'
import { QueueSlug, TaskSlug, WorkflowSlug } from '@/types/jobs-queue'

/**
 * Workflow configuration for generating a complete resume document with localized versions.
 *
 * This workflow orchestrates the entire resume document generation process, including:
 * - Generating document title and slug from templates
 * - Creating localized versions (English and German) of the resume document
 * - Generating thumbnails for each localized version
 * - Creating and persisting the final resume document record with all associated files
 *
 * The workflow uses a queue-based execution model with concurrency control to ensure
 * only one generation process runs at a time, superseding any existing workflows with
 * the same slug. All generated documents are stored with checksums for integrity verification.
 *
 * Every step is its own top-level task (own slug, own file, under
 * src/jobs-queue/tasks/) rather than an inline sub-step here — each runs through
 * withTaskObservability (applied once, to every entry in TASKS), so a failure
 * surfaces in Sentry with the specific task's span/slug/job-id context instead
 * of collapsing into one large workflow handler.
 *
 * Required input parameters:
 * - documentTitleTemplate: Template string for generating the document title
 * - filenameTemplate: Template string for generating output filenames
 * - sharedId: Unique identifier used for tracking and coordinating subtasks
 *
 * The workflow produces a ResumeDocument containing:
 * - Localized PDF documents for EN and DE
 * - Document thumbnails for both locales
 * - Checksums for file integrity
 * - Structured resume data in JSON format for each locale
 */
export const generateResumeDocument: WorkflowConfig<WorkflowSlug['GenerateResumeDocument']> = {
  slug: WorkflowSlug.GenerateResumeDocument,
  concurrency: {
    key: () => WorkflowSlug.GenerateResumeDocument,
    supersedes: true,
    exclusive: true,
  },
  queue: QueueSlug.ResumeGeneration,
  inputSchema: [
    {
      type: 'text',
      name: 'documentTitleTemplate',
      required: true,
    },
    {
      type: 'text',
      name: 'filenameTemplate',
      required: true,
    },
    {
      type: 'text',
      name: 'sharedId',
      required: true,
    },
    {
      type: 'number',
      name: 'maximumRetries',
      required: true,
    },
  ],
  handler: async ({ job: { id, input }, req: { payload }, tasks }) => {
    'use server'

    const { documentTitleTemplate, filenameTemplate, sharedId, maximumRetries } = input
    const createdAt = getLocalISOString('Europe/Berlin', new Date())
    const retries = {
      attempts: maximumRetries,
      backoff: {
        delay: secondsToMilliseconds(15),
        type: 'exponential' as const,
      },
    }

    payload.logger.info(`Workflow: ${WorkflowSlug.GenerateResumeDocument}:${sharedId} started`)

    const { documentTitle } = await tasks.GenerateResumeDocumentTitle(
      `GenerateDocumentTitle:${sharedId}`,
      {
        retries,
        input: {
          documentTitleTemplate,
          sharedId,
        },
      },
    )

    const { documentSlug } = await tasks.GenerateResumeDocumentSlug(
      `GenerateDocumentSlug:${sharedId}`,
      {
        retries,
        input: {
          documentTitle,
        },
      },
    )

    payload.logger.info('Processing LocalizedResumeDocument Tasks: EN')
    const en = await tasks.GenerateLocalizedResumeDocument(
      `${TaskSlug.GenerateLocalizedResumeDocument}:${sharedId}:EN`,
      {
        retries,
        input: {
          locale: 'en',
          documentSlug,
          filenameTemplate,
          sharedId,
          createdAt,
        },
      },
    )
    payload.logger.info('Successfully processed LocalizedResumeDocument Tasks: EN')

    payload.logger.info('Processing LocalizedResumeDocument Tasks: DE')
    const de = await tasks.GenerateLocalizedResumeDocument(
      `${TaskSlug.GenerateLocalizedResumeDocument}:${sharedId}:DE`,
      {
        retries,
        input: {
          locale: 'de',
          documentSlug,
          filenameTemplate,
          sharedId,
          createdAt,
        },
      },
    )
    payload.logger.info('Successfully processed LocalizedResumeDocument Tasks: DE')

    await tasks.CreateResumeDocument(`CreateResumeDocument:${sharedId}`, {
      retries,
      input: {
        documentTitle,
        documentSlug,
        createdAt,
        jobId: String(id),
        resumeFileIdEn: en.resumeFileId,
        resumeFileChecksumEn: en.resumeFileChecksum,
        resumeThumbnailIdsEn: en.resumeThumbnailIds,
        resumeDocumentDataEn: en.resumeDocumentData,
        resumeFileIdDe: de.resumeFileId,
        resumeFileChecksumDe: de.resumeFileChecksum,
        resumeThumbnailIdsDe: de.resumeThumbnailIds,
        resumeDocumentDataDe: de.resumeDocumentData,
      },
    })

    payload.logger.info('Finished generating localized resume documents')

    return void 0
  },
}
