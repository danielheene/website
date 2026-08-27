import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getLocalISOString, getTimeZoneOffsetMillis, getTimeZoneOffsetMinutes } from './index'

describe('getTimeZoneOffsetMinutes', () => {
  it('returns 0 for UTC', () => {
    expect(getTimeZoneOffsetMinutes('UTC')).toBe(0)
  })

  it('returns 60 for Berlin in winter (CET)', () => {
    expect(getTimeZoneOffsetMinutes('Europe/Berlin', new Date('2026-01-15T12:00:00Z'))).toBe(60)
  })

  it('returns 120 for Berlin in summer (CEST)', () => {
    expect(getTimeZoneOffsetMinutes('Europe/Berlin', new Date('2026-07-15T12:00:00Z'))).toBe(120)
  })

  it('returns negative offsets for zones west of UTC', () => {
    expect(getTimeZoneOffsetMinutes('America/New_York', new Date('2026-01-15T12:00:00Z'))).toBe(
      -300,
    )
  })
})

describe('getTimeZoneOffsetMillis', () => {
  it('converts minutes to milliseconds', () => {
    expect(getTimeZoneOffsetMillis('Europe/Berlin', new Date('2026-01-15T12:00:00Z'))).toBe(
      60 * 60000,
    )
  })
})

describe('getLocalISOString', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'))
  })

  it('returns an ISO-like string without the trailing Z', () => {
    const result = getLocalISOString('UTC')
    expect(result).toBe('2026-06-15T12:00:00.000')
    expect(result.endsWith('Z')).toBe(false)
  })

  it('shifts the timestamp by the timezone offset', () => {
    // NOTE: the implementation bases the result on Date.now(), ignoring the
    // `date` parameter for the timestamp itself — documented current behavior
    expect(getLocalISOString('Europe/Berlin')).toBe('2026-06-15T14:00:00.000')
  })
})
