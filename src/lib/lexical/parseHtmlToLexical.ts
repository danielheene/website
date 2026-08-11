import 'server-only'

import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { $getRoot, $insertNodes } from '@payloadcms/richtext-lexical/lexical'
import { createHeadlessEditor } from '@payloadcms/richtext-lexical/lexical/headless'
import { $generateNodesFromDOM } from '@payloadcms/richtext-lexical/lexical/html'
import { LinkNode } from '@payloadcms/richtext-lexical/lexical/link'

import { JSDOM } from 'jsdom'

/**
 * Builds a minimal single-paragraph Lexical value directly from plain text,
 * bypassing the editor entirely. Used as a fallback when `html` can't be
 * parsed back into registered Lexical nodes.
 */
const buildPlainParagraphValue = (text: string): SerializedEditorState =>
  ({
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
          children: [
            {
              type: 'text',
              format: 0,
              style: '',
              mode: 'normal',
              detail: 0,
              version: 1,
              text,
            },
          ],
        },
      ],
    },
  }) as SerializedEditorState

/** Strips HTML tags and collapses whitespace, for the plain-text fallback. */
const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Parses an HTML fragment into a Lexical `SerializedEditorState` using a
 * headless editor (`@lexical/headless`) and `@lexical/html`'s DOM-based
 * parser, backed by `jsdom` for a server-side `Document`.
 *
 * Supports paragraphs, text formatting (bold/italic/underline/strikethrough),
 * and links — the node types available in the `inline`/`caption`
 * `RichTextField` editor variants. If parsing fails (a node type outside
 * that set, or malformed input), falls back to a single plain-text
 * paragraph built from `html` with tags stripped, so a bad round-trip
 * degrades instead of throwing.
 */
export const parseHtmlToLexical = (html: string): SerializedEditorState => {
  try {
    const editor = createHeadlessEditor({
      nodes: [
        LinkNode,
      ],
    })

    const dom = new JSDOM(html)

    editor.update(
      () => {
        const root = $getRoot()
        root.clear()
        const nodes = $generateNodesFromDOM(editor, dom.window.document)
        root.select()
        $insertNodes(nodes)
      },
      {
        discrete: true,
      },
    )

    return editor.getEditorState().toJSON()
  } catch {
    return buildPlainParagraphValue(stripHtml(html))
  }
}
