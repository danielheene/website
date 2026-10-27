import { describe, expect, it, vi } from 'vitest'

import { translate } from './translate'

describe('translate', () => {
  it('looks up plain keys per locale', () => {
    expect(translate('en', 'skill.label.plural')).toBe('Skills')
    expect(translate('de', 'skill.label.plural')).toBe('Qualifikationen')
  })

  it('interpolates values', () => {
    expect(
      translate('en', 'document.title', {
        name: 'Daniel',
      }),
    ).toBe('Resume of Daniel')
    expect(
      translate('de', 'document.title', {
        name: 'Daniel',
      }),
    ).toBe('Lebenslauf von Daniel')
  })

  it('applies date filters', () => {
    expect(
      translate('en', 'interval.finished', {
        startDate: '2020-01-15',
        endDate: '2022-06-30',
      }),
    ).toBe('01/2020 - 06/2022')
  })

  it('formats the ongoing interval', () => {
    expect(
      translate('de', 'interval.ongoing', {
        startDate: '2020-01-15',
      }),
    ).toBe('seit 01/2020')
  })

  it('returns the key and warns when the translation is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error — intentionally invalid key
    expect(translate('en', 'does.not.exist')).toBe('does.not.exist')
    expect(warn).toHaveBeenCalledOnce()
  })
})
