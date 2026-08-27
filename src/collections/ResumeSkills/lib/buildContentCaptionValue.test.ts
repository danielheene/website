import type { ReactElement } from 'react'

import { describe, expect, it } from 'vitest'

import { lexicalToJSX } from '@/pdf/lib/lexicalToJSX'

import { buildContentCaptionValue } from './buildContentCaptionValue'

type FixtureTextRun = {
  type: string
  version: number
  detail: number
  format: number
  mode: string
  style: string
  text: string
}

type FixtureParagraph = {
  type: string
  children: FixtureTextRun[]
}

const paragraphOf = (value: ReturnType<typeof buildContentCaptionValue>): FixtureParagraph =>
  (value.root.children as unknown as FixtureParagraph[])[0]

describe('buildContentCaptionValue', () => {
  it('builds a single bold text run when there is no caption', () => {
    const paragraph = paragraphOf(buildContentCaptionValue('TypeScript'))

    expect(paragraph.type).toBe('paragraph')
    expect(paragraph.children).toEqual([
      {
        type: 'text',
        version: 1,
        detail: 0,
        format: 1,
        mode: 'normal',
        style: '',
        text: 'TypeScript',
      },
    ])
  })

  it('appends " - caption" as a second, unformatted run when a caption is given', () => {
    const paragraph = paragraphOf(buildContentCaptionValue('TypeScript', 'Advanced'))

    expect(paragraph.children).toEqual([
      {
        type: 'text',
        version: 1,
        detail: 0,
        format: 1,
        mode: 'normal',
        style: '',
        text: 'TypeScript',
      },
      {
        type: 'text',
        version: 1,
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text: ' - Advanced',
      },
    ])
  })

  it.each([
    undefined,
    '',
    '   ',
  ])('treats %j as no caption', (caption) => {
    const paragraph = paragraphOf(buildContentCaptionValue('TypeScript', caption))

    expect(paragraph.children).toHaveLength(1)
  })

  it('produces a value lexicalToJSX renders as bold name plus plain caption', () => {
    const value = buildContentCaptionValue('TypeScript', 'Advanced')

    type Run = ReactElement<{
      style?: Record<string, unknown>
      children: string
    }>
    type Paragraph = ReactElement<{
      children: [
        Run,
        string,
      ]
    }>

    const [paragraph] = lexicalToJSX(value) as unknown as [
      Paragraph,
    ]
    const [contentRun, captionRun] = paragraph.props.children

    expect(contentRun.props.style).toEqual({
      fontWeight: 'bold',
    })
    expect(contentRun.props.children).toBe('TypeScript')
    expect(captionRun).toBe(' - Advanced')
  })
})
