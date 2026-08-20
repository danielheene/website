import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/**
 * `IS_BOLD`, `lexical`'s TextNode format bitmask (see lexical/LexicalConstants).
 * Hand-rolled rather than imported from `@payloadcms/richtext-lexical/lexical`
 * so this stays import-light: it's used from `scripts/migrate-skill-content-caption.ts`,
 * which runs via `payload run` outside Next's bundler — pulling in the full
 * lexical package there is unnecessary for building one fixed shape by hand.
 */
const IS_BOLD = 1

const textRun = (text: string, format = 0) => ({
  type: 'text',
  version: 1,
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
})

/**
 * Builds the Lexical `SerializedEditorState` for a migrated `ResumeSkills`
 * `content` field: a single paragraph reading `**content** - caption`, or
 * just `**content**` when there's no caption.
 *
 * Constructs the JSON directly rather than round-tripping through
 * `parseHtmlToLexical` (HTML → jsdom → headless editor): the shape here is
 * fixed and simple enough not to need general HTML parsing, and this
 * function is called from `scripts/migrate-skill-content-caption.ts`, a
 * `payload run` script executed outside Next's bundler — `parseHtmlToLexical.ts`
 * starts with `import 'server-only'`, which throws when imported outside
 * Next's "react-server" module condition.
 */
export const buildContentCaptionValue = (
  content: string,
  caption?: string,
): SerializedEditorState => {
  const children = [
    textRun(content, IS_BOLD),
  ]

  if (caption?.trim()) {
    children.push(textRun(` - ${caption}`))
  }

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          textFormat: 0,
          textStyle: '',
          children,
        },
      ],
    },
  } as unknown as SerializedEditorState
}
