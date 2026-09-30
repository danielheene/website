import { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
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
    // Deliberately excludes `input.mode` — a save can queue an 'auto' job
    // for a cell (enqueueAutoTranslate's afterChange hook) at roughly the
    // same moment `TranslateControls` notices the same empty cell and
    // queues a 'manual' one client-side; without a shared key those two
    // would race as independent jobs instead of the second one superseding
    // the first.
    // exclusive: true matches every other task in this repo (see
    // generateDocumentThumbnails.ts, generateVideoThumbnails.ts,
    // generateLocalizedResumeDocument.tsx) — without it, two jobs sharing
    // this key could run concurrently instead of one waiting for the
    // other, which would let a stale in-flight job's result land after a
    // newer one's.
    key: ({ input }) =>
      [
        TaskSlug.AutoTranslateBilingualField,
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
  handler: handlerPath('autoTranslateBilingualField.ts'),
}
