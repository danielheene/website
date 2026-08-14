import { renderToBuffer } from '@react-pdf/renderer'
import { TaskConfig } from 'payload'

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

    const { filename, createdAt, resumeDocumentData } = input

    payload.logger.info(`Rendering resume PDF: ${filename}`)

    // The rendered buffer stays local to this task — it is never passed
    // through a task's input/output, which would persist it as JSON.
    const arrayBufferLike = await renderToBuffer(
      <ResumeDocument {...(resumeDocumentData as DocumentData)} />,
    )

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
        size: Buffer.byteLength(arrayBufferLike),
      },
      context: {
        skipGenerateDocumentThumbnails: true,
      },
    })

    payload.logger.info(`Uploaded resume file: ${filename}`)

    return {
      output: {
        resumeFileId: id,
        resumeFileChecksum: checksum,
      },
    }
  },
}
