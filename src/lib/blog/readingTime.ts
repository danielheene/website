import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

const WORDS_PER_MINUTE = 238

type ReadingTime = {
  wordCount: number
  readingTime: number
}

/** Word count and reading time in minutes (at least 1 once there is any text). */
export const calculateReadingTime = (
  content: SerializedEditorState | null | undefined,
): ReadingTime => {
  const html = content
    ? convertLexicalToHTML({
        data: content,
        disableContainer: true,
      })
    : ''

  const wordCount = html
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  return {
    wordCount,
    readingTime: wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
  }
}
