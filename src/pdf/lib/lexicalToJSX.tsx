import type { ReactNode } from 'react'
import type { Styles } from '@react-pdf/renderer'
import { Text } from '@react-pdf/renderer'
import type {
  ElementFormatType,
  SerializedEditorState,
  SerializedLexicalNode,
  SerializedParagraphNode,
  SerializedTextNode,
} from '@payloadcms/richtext-lexical/lexical'
import {
  IS_BOLD,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_UNDERLINE,
} from '@payloadcms/richtext-lexical/lexical'

type Style = Styles[string]

const isTextNode = (node: SerializedLexicalNode): node is SerializedTextNode => node.type === 'text'

const isParagraphNode = (node: SerializedLexicalNode): node is SerializedParagraphNode =>
  node.type === 'paragraph'

/**
 * Lexical's `'start'`/`'end'` alignment only differ from `'left'`/`'right'`
 * for bidirectional text. This codebase's content is LTR-only (see
 * `parseHtmlToLexical.ts`'s fallback, which always emits `direction: 'ltr'`),
 * so they fold onto their LTR equivalents. `''` (no alignment set) maps to
 * `undefined` so the paragraph just inherits its container's default.
 */
const ALIGN_TO_TEXT_ALIGN: Partial<Record<ElementFormatType, Style['textAlign']>> = {
  left: 'left',
  start: 'left',
  center: 'center',
  right: 'right',
  end: 'right',
  justify: 'justify',
}

/**
 * Maps a `SerializedTextNode.format` bitmask to a react-pdf `Style`. Only
 * bold/italic/underline/strikethrough are handled — the four formats the
 * `inline` `RichTextField` editor variant exposes (see `inlineFeatures` in
 * `src/fields/RichText/index.ts`). Any other bit that ends up set (highlight,
 * code, sub/superscript, ...) is intentionally ignored.
 */
const textNodeStyle = (format: number): Style => {
  const style: Style = {}

  if (format & IS_BOLD) style.fontWeight = 'bold'
  if (format & IS_ITALIC) style.fontStyle = 'italic'

  const underline = Boolean(format & IS_UNDERLINE)
  const strikethrough = Boolean(format & IS_STRIKETHROUGH)
  if (underline && strikethrough) style.textDecoration = 'underline line-through'
  else if (underline) style.textDecoration = 'underline'
  else if (strikethrough) style.textDecoration = 'line-through'

  return style
}

/** A run with no formatting bits set is emitted as a plain string rather
 * than a redundant nested `<Text>`. */
const renderTextNode = (node: SerializedTextNode, key: number): ReactNode => {
  const style = textNodeStyle(node.format)

  return Object.keys(style).length > 0 ? (
    <Text key={key} style={style}>
      {node.text}
    </Text>
  ) : (
    node.text
  )
}

/** Other node types the `inline` variant's editor can't produce (links,
 * headings, lists, line breaks, ...) are silently skipped rather than
 * attempted — this transformer's scope is deliberately narrow. */
const renderParagraphNode = (node: SerializedParagraphNode, key: number): ReactNode => {
  const textAlign = ALIGN_TO_TEXT_ALIGN[node.format]

  return (
    <Text
      key={key}
      style={
        textAlign
          ? {
              textAlign,
            }
          : undefined
      }
    >
      {node.children.filter(isTextNode).map((child, i) => renderTextNode(child, i))}
    </Text>
  )
}

/**
 * Transforms a Lexical `SerializedEditorState` produced by the `inline`
 * `RichTextField` editor variant into react-pdf JSX: one `<Text>` per
 * paragraph, carrying that paragraph's alignment, with nested `<Text>` runs
 * for bold/italic/underline/strikethrough.
 *
 * Scope is intentionally narrow, matching that variant's feature set
 * (`inlineFeatures` in `src/fields/RichText/index.ts`: bold, italic,
 * underline, strikethrough, alignment — plain paragraphs of text, nothing
 * else). It is not a general Lexical-to-PDF renderer: headings, lists,
 * links, blocks, tables, and line breaks are all out of scope and silently
 * dropped rather than attempted. Use `convertLexicalToHTML` plus a richer
 * renderer for the `caption`/`markdown`/`post` variants instead.
 *
 * Returns one `<Text>` element per paragraph — render the result inside a
 * `<View>`, not nested inside another `<Text>`, so each paragraph's
 * alignment and line breaks are preserved. For genuinely single-paragraph
 * content (the common case — a résumé bullet point) the result is a single
 * `<Text>` and can be used directly wherever a `ReactNode` is expected.
 */
export const lexicalToJSX = (value: SerializedEditorState | undefined | null): ReactNode => {
  const children = (value?.root?.children ?? []) as SerializedLexicalNode[]

  return children.filter(isParagraphNode).map((node, i) => renderParagraphNode(node, i))
}
