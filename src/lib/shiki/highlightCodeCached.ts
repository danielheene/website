import { cacheLife } from 'next/cache'

import { type HighlightCodeOptions, highlightCode } from './highlightCode'

/**
 * Server-side entry point for highlighting.
 *
 * Wrapping the call in a cache scope is required, not just an optimisation:
 * Shiki's tokenizer reads `Date.now()` for its grammar timeout guard, and
 * Cache Components rejects reading the current time during an uncached
 * prerender. Highlighting is a pure function of `code` and `language`, so the
 * result can never go stale — hence `cacheLife('max')` and no cache tag. The
 * cache also skips re-tokenizing blocks that repeat across pages.
 *
 * Kept in its own module so the `next/cache` import never enters a client
 * component's module graph — `next/cache` is unimportable from the client, and
 * `RichText` renders code blocks from a client component.
 */
export const highlightCodeCached = async (options: HighlightCodeOptions): Promise<string> => {
  'use cache'
  cacheLife('max')

  return highlightCode(options)
}
