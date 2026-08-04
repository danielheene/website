import { codeBlockKey, type HighlightedCodeMap } from '@repo/utils/shiki/codeBlockKey'

import { BlockSlug } from '@/types/blocks'

import { highlightCodeCached } from './highlightCodeCached'

type LexicalNode = {
  type?: string
  fields?: {
    blockType?: string
    code?: string | null
    language?: string | null
  }
  children?: unknown[]
}

/** Depth-first walk collecting every code block's `(code, language)` pair. */
const collectCodeNodes = (
  node: unknown,
  found: Map<
    string,
    {
      code: string
      language?: string | null
    }
  >,
): void => {
  if (!node || typeof node !== 'object') return

  const { type, fields, children } = node as LexicalNode

  if (type === 'block' && fields?.blockType === BlockSlug.Code && fields.code) {
    found.set(codeBlockKey(fields.code, fields.language), {
      code: fields.code,
      language: fields.language,
    })
  }

  if (Array.isArray(children)) {
    for (const child of children) collectCodeNodes(child, found)
  }
}

/**
 * Highlights every code block in a Lexical document up front, on the server.
 *
 * `RichText` is a Client Component, so it cannot run Shiki itself — and Shiki
 * cannot run in the browser here anyway (it is server-only, and reads the
 * current time, which Cache Components only permits inside a cache scope).
 * Resolving the markup ahead of render lets client-rendered documents show
 * fully highlighted code.
 *
 * Blocks are highlighted concurrently; each call is individually cached, so
 * repeated snippets cost nothing after the first build.
 */
export const highlightRichText = async (data: unknown): Promise<HighlightedCodeMap> => {
  const found = new Map<
    string,
    {
      code: string
      language?: string | null
    }
  >()

  collectCodeNodes(
    (
      data as {
        root?: unknown
      }
    )?.root,
    found,
  )

  if (found.size === 0) return {}

  const entries = await Promise.all(
    [
      ...found,
    ].map(async ([key, { code, language }]) => {
      const html = await highlightCodeCached({
        code,
        language: language ?? undefined,
      })
      return [
        key,
        html,
      ] as const
    }),
  )

  return Object.fromEntries(entries)
}
