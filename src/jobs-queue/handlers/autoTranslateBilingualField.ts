import type { Payload, TaskHandler } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { cloneDeep, get, set } from 'lodash-es'

import { fetchAnthropicTranslation } from '@/lib/anthropic/fetchTranslation'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { publish } from '@/lib/RedisHandler'
import type { AutoTranslateBilingualFieldProgress } from '@/lib/sse/channels'
import { bilingualTranslateChannel } from '@/lib/sse/channels'
import { BilingualLanguageLabel } from '@/types/bilingualLanguage'
import { TaskSlug } from '@/types/jobs-queue'

type DocLookup = {
  payload: Payload
  collectionSlug: string
  docId: string
  path: string
}

/**
 * Re-checks whether someone (the user, another job) already filled the
 * target between enqueue and this run.
 */
const isTargetPopulated = async (
  { payload, collectionSlug, docId, path }: DocLookup,
  targetLanguage: string,
): Promise<boolean> => {
  // depth: 0 keeps relationships as bare IDs — a depth-populated one fed
  // back into `update` (via `writeTranslation`) is a known Payload footgun.
  const currentDoc = await payload.findByID({
    collection: collectionSlug as never,
    id: docId,
    depth: 0,
  })
  const currentTarget = get(currentDoc, `${path}.${targetLanguage}`) as
    | SerializedEditorState
    | undefined

  return !isEmptyValue(currentTarget)
}

/** Writes a completed translation back into the target field and saves it. */
const writeTranslation = async (
  { payload, collectionSlug, docId, path }: DocLookup,
  targetLanguage: string,
  translated: SerializedEditorState,
): Promise<void> => {
  // depth: 0 — see the matching note in isTargetPopulated.
  const doc = await payload.findByID({
    collection: collectionSlug as never,
    id: docId,
    depth: 0,
  })
  const nextDoc = cloneDeep(doc)
  set(nextDoc, `${path}.${targetLanguage}`, translated)

  await payload.update({
    collection: collectionSlug as never,
    id: docId,
    data: nextDoc,
    context: {
      skipAutoTranslate: true,
    },
  })
}

const run: TaskHandler<TaskSlug['AutoTranslateBilingualField']> = async ({ input, job, req }) => {
  const { mode, collectionSlug, docId, path, sourceLanguage, targetLanguage, sourceValue } = input
  const { payload } = req

  const emit = (progress: AutoTranslateBilingualFieldProgress) =>
    publish(bilingualTranslateChannel(String(job.id)), progress)

  const skip = async (reason: 'no-doc-id' | 'target-already-populated' | 'empty-translation') => {
    await emit({ status: 'skipped', reason })
    return { output: { skipped: true } }
  }

  try {
    if (mode === 'auto') {
      if (!docId) {
        return skip('no-doc-id')
      }

      const lookup = { payload, collectionSlug, docId, path }
      if (await isTargetPopulated(lookup, targetLanguage)) {
        return skip('target-already-populated')
      }
    }

    await emit({
      status: 'progress',
      message: `Translating ${BilingualLanguageLabel[sourceLanguage]} → ${BilingualLanguageLabel[targetLanguage]}…`,
    })

    const translated = await fetchAnthropicTranslation({
      value: sourceValue as unknown as SerializedEditorState,
      sourceLanguage,
      targetLanguage,
    })

    if (!translated) {
      return skip('empty-translation')
    }

    if (mode === 'auto' && docId) {
      await emit({
        status: 'progress',
        message: 'Saving translation…',
      })

      await writeTranslation({ payload, collectionSlug, docId, path }, targetLanguage, translated)
    }

    await emit({
      status: 'success',
      translated,
    })

    return {
      output: {
        success: true,
      },
    }
  } catch (error) {
    const message = extractErrorMessage(error)
    payload.logger.error(`AutoTranslateBilingualField failed: ${message}`)
    await emit({
      status: 'error',
      message,
    })
    throw error
  }
}

export const handler = run
