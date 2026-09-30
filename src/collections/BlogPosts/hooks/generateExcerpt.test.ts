import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { describe, expect, it } from 'vitest'

import { READ_MORE_NODE_TYPE } from '@/fields/RichText/lexical/readMore/ReadMoreNode.base'

import { computeExcerpt } from './generateExcerpt'

const paragraph = (text: string) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children: [
    {
      type: 'text',
      version: 1,
      text,
      detail: 0,
      format: 0,
      mode: 'normal',
      style: '',
    },
  ],
})

const editorState = (children: unknown[]) =>
  ({
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children,
    },
  }) as unknown as SerializedEditorState

describe('computeExcerpt', () => {
  it('returns undefined without content', () => {
    expect(computeExcerpt(undefined)).toBeUndefined()
    expect(computeExcerpt(null)).toBeUndefined()
  })

  it('takes everything before the ReadMore marker', () => {
    const content = editorState([
      paragraph('Intro text.'),
      {
        type: READ_MORE_NODE_TYPE,
        version: 1,
      },
      paragraph('Hidden body.'),
    ])

    expect(computeExcerpt(content)).toBe('Intro text.')
  })

  it('falls back to the first 50 words', () => {
    const words = Array.from(
      {
        length: 60,
      },
      (_, index) => `w${index}`,
    )
    const content = editorState([paragraph(words.join(' '))])

    expect(computeExcerpt(content)).toBe(`${words.slice(0, 50).join(' ')}…`)
  })

  it('decodes escaped entities', () => {
    expect(computeExcerpt(editorState([paragraph('R&D <3')]))).toBe('R&D <3')
  })
})
