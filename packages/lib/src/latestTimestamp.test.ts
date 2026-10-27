import { describe, expect, it } from 'vitest'

import { latestTimestamp } from './latestTimestamp'

describe('latestTimestamp', () => {
  it('returns the newest timestamp as ISO', () => {
    expect(
      latestTimestamp(
        '2026-09-01T00:00:00.000Z',
        '2026-09-26T10:00:00.000Z',
        '2025-12-31T00:00:00.000Z',
      ),
    ).toBe('2026-09-26T10:00:00.000Z')
  })

  it('compares Date instances chronologically, not by their string form', () => {
    // Mon, 01 Sep vs Sat, 26 Sep — a string sort would pick the Monday
    expect(
      latestTimestamp(new Date('2026-09-26T10:00:00.000Z'), new Date('2025-09-01T00:00:00.000Z')),
    ).toBe('2026-09-26T10:00:00.000Z')
  })

  it('mixes Dates and strings', () => {
    expect(latestTimestamp(new Date('2026-01-01T00:00:00.000Z'), '2026-02-01T00:00:00.000Z')).toBe(
      '2026-02-01T00:00:00.000Z',
    )
  })

  it('ignores empty and invalid values', () => {
    expect(latestTimestamp()).toBeUndefined()
    expect(latestTimestamp(null, undefined, '', 'not a date')).toBeUndefined()
    expect(latestTimestamp(null, '2026-02-01T00:00:00.000Z', 'nope')).toBe(
      '2026-02-01T00:00:00.000Z',
    )
  })
})
