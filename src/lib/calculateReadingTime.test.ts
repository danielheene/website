import { describe, expect, it } from 'vitest'

import { calculateReadingTime } from './calculateReadingTime'

const lexicalDocument = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: paragraphs.map((text) => ({
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
    })),
  },
})

const words = (count: number, word = 'word'): string =>
  Array.from({
    length: count,
  })
    .fill(word)
    .join(' ')

describe('calculateReadingTime', () => {
  it('returns 0 for a null/undefined value', () => {
    expect(calculateReadingTime(null)).toBe(0)
    expect(calculateReadingTime(undefined)).toBe(0)
  })

  it('returns 0 for a value with no text content', () => {
    expect(calculateReadingTime(lexicalDocument([]) as never)).toBe(0)
  })

  it('rounds up to at least 1 minute for a short document', () => {
    const value = lexicalDocument([
      'Just a few words here.',
    ])

    expect(calculateReadingTime(value as never)).toBe(1)
  })

  it('estimates ~200 words per minute, rounding up', () => {
    // 401 words -> 401 / 200 = 2.005 -> rounds up to 3
    const value = lexicalDocument([
      words(401),
    ])

    expect(calculateReadingTime(value as never)).toBe(3)
  })

  it('divides evenly without rounding up when the count lands exactly on a boundary', () => {
    // exactly 400 words -> 400 / 200 = 2.0 -> stays at 2
    const value = lexicalDocument([
      words(400),
    ])

    expect(calculateReadingTime(value as never)).toBe(2)
  })

  it('counts words across multiple paragraphs', () => {
    const value = lexicalDocument([
      words(150),
      words(150),
    ])

    // 300 words -> 1.5 -> rounds up to 2
    expect(calculateReadingTime(value as never)).toBe(2)
  })
})
