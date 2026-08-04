import { describe, expect, it } from 'vitest'

import { isSseChannel, SSE_CHANNELS } from './channels'

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
})
