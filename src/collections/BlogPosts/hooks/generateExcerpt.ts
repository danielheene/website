import type { CollectionBeforeChangeHook } from 'payload'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type {
  SerializedEditorState,
  SerializedLexicalNode,
} from '@payloadcms/richtext-lexical/lexical'

import { READ_MORE_NODE_TYPE } from '@/fields/RichText/lexical/readMore/ReadMoreNode.base'
import type { BlogPostData } from '@/types/payload'

/** Matches WordPress's own automatic-excerpt length when no "more" marker is present. */
const FALLBACK_EXCERPT_WORD_COUNT = 50

/**
 * Entities the HTML serializer emits for text it escaped. Excerpts are stored
 * and rendered as plain text, so anything left encoded would show up
 * literally (`R&amp;D`) and non-breaking spaces would even be counted as
 * words by the fallback truncation.
 */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  hellip: '…',
  laquo: '«',
  ldquo: '“',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  nbsp: ' ',
  ndash: '–',
  quot: '"',
  raquo: '»',
  rdquo: '”',
  rsquo: '’',
}

const decodeEntities = (text: string): string =>
  text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith('#')) {
      const isHex = entity[1]?.toLowerCase() === 'x'
      const codePoint = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10)
      if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return match
      try {
        return String.fromCodePoint(codePoint)
      } catch {
        return match
      }
    }

    return NAMED_ENTITIES[entity.toLowerCase()] ?? match
  })

const toPlainText = (data: SerializedEditorState): string =>
  decodeEntities(
    convertLexicalToHTML({
      data,
      disableContainer: true,
    }).replace(/<[^>]*>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()

/**
 * The listing excerpt for a post body: everything before a ReadMore marker
 * (see `@/fields/RichText/lexical/readMore`), or the first 50 words of the
 * whole post when no marker was inserted, mirroring how WordPress falls back
 * to an automatic excerpt when no "more" tag or manual excerpt exists.
 * Returns `undefined` when there is no content to derive it from.
 */
export const computeExcerpt = (
  content: SerializedEditorState | null | undefined,
): string | undefined => {
  const children = content?.root?.children as SerializedLexicalNode[] | undefined
  if (!children) return undefined

  const markerIndex = children.findIndex((node) => node.type === READ_MORE_NODE_TYPE)

  if (markerIndex !== -1) {
    return toPlainText({
      ...content,
      root: {
        ...content.root,
        children: children.slice(0, markerIndex),
      },
    })
  }

  const words = toPlainText(content).split(' ').filter(Boolean)
  return words.length <= FALLBACK_EXCERPT_WORD_COUNT
    ? words.join(' ')
    : `${words.slice(0, FALLBACK_EXCERPT_WORD_COUNT).join(' ')}…`
}

export const generateExcerpt: CollectionBeforeChangeHook<BlogPostData> = async ({ data }) => {
  const excerpt = computeExcerpt(data.content as SerializedEditorState | undefined)
  if (excerpt === undefined) return data

  return {
    ...data,
    excerpt,
  }
}
