import type { TaskHandler } from 'payload'

import { TaskSlug } from '@/types/jobs-queue'

const ALL_PAGES = Number.MAX_SAFE_INTEGER

const run: TaskHandler<TaskSlug['GenerateLocalizedResumeDocument']> = async ({
  tasks,
  input,
  req: { payload },
}) => {
  const { locale, customId, filenameTemplate, createdAt, documentSlug } = input

  payload.logger.info(`Generating resume document for locale: ${locale}`)

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
      },
    },
  )

  payload.logger.info(`Generating resume thumbnails for locale: ${locale}`)

  const { thumbnailIDs: resumeThumbnailIds } = await tasks.generateDocumentThumbnails(
    `BuildResumeThumbnails:${locale}`,
    {
      input: {
        documentId: resumeFileId,
        maxThumbnails: ALL_PAGES,
      },
    },
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
}

export const handler = run
