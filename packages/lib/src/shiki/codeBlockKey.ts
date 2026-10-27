import { FALLBACK_LANGUAGE } from './highlightCode'

/**
 * Pre-rendered Shiki markup for every code block in a Lexical document, keyed
 * by `codeBlockKey(code, language)`.
 *
 * Plain serializable data, so a Server Component can compute it and hand it to
 * the Client Component that renders the document.
 */
export type HighlightedCodeMap = Record<string, string>

/**
 * Identifies a code block by its content rather than its position, so two
 * identical blocks share one entry and reordering the document does not
 * invalidate the map.
 *
 * Lives apart from `highlightRichText` so the client can compute lookup keys
 * without pulling `next/cache` into its module graph.
 */
export const codeBlockKey = (code: string, language?: string | null): string =>
  `${language || FALLBACK_LANGUAGE}\n${code}`
