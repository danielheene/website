import { TaskConfig } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { cloneDeep, get, set } from 'lodash-es'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { fetchAnthropicTranslation } from '@/lib/fetchAnthropicTranslation'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { publish } from '@/lib/RedisHandler'
import type { AutoTranslateBilingualFieldProgress } from '@/lib/sse/channels'
import { bilingualTranslateChannel } from '@/lib/sse/channels'
import type { BilingualLanguageValue } from '@/types/bilingualLanguage'
import { BilingualLanguageLabel } from '@/types/bilingualLanguage'
import { TaskSlug } from '@/types/jobs-queue'

export type { AutoTranslateBilingualFieldProgress } from '@/lib/sse/channels'

/**
 * Background task backing `BilingualRichTextField`'s translate buttons and
 * its save-time auto-translate hook. Reuses `fetchAnthropicTranslation`
 * verbatim — this task only changes *when* and *how* that call happens, not
 * the translation itself.
 *
 * Two modes, selected by `input.mode`:
 *
 * - `'auto'` — queued by `enqueueAutoTranslate` (the group field's
 *   `afterChange` hook) after a save with one side newly populated and the
 *   other still empty. Nobody is watching the browser tab by the time this
 *   runs, so the only way to deliver the result is to patch the document
 *   directly via `payload.update`, guarded by `context.skipAutoTranslate` so
 *   that writeback doesn't re-trigger the same hook.
 * - `'manual'` — queued by the `enqueueBilingualTranslation` server action
 *   when a user clicks a translate button. The admin's tab is open and
 *   listening over SSE, so this mode does *not* touch the document — writing
 *   `payload.update` here would clobber whatever else the user has typed
 *   elsewhere in the still-unsaved form. It only publishes progress and the
 *   final translated value; the client applies it via `setValue`, same as
 *   the field's original direct-call behavior.
 */
export const autoTranslateBilingualField: TaskConfig<TaskSlug['AutoTranslateBilingualField']> = {
  slug: TaskSlug.AutoTranslateBilingualField,
  label: 'Auto-translate bilingual field',
  retries: 3,
  concurrency: {
    // Per-target-cell key: a newer save/click on the same field supersedes
    // an in-flight job for it, so only the latest translation wins.
    // exclusive: true matches every other task in this repo (see
    // generateDocumentThumbnails.ts, generateVideoThumbnails.ts,
    // generateLocalizedResumeDocument.tsx) — without it, two jobs sharing
    // this key could run concurrently instead of one waiting for the
    // other, which would let a stale in-flight job's result land after a
    // newer one's.
    key: ({ input }) =>
      [
        TaskSlug.AutoTranslateBilingualField,
        input.mode,
        input.collectionSlug,
        input.docId ?? 'unsaved',
        input.path,
        input.targetLanguage,
      ].join(':'),
    supersedes: true,
    exclusive: true,
  },
  inputSchema: [
    {
      name: 'mode',
      type: 'text',
      required: true,
    },
    {
      name: 'collectionSlug',
      type: 'text',
      required: true,
    },
    {
      // Optional: a brand-new, not-yet-saved document has no id yet. Only
      // 'auto' mode's document writeback needs this; 'manual' mode ignores it.
      name: 'docId',
      type: 'text',
    },
    {
      // Dot-notation path to the BilingualRichTextField group, e.g.
      // 'tasks.0.task'.
      name: 'path',
      type: 'text',
      required: true,
    },
    {
      name: 'sourceLanguage',
      type: 'text',
      required: true,
    },
    {
      name: 'targetLanguage',
      type: 'text',
      required: true,
    },
    {
      name: 'sourceValue',
      type: 'json',
      required: true,
    },
  ],
  handler: async ({ input, job, req }) => {
    'use server'

    const { mode, collectionSlug, docId, path, sourceLanguage, targetLanguage, sourceValue } = input
    const { payload } = req

    const emit = (progress: AutoTranslateBilingualFieldProgress) =>
      publish(bilingualTranslateChannel(String(job.id)), progress)

    try {
      if (mode === 'auto') {
        if (!docId) {
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
  },
}
