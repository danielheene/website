import { WorkflowConfig } from 'payload'

import { secondsToMilliseconds } from 'date-fns'
import { millisecondsInMinute } from 'date-fns/constants'
import { formatAdminURL } from 'payload/shared'

import { getLocalISOString } from '@repo/utils/date'
import { extractErrorMessage } from '@repo/utils/extractErrorMessage'
import { generateSlug } from '@repo/utils/generateSlug'
import { renderTemplate } from '@/lib/renderTemplate'
import { CollectionSlug } from '@/types/collections'
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
  handler: async ({ inlineTask, job: { id, input }, req: { payload }, tasks }) => {
    'use server'

    const { documentTitleTemplate, filenameTemplate, sharedId, maximumRetries } = input
    const createdAt = getLocalISOString('Europe/Berlin', new Date())

    payload.logger.info(`Workflow: ${WorkflowSlug.GenerateResumeDocument}:${sharedId} started`)

    /**
     * Generate document title
     */
    payload.logger.info(`Generating document title`)
    const { documentTitle } = await inlineTask(`GenerateDocumentTitle:${sharedId}`, {
      task: async () => {
        const { result, error } = await renderTemplate({
          template: documentTitleTemplate,
          data: {
            nanoid: sharedId,
          },
          locale: 'en',
        })

        if (error) {
          throw new Error(error)
        }

        return {
          output: {
            documentTitle: result,
          },
        }
      },
    })
    payload.logger.info(`Successfully generated document title: ${documentTitle}`)

    /**
     * Generate document slug
     */
    payload.logger.info(`Generating document slug`)
    const { documentSlug } = await inlineTask(`GenerateDocumentSlug:${sharedId}`, {
      task: async () => {
        return {
          output: {
            documentSlug: generateSlug(documentTitle),
          },
        }
      },
    })
    payload.logger.info(`Successfully generated document slug: ${documentSlug}`)

    /**
     * Processing LozalizedResumeDocument Tasks: EN
     */
    payload.logger.info(`Processing LozalizedResumeDocument Tasks: EN`)
    const en = await tasks.GenerateLocalizedResumeDocument(
      `${TaskSlug.GenerateLocalizedResumeDocument}:${sharedId}:EN`,
      {
        retries: {
          attempts: maximumRetries,
          backoff: {
            delay: secondsToMilliseconds(15),
            type: 'exponential',
          },
        },
        input: {
          locale: 'en',
          documentSlug,
          filenameTemplate,
          sharedId,
          createdAt,
        },
      },
    )
    payload.logger.info(`Successfully processed LozalizedResumeDocument Tasks: EN`)

    /**
     * Processing LozalizedResumeDocument Tasks: DE
     */
    payload.logger.info(`Processing LozalizedResumeDocument Tasks: DE`)
    const de = await tasks.GenerateLocalizedResumeDocument(
      `${TaskSlug.GenerateLocalizedResumeDocument}:${sharedId}:DE`,
      {
        retries: {
          attempts: maximumRetries,
          backoff: {
            delay: secondsToMilliseconds(15),
            type: 'exponential',
          },
        },
        input: {
          locale: 'de',
          documentSlug,
          filenameTemplate,
          sharedId,
          createdAt,
        },
      },
    )
    payload.logger.info(`Successfully processed LozalizedResumeDocument Tasks: DE`)

    /**
     * Create ResumeDocument
     */
    await inlineTask(`CreateResumeDocument:${sharedId}`, {
      retries: {
        attempts: maximumRetries,
        backoff: {
          delay: secondsToMilliseconds(15),
          type: 'exponential',
        },
      },
      task: async () => {
        let success = true
        try {
          payload.logger.info(`Creating ResumeDocument: ${documentTitle}`)
          const doc = await payload.create({
            collection: CollectionSlug.ResumeDocuments,
            data: {
              title: documentTitle,
              slug: documentSlug,
              createdAt,
              jobId: id,
              document_en: {
                relationTo: CollectionSlug.MediaDocuments,
                value: en.resumeFileId,
              },
              checksum_en: en.resumeFileChecksum,
              thumbnails_en: en.resumeThumbnailIds.map((id) => ({
                relationTo: CollectionSlug.MediaImages,
                value: id,
              })),
              document_de: {
                relationTo: CollectionSlug.MediaDocuments,
                value: de.resumeFileId,
              },
              checksum_de: de.resumeFileChecksum,
              thumbnails_de: de.resumeThumbnailIds.map((id) => ({
                relationTo: CollectionSlug.MediaImages,
                value: id,
              })),
              data_en: en.resumeDocumentData,
              data_de: de.resumeDocumentData,
            },
          })

          payload.logger.info(`Successfully created ResumeDocument: ${doc.title}`)
          payload.logger.info(
            `open document: ${formatAdminURL({
              adminRoute: payload.config.routes.admin,
              path: `/${CollectionSlug.ResumeDocuments}/${doc.id}`,
            })}`,
          )
        } catch (error) {
          success = false
          payload.logger.error(`Error creating resume document: ${extractErrorMessage(error)}`)
        }

        return {
          output: {
            success,
          },
        }
      },
    })

    payload.logger.info('Finished generating localized resume documents')
    payload.logger.info('Creating final resume document')

    return void 0
  },
}
