import type { FieldHook } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import type { BilingualLanguageValue } from '@/types/bilingualLanguage'
import { BilingualLanguage } from '@/types/bilingualLanguage'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

type BilingualValue = Partial<Record<BilingualLanguageValue, SerializedEditorState>>

/** The hook doesn't care about the parent document's shape, only that
 * `FieldHook`'s `TData` constraint (`TypeWithID`) is satisfied. */
type AnyDocWithID = {
  id: number | string
}

/**
 * `afterChange` hook on `BilingualRichTextField`'s group: after a save that
 * leaves one language side populated and the other still empty (and it was
 * also empty before this save — see `shouldFill`), enqueues the
 * `AutoTranslateBilingualField` task in `'auto'` mode to fill it in the
 * background.
 *
 * "Always on" for every consumer of `BilingualRichTextField` — no opt-in
 * prop. `context.skipAutoTranslate` is the escape hatch, matching the
 * `skipGenerateResumeDocumentHook` / `skipRevalidate` /
 * `skipUpdateCachedData` pattern used by 10+ other hooks in this repo. The
 * task itself sets that context on its own writeback so this hook does not
 * re-trigger itself.
 */
export const enqueueAutoTranslate: FieldHook<AnyDocWithID, BilingualValue> = async ({
  value,
  previousValue,
  data,
  req,
  operation,
  path,
  collection,
  context,
}) => {
  if (context?.skipAutoTranslate) return value
  if (!collection?.slug) return value // globals aren't supported here
  if (operation !== 'create' && operation !== 'update') return value

  // afterChange runs after the write, so a create already has its id.
  const docId = data?.id ?? req.routeParams?.id
  if (!docId) return value

  const shouldFill = (source: BilingualLanguageValue, target: BilingualLanguageValue): boolean =>
    !isEmptyValue(value?.[source]) &&
    isEmptyValue(value?.[target]) &&
    isEmptyValue(previousValue?.[target])

  const enqueue = (source: BilingualLanguageValue, target: BilingualLanguageValue) =>
    req.payload.jobs.queue({
      task: TaskSlug.AutoTranslateBilingualField,
      queue: QueueSlug.Default,
      input: {
        mode: 'auto',
        collectionSlug: collection.slug,
        docId: String(docId),
        path: path.join('.'),
        sourceLanguage: source,
        targetLanguage: target,
        // The task's `sourceValue` input is a generic `json` field (see
        // autoTranslateBilingualField.ts), typed as a loose JSON union —
        // it doesn't structurally match SerializedEditorState's specific
        // shape, so this bridges through `unknown` rather than lying about
        // literal type compatibility.
        sourceValue: value?.[source] as unknown as Record<string, unknown>,
      },
    })

  const jobs: Promise<unknown>[] = []
  if (shouldFill(BilingualLanguage.English, BilingualLanguage.German)) {
    jobs.push(enqueue(BilingualLanguage.English, BilingualLanguage.German))
  }
  if (shouldFill(BilingualLanguage.German, BilingualLanguage.English)) {
    jobs.push(enqueue(BilingualLanguage.German, BilingualLanguage.English))
  }

  await Promise.all(jobs)

  return value
}
