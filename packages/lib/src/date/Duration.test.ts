import { describe, expect, it } from 'vitest'

import { Duration } from './Duration'

describe('Duration', () => {
  describe('static factories', () => {
    it('creates from a duration string', () => {
      expect(Duration.fromString('2h').toMilliseconds()).toBe(2 * 60 * 60 * 1000)
      expect(Duration.fromString('1d 12h').toHours()).toBe(36)
    })

    it('throws on unparseable strings', () => {
      expect(() => Duration.fromString('garbage')).toThrow()
    })

    it('creates from seconds, minutes, hours and days', () => {
      expect(Duration.fromSeconds(90).toMilliseconds()).toBe(90_000)
      expect(Duration.fromMinutes(2).toSeconds()).toBe(120)
      expect(Duration.fromHours(2).toMinutes()).toBe(120)
      expect(Duration.fromDays(1).toHours()).toBe(24)
    })
  })

  describe('add methods (chainable)', () => {
    it('adds units cumulatively', () => {
      expect(Duration.fromHours(1).addMinutes(30).toMinutes()).toBe(90)
      // sub-second precision is truncated: intervalToDuration only tracks
      // whole seconds, so 1s + 500ms collapses back to 1000ms
      expect(Duration.fromSeconds(1).addMilliseconds(500).toMilliseconds()).toBe(1000)
      expect(Duration.fromSeconds(1).addMilliseconds(1000).toMilliseconds()).toBe(2000)
      expect(Duration.fromDays(1).addDays(1).toHours()).toBe(48)
      expect(Duration.fromMinutes(1).addSeconds(30).toSeconds()).toBe(90)
      expect(Duration.fromHours(1).addHours(2).toHours()).toBe(3)
    })
  })

  describe('set methods', () => {
    it('overwrites individual fields without normalizing', () => {
      // setters mutate the duration fields directly — setting 90 seconds on a
      // 5-minute duration yields 5m + 90s, not a normalized 6m 30s object,
      // but the total is still correct in milliseconds
      expect(Duration.fromMinutes(5).setSeconds(90).toMilliseconds()).toBe(5 * 60_000 + 90_000)
      expect(Duration.fromHours(1).setMinutes(30).toMinutes()).toBe(90)
      expect(Duration.fromDays(1).setHours(12).toHours()).toBe(36)
      expect(Duration.fromHours(2).setDays(1).toHours()).toBe(26)
    })
  })

  describe('toPretty', () => {
    it('renders a human-readable string', () => {
      expect(Duration.fromHours(1).addMinutes(30).toPretty()).toBe('1h 30m')
    })
  })
})
