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

const toPlainText = (data: SerializedEditorState): string =>
  convertLexicalToHTML({
    data,
    disableContainer: true,
  })
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Computes the post's excerpt for listings — everything before a ReadMore
 * marker (see `@/fields/RichText/lexical/readMore`), or the first 50 words
 * of the whole post when no marker was inserted, mirroring how WordPress
 * falls back to an automatic excerpt when no "more" tag or manual excerpt
 * exists.
 */
export const generateExcerpt: CollectionBeforeChangeHook<BlogPostData> = async ({ data }) => {
  const content = data.content
  const children = content?.root?.children as SerializedLexicalNode[] | undefined
  if (!children) return data

  const markerIndex = children.findIndex((node) => node.type === READ_MORE_NODE_TYPE)

  if (markerIndex !== -1) {
    const excerptState: SerializedEditorState = {
      ...content,
      root: {
        ...content.root,
        children: children.slice(0, markerIndex),
      },
    }

    return {
      ...data,
      excerpt: toPlainText(excerptState),
    }
  }

  const words = toPlainText(content).split(' ').filter(Boolean)
  const excerpt =
    words.length <= FALLBACK_EXCERPT_WORD_COUNT
      ? words.join(' ')
      : `${words.slice(0, FALLBACK_EXCERPT_WORD_COUNT).join(' ')}…`

  return {
    ...data,
    excerpt,
  }
}
