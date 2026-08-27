import { describe, expect, it } from 'vitest'

import { reduceDataToBilingualLanguage } from './reduceDataToBilingualLanguage'

describe('reduceDataToBilingualLanguage', () => {
  it('selects the requested locale from locale-only objects', () => {
    expect(
      reduceDataToBilingualLanguage(
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
      reduceDataToBilingualLanguage({
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
    expect(reduceDataToBilingualLanguage(input, 'de')).toEqual({
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
    expect(reduceDataToBilingualLanguage(input, 'de')).toEqual({
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
    expect(reduceDataToBilingualLanguage(input, 'en')).toEqual({
      mixed: {
        en: 'A',
        other: 'x',
      },
    })
  })

  it('passes primitives and null through', () => {
    expect(reduceDataToBilingualLanguage(null)).toBeNull()
    expect(reduceDataToBilingualLanguage('str')).toBe('str')
  })
})
