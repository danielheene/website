import { describe, expect, it } from 'vitest'

import { removeObjectKeys } from './removeObjectKeys'

describe('removeObjectKeys', () => {
  it('removes keys at the top level', () => {
    expect(
      removeObjectKeys(
        {
          a: 1,
          b: 2,
        },
        [
          'b',
        ],
      ),
    ).toEqual({
      a: 1,
    })
  })

  it('removes keys recursively in nested objects', () => {
    const input = {
      a: 1,
      nested: {
        id: 'x',
        keep: true,
        deeper: {
          id: 'y',
        },
      },
    }
    expect(
      removeObjectKeys(input, [
        'id',
      ]),
    ).toEqual({
      a: 1,
      nested: {
        keep: true,
        deeper: {},
      },
    })
  })

  it('removes keys inside arrays of objects', () => {
    const input = {
      items: [
        {
          id: 1,
          name: 'a',
        },
        {
          id: 2,
          name: 'b',
        },
      ],
    }
    expect(
      removeObjectKeys(input, [
        'id',
      ]),
    ).toEqual({
      items: [
        {
          name: 'a',
        },
        {
          name: 'b',
        },
      ],
    })
  })

  it('returns a deep clone even with no keys given', () => {
    const input = {
      nested: {
        a: 1,
      },
    }
    const result = removeObjectKeys(input)
    expect(result).toEqual(input)
    expect(result).not.toBe(input)
    expect(result.nested).not.toBe(input.nested)
  })

  it('passes primitives and null through unchanged', () => {
    expect(
      removeObjectKeys(42, [
        'x',
      ]),
    ).toBe(42)
    expect(
      removeObjectKeys('str', [
        'x',
      ]),
    ).toBe('str')
    expect(
      removeObjectKeys(null, [
        'x',
      ]),
    ).toBeNull()
    expect(
      removeObjectKeys(
        {
          a: null,
        },
        [
          'x',
        ],
      ),
    ).toEqual({
      a: null,
    })
  })

  it('preserves function values by reference', () => {
    const fn = () => 'hi'
    const result = removeObjectKeys(
      {
        fn,
        drop: 1,
      },
      [
        'drop',
      ],
    )
    expect(result.fn).toBe(fn)
  })
})
