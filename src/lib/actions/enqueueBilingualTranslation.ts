'use server'

import { headers } from 'next/headers'
import config from '@payload-config'
import { getPayload } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

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
 * translate-button click. The worker runs it; the caller only needs the id to
 * open the `bilingual-translate:<jobId>` SSE subscription and does not wait
 * for the translation itself to finish here.
 */
export const enqueueBilingualTranslation = async (
  args: Args,
): Promise<{
  jobId: string
}> => {
  const payload = await getPayload({
    config,
  })

  // `TranslateControls` only renders inside the Payload admin panel, but a
  // Server Action is its own reachable endpoint regardless of which page
  // renders the button that calls it — without this, anyone who discovers
  // the action's reference could trigger paid OpenAI/Anthropic translation
  // calls with no session at all.
  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user) {
    throw new Error('You must be signed in to translate content.')
  }

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

  return {
    jobId: String(job.id),
  }
}
