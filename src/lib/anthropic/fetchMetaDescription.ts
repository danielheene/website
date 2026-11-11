import dedent from 'dedent'

import { generateAnthropicText } from '@/lib/anthropic/generateAnthropicText'
import { extractDocumentText } from '@/lib/extractDocumentText'
import { CollectionSlug } from '@/types/collections'

// Search engines cut descriptions off around here.
export const META_DESCRIPTION_MAX_LENGTH = 160

/**
 * A description only needs the gist of the page, which the opening carries;
 * sending a whole long article would cost more without changing the result.
 */
const MAX_CONTENT_LENGTH = 8000

const pageTypeFor = (collection: string): string => {
  if (collection === CollectionSlug.BlogPosts) return 'blog post'

  if (collection === CollectionSlug.BlogTopics) return 'blog topic overview'

  return 'page'
}

/**
 * Shortens an over-long description to the limit: at the last complete
 * sentence when one ends late enough to be worth keeping, otherwise at a word
 * boundary with an ellipsis. Models cannot count characters reliably.
 */
export const clampMetaDescription = (
  text: string,
  maxLength: number = META_DESCRIPTION_MAX_LENGTH,
): string => {
  const normalized = text.replace(/\s+/g, ' ').trim()

  if (normalized.length <= maxLength) return normalized

  const head = normalized.slice(0, maxLength)

  const sentenceEnd = Math.max(
    head.lastIndexOf('. '),
    head.lastIndexOf('! '),
    head.lastIndexOf('? '),
  )

  if (sentenceEnd >= maxLength / 2) return head.slice(0, sentenceEnd + 1)

  const room = normalized.slice(0, maxLength - 1)
  const wordEnd = room.lastIndexOf(' ')

  return `${(wordEnd > 0 ? room.slice(0, wordEnd) : room).replace(/[\s,;:–-]+$/, '')}…`
}

type FetchAnthropicMetaDescriptionArgs = {
  collection: string
  /** The document as it is being edited; its title and text are what gets described. */
  data: unknown
}

/**
 * Generates a meta description from a document's own title and text.
 * Returns `null` when the document has no text to describe yet.
 */
export const fetchAnthropicMetaDescription = async ({
  collection,
  data,
}: FetchAnthropicMetaDescriptionArgs): Promise<string | null> => {
  const content = extractDocumentText(data).slice(0, MAX_CONTENT_LENGTH)

  if (!content) return null

  const description = await generateAnthropicText({
    functionId: 'fetchAnthropicMetaDescription',
    maxOutputTokens: 1024,
    system: dedent`
      You write the meta description for a page of a personal website: the
      short text search engines show below the page title.

      The <page> tags hold the page's type and the text it contains, starting
      with its title. Write one description based only on that text, in the
      same language, and in the first person where the page speaks about its
      author.

      Aim for 140 to 155 characters including spaces, because search engines
      cut off longer text. Lead with what the page offers, use the terms a
      reader would search for where they fit naturally, and prefer a concrete
      statement over a generic call to action.

      Return the description as plain text and nothing else: no quotation
      marks, no markdown, no alternatives.
    `,
    // Joined rather than a dedent template: the multi-line content has no
    // indentation of its own, which would stop dedent from stripping any.
    prompt: [
      '<page>',
      `<type>${pageTypeFor(collection)}</type>`,
      '<content>',
      content,
      '</content>',
      '</page>',
    ].join('\n'),
  })

  return clampMetaDescription(description)
}
