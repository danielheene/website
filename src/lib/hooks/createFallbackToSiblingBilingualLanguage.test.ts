import { describe, expect, it } from 'vitest'

import { createFallbackToSiblingBilingualLanguage } from './createFallbackToSiblingBilingualLanguage'

const run = (
  locale: 'en' | 'de',
  args: {
    siblingData: Record<string, unknown>
    value?: unknown
  },
) => createFallbackToSiblingBilingualLanguage(locale)(args as never)

describe('createFallbackToSiblingBilingualLanguage', () => {
  it('falls back to the sibling locale when the value is empty', async () => {
    expect(
      await run('en', {
        siblingData: {
          en: 'fallback',
        },
        value: '',
      }),
    ).toBe('fallback')
    expect(
      await run('en', {
        siblingData: {
          en: 'fallback',
        },
        value: undefined,
      }),
    ).toBe('fallback')
  })

  it('treats whitespace-only values as empty', async () => {
    expect(
      await run('de', {
        siblingData: {
          de: 'da',
        },
        value: '   ',
      }),
    ).toBe('da')
  })

  it('keeps a non-empty value', async () => {
    expect(
      await run('en', {
        siblingData: {
          en: 'fallback',
        },
        value: 'keep',
      }),
    ).toBe('keep')
  })

  it('returns the value when the sibling is empty or whitespace', async () => {
    expect(
      await run('en', {
        siblingData: {
          en: '',
        },
        value: '',
      }),
    ).toBe('')
    expect(
      await run('en', {
        siblingData: {
          en: '  ',
        },
        value: undefined,
      }),
    ).toBeUndefined()
    expect(
      await run('en', {
        siblingData: {},
        value: undefined,
      }),
    ).toBeUndefined()
  })

  it('requires siblingData to be an object (documents current behavior)', async () => {
    // the hook reads `locale in siblingData` — undefined siblingData throws
    await expect(
      run('en', {
        siblingData: undefined as unknown as Record<string, unknown>,
        value: '',
      }),
    ).rejects.toThrow()
  })
})
