'use server'

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import dedent from 'dedent'

import { parseHtmlToLexical } from '@/lib/lexical/parseHtmlToLexical'
import { BilingualLanguageLabel, BilingualLanguageValue } from '@/types/bilingualLanguage'

type FetchAnthropicTranslationArgs = {
  value: SerializedEditorState
  sourceLanguage: BilingualLanguageValue
  targetLanguage: BilingualLanguageValue
}

/**
 * Translates a Lexical rich-text value from one language to another via
 * Claude, round-tripping through HTML so formatting (bold/italic/links)
 * survives translation. Returns `null` if the source field is empty.
 */
export const fetchAnthropicTranslation = async ({
  value,
  sourceLanguage,
  targetLanguage,
}: FetchAnthropicTranslationArgs): Promise<SerializedEditorState | null> => {
  const html = convertLexicalToHTML({
    data: value,
    disableContainer: true,
  })

  if (!html.trim()) return null

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Translation is unavailable — ANTHROPIC_API_KEY is not configured.')
  }

  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const { text: translatedHtml } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    system: dedent`
      Translate the following ${BilingualLanguageLabel[sourceLanguage]} HTML fragment
      into ${BilingualLanguageLabel[targetLanguage]}. Preserve the HTML tags and
      structure exactly - translate only the text content. Keep the tone
      concise and professional, appropriate for a CV/résumé bullet point.
      Return only the translated HTML fragment, no explanation, no code
      fences, no surrounding <html>/<body> tags.
    `,
    prompt: html,
  })

  const stripped = translatedHtml
    .replace(/^\s*```(?:html)?\s*\n?/i, '')
    .replace(/\n?\s*```\s*$/, '')
    .trim()

  return parseHtmlToLexical(stripped)
}
