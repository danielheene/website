'use server'

import { after } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import type { BilingualLanguageValue } from '@/types/bilingualLanguage'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

type Args = {
  collectionSlug: string
  docId?: string
  path: string
  sourceLanguage: BilingualLanguageValue
  targetLanguage: BilingualLanguageValue
  sourceValue: SerializedEditorState
}

/**
 * Queues an `AutoTranslateBilingualField` job in `'manual'` mode for a
 * translate-button click, and immediately triggers it to run rather than
 * waiting for the next `autoRun` poll on `QueueSlug.Default`.
 *
 * The run is kicked off via `after()` so it keeps executing once this
 * action's response has already gone back to the client with the job id —
 * the caller only needs the id to open the `bilingual-translate:<jobId>` SSE
 * subscription and does not wait for the translation itself to finish here.
 */
export const enqueueBilingualTranslation = async (
  args: Args,
): Promise<{
  jobId: string
}> => {
  const payload = await getPayload({
    config,
  })

  const job = await payload.jobs.queue({
    task: TaskSlug.AutoTranslateBilingualField,
    queue: QueueSlug.Default,
    input: {
      mode: 'manual',
      collectionSlug: args.collectionSlug,
      docId: args.docId,
      path: args.path,
      sourceLanguage: args.sourceLanguage,
      targetLanguage: args.targetLanguage,
      // See the matching comment in enqueueAutoTranslate.ts: the task's
      // `sourceValue` input is a generic `json` field, not literally typed
      // as SerializedEditorState.
      sourceValue: args.sourceValue as unknown as Record<string, unknown>,
    },
  })

  after(async () => {
    try {
      await payload.jobs.runByID({
        id: job.id,
      })
    } catch (error) {
      payload.logger.error(`Failed running job ${job.id}: ${extractErrorMessage(error)}`)
    }
  })

  return {
    jobId: String(job.id),
  }
}
