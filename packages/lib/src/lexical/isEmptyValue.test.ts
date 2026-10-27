import { describe, expect, it } from 'vitest'

import { isEmptyValue } from './isEmptyValue'

const paragraph = (text: string) => ({
  root: {
    children: text
      ? [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text,
              },
            ],
          },
        ]
      : [],
  },
})

describe('isEmptyValue', () => {
  it('treats undefined as empty', () => {
    expect(isEmptyValue(undefined)).toBe(true)
  })

  it('treats a root with no children as empty', () => {
    expect(isEmptyValue(paragraph('') as never)).toBe(true)
  })

  it("treats Payload's default single-empty-paragraph shape as empty", () => {
    expect(
      isEmptyValue({
        root: {
          children: [
            {
              type: 'paragraph',
              children: [],
            },
          ],
        },
      } as never),
    ).toBe(true)
  })

  it('treats a populated paragraph as non-empty', () => {
    expect(isEmptyValue(paragraph('Hello') as never)).toBe(false)
  })

  it('treats more than one child as non-empty without inspecting them', () => {
    expect(
      isEmptyValue({
        root: {
          children: [
            {
              type: 'paragraph',
              children: [],
            },
            {
              type: 'paragraph',
              children: [],
            },
          ],
        },
      } as never),
    ).toBe(false)
  })
})
