import { describe, expect, it } from 'vitest'

import type { GlobalUserSettings } from '@/types/payload'

import {
  formatPhoneNumber,
  getPhoneNumberURI,
  normalizePhoneNumber,
  validatePhoneNumber,
} from './phoneNumber'

const germanAddress = {
  address: {
    en: {
      countryCode: 'DE',
    },
  },
} as unknown as Partial<GlobalUserSettings>

describe('validatePhoneNumber', () => {
  it('accepts an empty value', () => {
    expect(validatePhoneNumber('', undefined)).toBe(true)
    expect(validatePhoneNumber(null, undefined)).toBe(true)
  })

  it('accepts an international number without an address country', () => {
    expect(validatePhoneNumber('+49 30 12345678', undefined)).toBe(true)
  })

  it('resolves a national number through the address country', () => {
    expect(validatePhoneNumber('030 12345678', germanAddress)).toBe(true)
  })

  it('asks for international format when a national number has no country to resolve it', () => {
    expect(validatePhoneNumber('030 12345678', undefined)).toMatch(/international format/)
  })

  it('rejects an invalid number', () => {
    expect(validatePhoneNumber('+49 1', undefined)).not.toBe(true)
  })
})

describe('normalizePhoneNumber', () => {
  it('stores a valid number as E.164', () => {
    expect(normalizePhoneNumber(' 030 12345678 ', germanAddress)).toBe('+493012345678')
  })

  it('keeps an invalid number as entered, trimmed', () => {
    expect(normalizePhoneNumber(' 12 ', undefined)).toBe('12')
  })
})

describe('formatPhoneNumber / getPhoneNumberURI', () => {
  it('formats with the trunk prefix and builds a tel: URI', () => {
    expect(formatPhoneNumber('+493012345678', undefined)).toBe('+49 (0) 30 12345678')
    expect(getPhoneNumberURI('+493012345678', undefined)).toBe('tel:+493012345678')
  })

  it('returns empty strings for a missing or invalid number', () => {
    expect(formatPhoneNumber('', undefined)).toBe('')
    expect(getPhoneNumberURI('12', undefined)).toBe('')
  })
})
