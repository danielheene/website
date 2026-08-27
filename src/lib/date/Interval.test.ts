import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Interval } from './Interval'

/**
 *    All wall-clock dependent methods are pinned via fake timers.
 *    TZ=UTC is enforced in vitest.setup.ts — startOfDay/endOfMonth etc. are
 *    local-time functions and these expectations depend on it.
 */
const NOW = new Date('2026-06-15T12:00:00.000Z') // a Monday

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Interval', () => {
  describe('constructor', () => {
    it('auto-sorts start and end dates', () => {
      const interval = new Interval('2026-06-10', '2026-06-01')
      expect(interval.startDate.getTime()).toBeLessThan(interval.endDate.getTime())
      expect(interval.ISOStringStartDate).toBe('2026-06-01T00:00:00.000Z')
    })

    it('defaults both dates to now', () => {
      const interval = new Interval()
      expect(interval.startTime).toBe(NOW.getTime())
      expect(interval.endTime).toBe(NOW.getTime())
    })

    it('accepts Date objects and ISO strings interchangeably', () => {
      const interval = new Interval(new Date('2026-01-01'), '2026-02-01')
      expect(interval.ISOStringValue).toEqual([
        '2026-01-01T00:00:00.000Z',
        '2026-02-01T00:00:00.000Z',
      ])
    })
  })

  describe('moveInterval', () => {
    it('shifts forward by its own duration per step', () => {
      const interval = new Interval('2026-06-01', '2026-06-02').moveInterval(1)
      expect(interval.ISOStringValue).toEqual([
        '2026-06-02T00:00:00.000Z',
        '2026-06-03T00:00:00.000Z',
      ])
    })

    it('shifts backward with negative steps', () => {
      const interval = new Interval('2026-06-01', '2026-06-02').moveInterval(-2)
      expect(interval.ISOStringValue).toEqual([
        '2026-05-30T00:00:00.000Z',
        '2026-05-31T00:00:00.000Z',
      ])
    })
  })

  describe('difference getters', () => {
    const interval = () => new Interval('2026-06-01T00:00:00Z', '2026-06-03T12:30:45Z')

    it('computes differences in each unit', () => {
      expect(interval().differenceInDays).toBe(2)
      expect(interval().differenceInHours).toBe(60)
      expect(interval().differenceInMinutes).toBe(60 * 60 + 30)
      expect(interval().differenceInSeconds).toBe(60 * 60 * 60 + 30 * 60 + 45)
      expect(interval().differenceInMilliseconds).toBe((60 * 60 * 60 + 30 * 60 + 45) * 1000)
    })
  })

  describe('mergeIntervals', () => {
    it('merges overlapping intervals', () => {
      const merged = Interval.mergeIntervals([
        new Interval('2026-01-01', '2026-01-10'),
        new Interval('2026-01-05', '2026-01-15'),
      ])
      expect(merged).toHaveLength(1)
      expect(merged[0].ISOStringEndDate).toBe('2026-01-15T00:00:00.000Z')
    })

    it('merges adjacent intervals (start === previous end)', () => {
      const merged = Interval.mergeIntervals([
        new Interval('2026-01-01', '2026-01-10'),
        new Interval('2026-01-10', '2026-01-20'),
      ])
      expect(merged).toHaveLength(1)
    })

    it('keeps disjoint intervals separate and sorted', () => {
      const merged = Interval.mergeIntervals([
        new Interval('2026-03-01', '2026-03-05'),
        new Interval('2026-01-01', '2026-01-05'),
      ])
      expect(merged).toHaveLength(2)
      expect(merged[0].ISOStringStartDate).toBe('2026-01-01T00:00:00.000Z')
    })
  })

  describe('setToX presets (frozen clock)', () => {
    it('setToToday spans the current day', () => {
      const interval = new Interval().setToToday()
      expect(interval.ISOStringStartDate).toBe('2026-06-15T00:00:00.000Z')
      expect(interval.ISOStringEndDate).toBe('2026-06-15T23:59:59.999Z')
    })

    it('setToThisWeek starts on Monday', () => {
      const interval = new Interval().setToThisWeek()
      expect(interval.ISOStringStartDate).toBe('2026-06-15T00:00:00.000Z') // NOW is a Monday
      expect(interval.ISOStringEndDate).toBe('2026-06-21T23:59:59.999Z')
    })

    it('setToLastTwentyFourHours ends now', () => {
      const interval = new Interval().setToLastTwentyFourHours()
      expect(interval.endTime).toBe(NOW.getTime())
      expect(interval.differenceInHours).toBe(24)
    })

    it('setToThisMonth spans June 2026', () => {
      const interval = new Interval().setToThisMonth()
      expect(interval.ISOStringStartDate).toBe('2026-06-01T00:00:00.000Z')
      expect(interval.ISOStringEndDate).toBe('2026-06-30T23:59:59.999Z')
    })

    it('setToThisYear spans 2026', () => {
      const interval = new Interval().setToThisYear()
      expect(interval.ISOStringStartDate).toBe('2026-01-01T00:00:00.000Z')
      expect(interval.ISOStringEndDate).toBe('2026-12-31T23:59:59.999Z')
    })
  })
})
