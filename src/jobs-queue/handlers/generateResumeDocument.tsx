import type { WorkflowHandler } from 'payload'

import { secondsToMilliseconds } from 'date-fns'

import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { getLocalISOString } from '@/lib/date'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { publish } from '@/lib/RedisHandler'
import { resumeGenerateChannel } from '@/lib/sse/channels'
import { TaskSlug, WorkflowSlug } from '@/types/jobs-queue'

const run: WorkflowHandler<WorkflowSlug['GenerateResumeDocument']> = async ({
  job: { id, input },
  req: { payload },
  tasks,
}) => {
  const { documentTitleTemplate, filenameTemplate, customId, maximumRetries } = input
  const documentSlug = customId
  const createdAt = getLocalISOString('Europe/Berlin', new Date())
  const retries = {
    attempts: maximumRetries,
    backoff: {
      delay: secondsToMilliseconds(15),
      type: 'exponential' as const,
    },
  }

  const channel = resumeGenerateChannel(String(id))
  const publishStep = (step: string) =>
    publish(channel, {
      status: 'progress',
      step,
    })

  payload.logger.info(`Workflow: ${WorkflowSlug.GenerateResumeDocument}:${customId} started`)

  try {
    await publishStep('Generating document title…')
    const { documentTitle } = await tasks.generateResumeDocumentTitle(
      `GenerateDocumentTitle:${customId}`,
      {
        retries,
        input: {
          documentTitleTemplate,
          customId,
        },
      },
    )

    payload.logger.info('Processing LocalizedResumeDocument Tasks: EN')
    await publishStep('Generating English resume…')
    const en = await tasks.generateLocalizedResumeDocument(
      `${TaskSlug.GenerateLocalizedResumeDocument}:${customId}:EN`,
      {
        retries,
        input: {
          locale: 'en',
          documentSlug,
          filenameTemplate,
          customId,
          createdAt,
        },
      },
    )
    payload.logger.info('Successfully processed LocalizedResumeDocument Tasks: EN')

    payload.logger.info('Processing LocalizedResumeDocument Tasks: DE')
    await publishStep('Generating German resume…')
    const de = await tasks.generateLocalizedResumeDocument(
      `${TaskSlug.GenerateLocalizedResumeDocument}:${customId}:DE`,
      {
        retries,
        input: {
          locale: 'de',
          documentSlug,
          filenameTemplate,
          customId,
          createdAt,
        },
      },
    )
    payload.logger.info('Successfully processed LocalizedResumeDocument Tasks: DE')

    await publishStep('Saving resume document…')
    await tasks.createResumeDocument(`CreateResumeDocument:${customId}`, {
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
    await publish(channel, {
      status: 'success',
    })
  } catch (error) {
    await publish(channel, {
      status: 'error',
      message: extractErrorMessage(error),
    })
    throw error
  }

  return void 0
}

export const handler = wrapHandler(WorkflowSlug.GenerateResumeDocument, run)
