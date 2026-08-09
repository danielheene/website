import { describe, expect, it } from 'vitest'

import { generateExperienceInterval } from './generateExperienceInterval'

describe('generateExperienceInterval', () => {
  it('formats a finished interval', () => {
    expect(
      generateExperienceInterval({
        startDate: '2020-01-15',
        endDate: '2022-06-30',
      }),
    ).toBe('01/2020 - 06/2022')
  })

  it('formats an ongoing interval', () => {
    expect(
      generateExperienceInterval({
        startDate: '2020-01-15',
      }),
    ).toBe('since 01/2020')
    expect(
      generateExperienceInterval({
        startDate: '2020-01-15',
        locale: 'de',
      }),
    ).toBe('seit 01/2020')
  })

  it('returns an empty string without a start date', () => {
    expect(
      generateExperienceInterval({
        startDate: '',
      }),
    ).toBe('')
  })
})
