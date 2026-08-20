import { describe, expect, it } from 'vitest'

import {
  bilingualTranslateChannel,
  isBilingualTranslateChannel,
  isSeedTaskChannel,
  isSseChannel,
  SSE_CHANNELS,
  seedTaskChannel,
} from './channels'

describe('isSseChannel', () => {
  it('accepts every allowlisted channel', () => {
    for (const channel of SSE_CHANNELS) {
      expect(isSseChannel(channel)).toBe(true)
    }
  })

  it('rejects a missing channel', () => {
    expect(isSseChannel(null)).toBe(false)
    expect(isSseChannel('')).toBe(false)
  })

  it('rejects channels that are not allowlisted', () => {
    expect(isSseChannel('arbitrary-channel')).toBe(false)
    expect(isSseChannel('__keyspace@0__:*')).toBe(false)
  })

  it('does not treat the allowlist as a prefix or pattern match', () => {
    expect(isSseChannel('service-status-other')).toBe(false)
    expect(isSseChannel('service-*')).toBe(false)
    expect(isSseChannel('*')).toBe(false)
  })

  it('is case-sensitive', () => {
    expect(isSseChannel('SERVICE-STATUS')).toBe(false)
  })

  it('does not inherit Object.prototype members', () => {
    expect(isSseChannel('toString')).toBe(false)
    expect(isSseChannel('constructor')).toBe(false)
    expect(isSseChannel('__proto__')).toBe(false)
  })

  it('rejects a bilingual-translate channel (that pattern is checked separately)', () => {
    expect(isSseChannel(bilingualTranslateChannel('job-1'))).toBe(false)
  })
})

describe('bilingualTranslateChannel', () => {
  it('prefixes the job id', () => {
    expect(bilingualTranslateChannel('68abc123')).toBe('bilingual-translate:68abc123')
  })
})

describe('isBilingualTranslateChannel', () => {
  it('accepts a channel built by bilingualTranslateChannel', () => {
    expect(isBilingualTranslateChannel(bilingualTranslateChannel('68abc123'))).toBe(true)
  })

  it('rejects a missing channel', () => {
    expect(isBilingualTranslateChannel(null)).toBe(false)
    expect(isBilingualTranslateChannel('')).toBe(false)
  })

  it('rejects a channel with no job id', () => {
    expect(isBilingualTranslateChannel('bilingual-translate:')).toBe(false)
  })

  it('rejects a job id containing characters outside the allowed set', () => {
    expect(isBilingualTranslateChannel('bilingual-translate:../etc/passwd')).toBe(false)
    expect(isBilingualTranslateChannel('bilingual-translate:job 1')).toBe(false)
  })

  it('rejects channels outside the bilingual-translate prefix', () => {
    expect(isBilingualTranslateChannel('service-status')).toBe(false)
    expect(isBilingualTranslateChannel('other-prefix:job-1')).toBe(false)
  })
})

describe('seedTaskChannel', () => {
  it('prefixes the job id', () => {
    expect(seedTaskChannel('68abc123')).toBe('seed-task:68abc123')
  })
})

describe('isSeedTaskChannel', () => {
  it('accepts a channel built by seedTaskChannel', () => {
    expect(isSeedTaskChannel(seedTaskChannel('68abc123'))).toBe(true)
  })

  it('rejects a missing channel', () => {
    expect(isSeedTaskChannel(null)).toBe(false)
    expect(isSeedTaskChannel('')).toBe(false)
  })

  it('rejects a channel with no job id', () => {
    expect(isSeedTaskChannel('seed-task:')).toBe(false)
  })

  it('rejects a job id containing characters outside the allowed set', () => {
    expect(isSeedTaskChannel('seed-task:../etc/passwd')).toBe(false)
    expect(isSeedTaskChannel('seed-task:job 1')).toBe(false)
  })

  it('rejects channels outside the seed-task prefix', () => {
    expect(isSeedTaskChannel('service-status')).toBe(false)
    expect(isSeedTaskChannel('other-prefix:job-1')).toBe(false)
  })
})
