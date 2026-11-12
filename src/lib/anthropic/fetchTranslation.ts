import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import dedent from 'dedent'

import {
  ANTHROPIC_TRANSLATION_MODEL,
  generateAnthropicText,
} from '@/lib/anthropic/generateAnthropicText'
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

  const source = BilingualLanguageLabel[sourceLanguage]
  const target = BilingualLanguageLabel[targetLanguage]

  const translatedHtml = await generateAnthropicText({
    functionId: 'fetchAnthropicTranslation',
    model: ANTHROPIC_TRANSLATION_MODEL,
    maxOutputTokens: 16_000,
    system: dedent`
      You translate résumé content from ${source} into ${target}.

      The source is an HTML fragment in the <source> tags. Translate its text
      and keep the HTML tags, attributes and structure exactly as they are.
      Leave link targets, company names, product names, technologies and other
      proper nouns untranslated.

      Keep the tone concise and professional, as in a CV bullet point, and
      phrase it the way a native ${target} reader expects a résumé to read
      rather than word for word.

      Return only the translated HTML fragment.
    `,
    prompt: `<source>\n${html}\n</source>`,
  })

  return parseHtmlToLexical(translatedHtml)
}
