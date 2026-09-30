import type { TaskHandler } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import * as Sentry from '@sentry/nextjs'
import { cloneDeep, get, set } from 'lodash-es'

import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { fetchAnthropicTranslation } from '@/lib/anthropic/fetchTranslation'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { publish } from '@/lib/RedisHandler'
import type { AutoTranslateBilingualFieldProgress } from '@/lib/sse/channels'
import { bilingualTranslateChannel } from '@/lib/sse/channels'
import type { BilingualLanguageValue } from '@/types/bilingualLanguage'
import { BilingualLanguageLabel } from '@/types/bilingualLanguage'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['AutoTranslateBilingualField']> = async ({ input, job, req }) => {
  const { mode, collectionSlug, docId, path, sourceLanguage, targetLanguage, sourceValue } = input
  const { payload } = req

  const emit = (progress: AutoTranslateBilingualFieldProgress) =>
    publish(bilingualTranslateChannel(String(job.id)), progress)

  // Business KPI, not a span metric: how often auto-translate actually
  // translates vs. no-ops, and why — a signal spans can't answer since
  // every path here is still a "successful" task run. Tagged, not just
  // counted globally, so e.g. a spike in 'target-already-populated' for
  // one language is visible.
  const recordOutcome = (reason: string) =>
    Sentry.metrics.count('bilingual_translate.outcome', 1, {
      attributes: {
        mode,
        reason,
        target_language: targetLanguage,
      },
    })

  try {
    if (mode === 'auto') {
      if (!docId) {
        recordOutcome('no-doc-id')
        await emit({
          status: 'skipped',
          reason: 'no-doc-id',
        })
        return {
          output: {
            skipped: true,
          },
        }
      }

      // Re-check: has someone (the user, another job) already filled the
      // target between enqueue and this run?
      // depth: 0 keeps relationships as bare IDs — the writeback below
      // re-submits this same read via `data`, and a depth-populated
      // relationship object fed back into `update` is a known Payload
      // footgun (validation failure, or silently writing a nested object
      // where an ID belongs).
      const currentDoc = await payload.findByID({
        collection: collectionSlug as never,
        id: docId,
        depth: 0,
      })
      const currentTarget = get(currentDoc, `${path}.${targetLanguage}`) as
        | SerializedEditorState
        | undefined

      if (!isEmptyValue(currentTarget)) {
        recordOutcome('target-already-populated')
        await emit({
          status: 'skipped',
          reason: 'target-already-populated',
        })
        return {
          output: {
            skipped: true,
          },
        }
      }
    }

    await emit({
      status: 'progress',
      message: `Translating ${BilingualLanguageLabel[sourceLanguage as BilingualLanguageValue]} → ${BilingualLanguageLabel[targetLanguage as BilingualLanguageValue]}…`,
    })

    const translated = await fetchAnthropicTranslation({
      value: sourceValue as unknown as SerializedEditorState,
      sourceLanguage: sourceLanguage as BilingualLanguageValue,
      targetLanguage: targetLanguage as BilingualLanguageValue,
    })

    if (!translated) {
      recordOutcome('empty-translation')
      await emit({
        status: 'skipped',
        reason: 'empty-translation',
      })
      return {
        output: {
          skipped: true,
        },
      }
    }

    if (mode === 'auto' && docId) {
      await emit({
        status: 'progress',
        message: 'Saving translation…',
      })

      // depth: 0 — see the matching comment on the re-check findByID above.
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

    recordOutcome('translated')
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

export const handler = wrapHandler(TaskSlug.AutoTranslateBilingualField, run)
