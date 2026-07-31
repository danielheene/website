import { describe, expect, it } from 'vitest'

import { reduceDataToLocale } from './reduceDataToLocale'

describe('reduceDataToLocale', () => {
  it('selects the requested locale from locale-only objects', () => {
    expect(
      reduceDataToLocale(
        {
          title: {
            en: 'A',
            de: 'B',
          },
        },
        'de',
      ),
    ).toEqual({
      title: 'B',
    })
  })

  it('defaults to en', () => {
    expect(
      reduceDataToLocale({
        title: {
          en: 'A',
          de: 'B',
        },
      }),
    ).toEqual({
      title: 'A',
    })
  })

  it('reduces nested structures recursively', () => {
    const input = {
      meta: {
        description: {
          en: 'hello',
          de: 'hallo',
        },
      },
      plain: 'untouched',
    }
    expect(reduceDataToLocale(input, 'de')).toEqual({
      meta: {
        description: 'hallo',
      },
      plain: 'untouched',
    })
  })

  it('reduces objects inside arrays', () => {
    const input = {
      items: [
        {
          label: {
            en: 'one',
            de: 'eins',
          },
        },
      ],
    }
    expect(reduceDataToLocale(input, 'de')).toEqual({
      items: [
        {
          label: 'eins',
        },
      ],
    })
  })

  it('does NOT reduce objects containing non-locale keys', () => {
    const input = {
      mixed: {
        en: 'A',
        other: 'x',
      },
    }
    expect(reduceDataToLocale(input, 'en')).toEqual({
      mixed: {
        en: 'A',
        other: 'x',
      },
    })
  })

  it('passes primitives and null through', () => {
    expect(reduceDataToLocale(null)).toBeNull()
    expect(reduceDataToLocale('str')).toBe('str')
  })
})
