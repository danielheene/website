import { describe, expect, it } from 'vitest'

import { parseHtmlToLexical } from './parseHtmlToLexical'

type MinimalNode = {
  type: string
  text?: string
  format?: number
  children?: MinimalNode[]
}

const firstParagraph = (result: ReturnType<typeof parseHtmlToLexical>): MinimalNode => {
  const root = result.root as unknown as {
    children: MinimalNode[]
  }
  return root.children[0]
}

describe('parseHtmlToLexical', () => {
  it('parses a paragraph with bold text into matching Lexical nodes', () => {
    const paragraph = firstParagraph(parseHtmlToLexical('<p>Hello <strong>world</strong></p>'))

    expect(paragraph.type).toBe('paragraph')
    expect(paragraph.children?.map((node) => node.text)).toEqual([
      'Hello ',
      'world',
    ])
    const boldNode = paragraph.children?.[1]
    expect((boldNode?.format ?? 0) & 1).toBe(1) // IS_BOLD bit
  })

  it('falls back to a plain-text paragraph when the HTML uses node types that are not registered', () => {
    // No TableNode/TableRowNode/TableCellNode is registered on the headless
    // editor built inside parseHtmlToLexical, so this forces the parse to
    // fail and the fallback path to run.
    const paragraph = firstParagraph(
      parseHtmlToLexical('<table><tr><td>unsupported cell content</td></tr></table>'),
    )

    expect(paragraph.type).toBe('paragraph')
    expect(paragraph.children?.[0]?.text).toContain('unsupported cell content')
  })
})
