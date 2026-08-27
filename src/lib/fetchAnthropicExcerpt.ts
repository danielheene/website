'use server'

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import dedent from 'dedent'

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

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Excerpt generation is unavailable — ANTHROPIC_API_KEY is not configured.')
  }

  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const { text: excerptHtml } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    system: dedent`
      Write a concise, engaging excerpt (2-3 sentences) summarizing the
      following blog post HTML, suitable for a preview card and meta
      description. Return only the excerpt as a single HTML <p> tag, no
      explanation, no code fences, no surrounding <html>/<body> tags.
    `,
    prompt: html,
  })

  const stripped = excerptHtml
    .replace(/^\s*```(?:html)?\s*\n?/i, '')
    .replace(/\n?\s*```\s*$/, '')
    .trim()

  return parseHtmlToLexical(stripped)
}
