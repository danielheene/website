import { describe, expect, it } from 'vitest'

import { blocksToLexical } from './blocksToLexical'

describe('blocksToLexical', () => {
  it('returns null without blocks', () => {
    expect(blocksToLexical([])).toBeNull()
  })

  it('inlines rich text and embeds other blocks under their old title', () => {
    const paragraph = {
      type: 'paragraph',
      children: [],
    }

    const doc = blocksToLexical([
      {
        id: 'abc',
        blockType: 'LegalPublisherInformationBlock',
        title: 'Publisher Information',
      },
      {
        id: 'def',
        blockType: 'RichTextBlock',
        content: {
          root: {
            children: [paragraph],
          },
        },
      },
    ])

    expect(doc.root.children).toEqual([
      expect.objectContaining({
        type: 'heading',
        tag: 'h2',
        children: [expect.objectContaining({ text: 'Publisher Information' })],
      }),
      {
        type: 'block',
        version: 2,
        format: '',
        fields: {
          id: 'abc',
          blockName: '',
          blockType: 'LegalPublisherInformationBlock',
        },
      },
      paragraph,
    ])
  })

  it('gives blocks without an id a new one', () => {
    const doc = blocksToLexical([
      {
        blockType: 'LegalAttributionsBlock',
      },
    ])

    expect(doc.root.children[0]).toMatchObject({
      fields: {
        id: expect.stringMatching(/^[0-9a-f]{24}$/),
      },
    })
  })
})
