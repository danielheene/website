import { describe, expect, it } from 'vitest'

import { formatSecondsToDuration } from './formatSecondsToDuration'

describe('formatSecondsToDuration', () => {
  it('returns "0s" for zero, negative or missing input', () => {
    expect(formatSecondsToDuration(0)).toBe('0s')
    expect(formatSecondsToDuration(-5)).toBe('0s')
    expect(formatSecondsToDuration()).toBe('0s')
  })

  it('formats seconds only', () => {
    expect(formatSecondsToDuration(45)).toBe('45s')
  })

  it('formats minutes and seconds', () => {
    expect(formatSecondsToDuration(90)).toBe('1m 30s')
  })

  it('formats hours with the locale quirk of a space before "h"', () => {
    // the locale map defines xHours as '{{count}} h' (with a space) while
    // minutes/seconds have none — pin this asymmetry
    expect(formatSecondsToDuration(3661)).toBe('1 h 1m 1s')
  })

  it('omits zero units', () => {
    expect(formatSecondsToDuration(3600)).toBe('1 h')
  })
})
