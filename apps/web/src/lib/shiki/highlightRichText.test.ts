import { describe, expect, it } from 'vitest'

import { codeBlockKey } from '@repo/utils/shiki/codeBlockKey'
import { highlightRichText } from './highlightRichText'

const codeNode = (code: string, language?: string) => ({
  type: 'block',
  fields: {
    blockType: 'CodeBlock',
    code,
    language,
  },
})

const doc = (children: unknown[]) => ({
  root: {
    children,
  },
})

describe('highlightRichText', () => {
  it('highlights a top-level code block', async () => {
    const map = await highlightRichText(
      doc([
        codeNode('const a = 1', 'typescript'),
      ]),
    )

    expect(Object.keys(map)).toHaveLength(1)
    expect(map[codeBlockKey('const a = 1', 'typescript')]).toContain('--shiki-light')
  })

  it('finds code blocks nested below the root', async () => {
    const map = await highlightRichText(
      doc([
        {
          type: 'paragraph',
          children: [
            {
              type: 'quote',
              children: [
                codeNode('const nested = 1', 'typescript'),
              ],
            },
          ],
        },
      ]),
    )

    expect(map[codeBlockKey('const nested = 1', 'typescript')]).toContain('<pre')
  })

  it('de-duplicates identical blocks into a single entry', async () => {
    const map = await highlightRichText(
      doc([
        codeNode('const a = 1', 'typescript'),
        codeNode('const a = 1', 'typescript'),
      ]),
    )

    expect(Object.keys(map)).toHaveLength(1)
  })

  it('keys the same code separately per language', async () => {
    const map = await highlightRichText(
      doc([
        codeNode('a', 'typescript'),
        codeNode('a', 'css'),
      ]),
    )

    expect(Object.keys(map)).toHaveLength(2)
  })

  it('produces keys the renderer can look up when language is omitted', async () => {
    const map = await highlightRichText(
      doc([
        codeNode('const a = 1'),
      ]),
    )

    // the converter passes `node.fields.language`, which is undefined here —
    // both sides must resolve to the same fallback key
    expect(map[codeBlockKey('const a = 1', undefined)]).toContain('<pre')
  })

  it('ignores non-code blocks and empty code', async () => {
    const map = await highlightRichText(
      doc([
        {
          type: 'block',
          fields: {
            blockType: 'LinkGroupBlock',
          },
        },
        codeNode(''),
      ]),
    )

    expect(map).toEqual({})
  })

  it('returns an empty map for documents without code', async () => {
    expect(
      await highlightRichText(
        doc([
          {
            type: 'paragraph',
            children: [],
          },
        ]),
      ),
    ).toEqual({})
  })

  it('tolerates missing or malformed input', async () => {
    expect(await highlightRichText(undefined)).toEqual({})
    expect(await highlightRichText({})).toEqual({})
    expect(
      await highlightRichText({
        root: null,
      }),
    ).toEqual({})
  })
})
