import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/**
 * Conservative baseline for mixed technical content. Commonly cited range
 * for adult silent reading is ~200-250 wpm; 200 is used here rather than a
 * higher marketing-average figure so the estimate skews generous (readers
 * finish at or before the stated time) for content that includes code
 * blocks, tables, and other slower-to-read material.
 */
const WORDS_PER_MINUTE = 200

/**
 * Estimates reading time (in whole minutes, rounded up) for a Lexical
 * richtext value. Converts to HTML first (reusing the same conversion
 * `fetchAnthropicTranslation` uses) rather than walking the Lexical tree
 * directly, then strips tags and counts whitespace-separated words.
 *
 * Returns 0 for an empty/missing value; otherwise always at least 1, so a
 * very short post still reads as "1 min" rather than "0 min."
 */
export const calculateReadingTime = (value: SerializedEditorState | null | undefined): number => {
  if (!value) return 0

  const html = convertLexicalToHTML({
    data: value,
    disableContainer: true,
  })

  const text = html.replace(/<[^>]*>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) return 0

  return Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE))
}
