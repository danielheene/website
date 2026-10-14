import type { WorkflowHandler } from 'payload'

import { secondsToMilliseconds } from 'date-fns'

import { getLocalISOString } from '@/lib/date'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { publish } from '@/lib/RedisHandler'
import { resumeGenerateChannel } from '@/lib/sse/channels'
import { TaskSlug, WorkflowSlug } from '@/types/jobs-queue'

const RESUME_TIMEZONE = 'Europe/Berlin'
const RETRY_BACKOFF_MS = secondsToMilliseconds(15)

const run: WorkflowHandler<WorkflowSlug['GenerateResumeDocument']> = async ({
  job: { id, input },
  req: { payload },
  tasks,
}) => {
  const { documentTitleTemplate, filenameTemplate, customId, maximumRetries } = input
  // customId doubles as the document's slug — no separate title-to-slug
  // step needed, since the two are otherwise unrelated values.
  const documentSlug = customId
  const createdAt = getLocalISOString(RESUME_TIMEZONE, new Date())
  const retries = {
    attempts: maximumRetries,
    backoff: {
      delay: RETRY_BACKOFF_MS,
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

  const generateLocale = async (locale: 'en' | 'de', label: string) => {
    payload.logger.info(`Processing LocalizedResumeDocument Tasks: ${label}`)
    await publishStep(`Generating ${label} resume…`)
    const result = await tasks.generateLocalizedResumeDocument(
      `${TaskSlug.GenerateLocalizedResumeDocument}:${customId}:${locale.toUpperCase()}`,
      {
        retries,
        input: {
          locale,
          documentSlug,
          filenameTemplate,
          customId,
          createdAt,
        },
      },
    )
    payload.logger.info(`Successfully processed LocalizedResumeDocument Tasks: ${label}`)
    return result
  }

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

    const en = await generateLocale('en', 'English')
    const de = await generateLocale('de', 'German')

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
}

export const handler = run
