import type { CollectionBeforeChangeHook } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { calculateReadingTime } from '@/lib/calculateReadingTime'
import { fetchAnthropicExcerpt } from '@/lib/fetchAnthropicExcerpt'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import type { BlogPostData } from '@/types/payload'

/**
 * Derives `readingTime` and `excerpt` from `content` on every save.
 *
 * A collection-level hook (rather than a field-level hook on `readingTime`/
 * `excerpt`) is used deliberately: both fields are defined *before*
 * `content` in the collection's field array (sidebar/`readingTime` and the
 * "Excerpt" collapsible both precede the `content` richtext field in the
 * Content tab), so a field-level `beforeChange` hook reading
 * `siblingData.content` would see stale/undefined data for `content`, since
 * Payload processes field hooks in field-definition order. This hook
 * receives the full incoming `data` regardless of field order.
 *
 * - `readingTime` is always recomputed — it's a free, deterministic
 *   calculation, so there's no reason to let a stale value drift from the
 *   actual word count.
 * - `excerpt` is only generated (via Claude) when currently empty, so an
 *   editor's manually written excerpt is never overwritten. Guarded by
 *   `context.skipGenerateExcerpt` for seed scripts/programmatic writes that
 *   shouldn't trigger an AI call (mirrors `context.skipGenerateAlt` on
 *   `MediaImages`).
 */
export const generateExcerptAndReadingTime: CollectionBeforeChangeHook<BlogPostData> = async ({
  data,
  context,
}) => {
  const content = data.content

  const readingTime = calculateReadingTime(content)

  let excerpt = data.excerpt

  if (!context.skipGenerateExcerpt && isEmptyValue(excerpt) && !isEmptyValue(content)) {
    const generated = await fetchAnthropicExcerpt(content as unknown as SerializedEditorState)
    excerpt = (generated as unknown as BlogPostData['excerpt']) ?? excerpt
  }

  return {
    ...data,
    readingTime,
    excerpt,
  }
}
