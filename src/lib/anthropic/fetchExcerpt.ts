import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import dedent from 'dedent'

import { generateAnthropicText } from '@/lib/anthropic/generateAnthropicText'
import { parseHtmlToLexical } from '@/lib/lexical/parseHtmlToLexical'

/**
 * Generates a short excerpt from a Lexical rich-text post body via Claude,
 * round-tripping through HTML so the result can be parsed back into Lexical
 * (same approach as `fetchAnthropicTranslation`). Returns `null` if the
 * source content is empty.
 */
export const fetchAnthropicExcerpt = async (
  value: SerializedEditorState,
): Promise<SerializedEditorState | null> => {
  const html = convertLexicalToHTML({
    data: value,
    disableContainer: true,
  })

  if (!html.trim()) return null

  const excerptHtml = await generateAnthropicText({
    functionId: 'fetchAnthropicExcerpt',
    maxOutputTokens: 2048,
    system: dedent`
      You write the excerpt shown on a blog post's preview card.

      The post is in the <post> tags as HTML. Tell the reader what they will
      get from it in 2-3 sentences, in the same language as the post and in the
      author's own voice: state the point directly rather than describing the
      post ("This post explains ...").

      Return a single HTML <p> element and nothing else. Inside it, <strong>
      and <em> are the only tags allowed; the excerpt has no link support.
    `,
    prompt: `<post>\n${html}\n</post>`,
  })

  // The excerpt editor has no link feature, so a link would fail validation
  // on save; keep its text only.
  const withoutLinks = excerptHtml.replace(/<\/?a\b[^>]*>/gi, '').trim()

  return parseHtmlToLexical(withoutLinks)
}
