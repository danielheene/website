import { renderToBuffer } from '@react-pdf/renderer'
import { TaskConfig } from 'payload'

import { PDFParse } from 'pdf-parse'
import z from 'zod'

import { generateContentURL } from '@/lib/generateContentURL'
import { renderTemplate } from '@/lib/renderTemplate'
import { ResumeDocument } from '@/pdf'
import { buildResumeDocumentData } from '@/pdf/lib/buildResumeDocumentData'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

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
  handler: async ({ tasks, inlineTask, input, req: { payload } }) => {
    'use server'

    const { locale, sharedId, filenameTemplate, createdAt, documentSlug } = input

    try {
      payload.logger.info(`Generating resume document for locale: ${locale}`)

      const { filename } = await inlineTask(`GenerateFilename:${locale}`, {
        task: async () => {
          const { result, error } = await renderTemplate({
            template: filenameTemplate,
            data: {
              nanoid: sharedId,
            },
            locale,
          })

          if (error) {
            throw new Error(error)
          }

          return {
            output: {
              filename: result,
            },
          }
        },
      })
      payload.logger.info(`Generated localized resume document filename: ${filename}`)

      payload.logger.info('Building resume document data')
      const { resumeDocumentData } = await inlineTask(`BuildResumeData:${locale}`, {
        task: async () => {
          const { data, success, error } = await buildResumeDocumentData({
            locale,
            creationDate: new Date(createdAt),
            fileName: filename,
            fileUrl: generateContentURL({
              path: `/resume/${documentSlug}`,
            }),
          })

          if (!success) {
            throw new Error(z.prettifyError(error))
          }

          return {
            output: {
              resumeDocumentData: data,
            },
          }
        },
      })
      payload.logger.info('Built resume document data')

      payload.logger.info('Uploading resume file')
      const { resumeFileId, resumeFileUrl, resumeFileChecksum } = await inlineTask(
        `BuildResumeFile:${locale}`,
        {
          task: async () => {
            const arrayBufferLike = await renderToBuffer(<ResumeDocument {...resumeDocumentData} />)

            const { id, url, checksum } = await payload.create({
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
                size: Buffer.byteLength(arrayBufferLike),
              },
              context: {
                skipGenerateDocumentThumbnails: true,
              },
            })

            return {
              output: {
                resumeFileId: id,
                resumeFileUrl: url,
                resumeFileChecksum: checksum,
              },
            }
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

      payload.logger.info('Finished uploading resume thumbnails')
      return {
        output: {
          resumeFileId,
          resumeFileChecksum,
          resumeThumbnailIds,
          resumeDocumentData,
        },
      }
    } catch (err) {
      // TEMPORARY DIAGNOSTIC: Payload's TaskError wrapper only preserves
      // err.message, discarding the original stack — log it raw here so the
      // real crash site survives into the job's logger output. Remove once
      // the "Cannot read properties of null (reading 'url')" crash is found.
      payload.logger.error(
        `RAW ERROR STACK [GenerateLocalizedResumeDocument:${locale}]: ${
          err instanceof Error ? err.stack : String(err)
        }`,
      )
      throw err
    }
  },
}
