import type { ReactElement, ReactNode } from 'react'

import { describe, expect, it } from 'vitest'

import { lexicalToJSX } from './lexicalToJSX'

/**
 * React 19's `ReactElement<P = unknown>` default means an un-parameterized
 * cast leaves `.props` untyped; this pins the shape we actually assert on
 * (a react-pdf `<Text>` run) so `.props.style`/`.props.children` type-check.
 */
type TextEl = ReactElement<{
  style?: Record<string, unknown>
  children?: ReactNode
}>

// Lexical's core TextNode format bitmask (see lexical/LexicalConstants):
// IS_BOLD=1, IS_ITALIC=2, IS_STRIKETHROUGH=4, IS_UNDERLINE=8.
const IS_BOLD = 1
const IS_ITALIC = 2
const IS_STRIKETHROUGH = 4
const IS_UNDERLINE = 8

const textNode = (text: string, format = 0) => ({
  type: 'text',
  version: 1,
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
})

const paragraphNode = (children: unknown[], format = '') => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format,
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children,
})

const doc = (children: unknown[]) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children,
  },
})

/** Casts through unknown since our fixtures are plain objects, not real
 * SerializedEditorState instances built by a headless editor. */
const asValue = (value: unknown) => value as Parameters<typeof lexicalToJSX>[0]

describe('lexicalToJSX', () => {
  it('returns an empty array for undefined/null/empty documents', () => {
    expect(lexicalToJSX(undefined)).toEqual([])
    expect(lexicalToJSX(null)).toEqual([])
    expect(lexicalToJSX(asValue(doc([])))).toEqual([])
  })

  it('renders a plain paragraph as a single unstyled Text with the raw string as its only run', () => {
    const [paragraph] = lexicalToJSX(
      asValue(
        doc([
          paragraphNode([
            textNode('Hello world'),
          ]),
        ]),
      ),
    ) as unknown as TextEl[]

    expect(paragraph.type).toBe('TEXT')
    expect(paragraph.props.style).toBeUndefined()
    expect(paragraph.props.children).toEqual([
      'Hello world',
    ])
  })

  it('wraps a bold run in a nested Text with fontWeight bold', () => {
    const [paragraph] = lexicalToJSX(
      asValue(
        doc([
          paragraphNode([
            textNode('bold', IS_BOLD),
          ]),
        ]),
      ),
    ) as unknown as TextEl[]

    const [run] = paragraph.props.children as unknown as TextEl[]
    expect(run.type).toBe('TEXT')
    expect(run.props.style).toEqual({
      fontWeight: 'bold',
    })
    expect(run.props.children).toBe('bold')
  })

  it('wraps an italic run in a nested Text with fontStyle italic', () => {
    const [paragraph] = lexicalToJSX(
      asValue(
        doc([
          paragraphNode([
            textNode('italic', IS_ITALIC),
          ]),
        ]),
      ),
    ) as unknown as TextEl[]

    const [run] = paragraph.props.children as unknown as TextEl[]
    expect(run.props.style).toEqual({
      fontStyle: 'italic',
    })
  })

  it('combines bold and italic on the same run', () => {
    const [paragraph] = lexicalToJSX(
      asValue(
        doc([
          paragraphNode([
            textNode('bold italic', IS_BOLD | IS_ITALIC),
          ]),
        ]),
      ),
    ) as unknown as TextEl[]

    const [run] = paragraph.props.children as unknown as TextEl[]
    expect(run.props.style).toEqual({
      fontWeight: 'bold',
      fontStyle: 'italic',
    })
  })

  it('maps underline to textDecoration underline', () => {
    const [paragraph] = lexicalToJSX(
      asValue(
        doc([
          paragraphNode([
            textNode('underlined', IS_UNDERLINE),
          ]),
        ]),
      ),
    ) as unknown as TextEl[]

    const [run] = paragraph.props.children as unknown as TextEl[]
    expect(run.props.style).toEqual({
      textDecoration: 'underline',
    })
  })

  it('maps strikethrough to textDecoration line-through', () => {
    const [paragraph] = lexicalToJSX(
      asValue(
        doc([
          paragraphNode([
            textNode('struck', IS_STRIKETHROUGH),
          ]),
        ]),
      ),
    ) as unknown as TextEl[]

    const [run] = paragraph.props.children as unknown as TextEl[]
    expect(run.props.style).toEqual({
      textDecoration: 'line-through',
    })
  })

  it('combines underline and strikethrough into one textDecoration value', () => {
    const [paragraph] = lexicalToJSX(
      asValue(
        doc([
          paragraphNode([
            textNode('both', IS_UNDERLINE | IS_STRIKETHROUGH),
          ]),
        ]),
      ),
    ) as unknown as TextEl[]

    const [run] = paragraph.props.children as unknown as TextEl[]
    expect(run.props.style).toEqual({
      textDecoration: 'underline line-through',
    })
  })

  it.each([
    [
      'left',
      'left',
    ],
    [
      'start',
      'left',
    ],
    [
      'center',
      'center',
    ],
    [
      'right',
      'right',
    ],
    [
      'end',
      'right',
    ],
    [
      'justify',
      'justify',
    ],
  ])('maps paragraph alignment %s to textAlign %s', (lexicalAlign, textAlign) => {
    const [paragraph] = lexicalToJSX(
      asValue(
        doc([
          paragraphNode(
            [
              textNode('aligned'),
            ],
            lexicalAlign,
          ),
        ]),
      ),
    ) as unknown as TextEl[]

    expect(paragraph.props.style).toEqual({
      textAlign,
    })
  })

  it('leaves the paragraph style undefined when no alignment is set', () => {
    const [paragraph] = lexicalToJSX(
      asValue(
        doc([
          paragraphNode(
            [
              textNode('unaligned'),
            ],
            '',
          ),
        ]),
      ),
    ) as unknown as TextEl[]

    expect(paragraph.props.style).toBeUndefined()
  })

  it('renders one Text per paragraph, each with its own alignment', () => {
    const result = lexicalToJSX(
      asValue(
        doc([
          paragraphNode(
            [
              textNode('left'),
            ],
            'left',
          ),
          paragraphNode(
            [
              textNode('right'),
            ],
            'right',
          ),
        ]),
      ),
    ) as unknown as TextEl[]

    expect(result).toHaveLength(2)
    expect(result[0].props.style).toEqual({
      textAlign: 'left',
    })
    expect(result[1].props.style).toEqual({
      textAlign: 'right',
    })
  })

  it('renders an empty paragraph as a Text with no children', () => {
    const [paragraph] = lexicalToJSX(
      asValue(
        doc([
          paragraphNode([]),
        ]),
      ),
    ) as unknown as TextEl[]

    expect(paragraph.type).toBe('TEXT')
    expect(paragraph.props.children).toEqual([])
  })

  it('silently skips non-paragraph top-level nodes and non-text paragraph children', () => {
    const result = lexicalToJSX(
      asValue(
        doc([
          {
            type: 'horizontalrule',
            version: 1,
          },
          paragraphNode([
            textNode('kept'),
            {
              type: 'linebreak',
              version: 1,
            },
          ]),
        ]),
      ),
    ) as unknown as TextEl[]

    expect(result).toHaveLength(1)
    expect(result[0].props.children).toEqual([
      'kept',
    ])
  })
})
