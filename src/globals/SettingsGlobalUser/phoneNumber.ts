import {
  type CountryCode,
  isSupportedCountry,
  type PhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js/max/es6'
import { get } from 'lodash-es'

import type { GlobalUserSettings } from '@/types/payload'

type PhoneNumberContext = Partial<GlobalUserSettings> | undefined

// Default region for numbers entered without a `+` prefix.
export const resolvePhoneNumberCountryCode = (
  data: PhoneNumberContext,
): CountryCode | undefined => {
  const countryCode: string | undefined =
    get(data, 'address.en.countryCode') || get(data, 'address.de.countryCode') || undefined

  return countryCode && isSupportedCountry(countryCode) ? countryCode : undefined
}

export const resolvePhoneNumber = (
  value: string | null | undefined,
  data: PhoneNumberContext,
): PhoneNumber | undefined => {
  if (!value) return undefined

  return parsePhoneNumberFromString(value, resolvePhoneNumberCountryCode(data))
}

export const validatePhoneNumber = (
  value: string | null | undefined,
  data: PhoneNumberContext,
): true | string => {
  if (!value) return true

  const phoneNumber = resolvePhoneNumber(value, data)

  if (!phoneNumber) {
    return resolvePhoneNumberCountryCode(data)
      ? 'The phone number could not be parsed.'
      : 'Enter the number in international format (e.g. +49 …) or set an address country.'
  }

  if (!phoneNumber.isPossible()) return 'The phone number has an impossible length.'

  if (!phoneNumber.isValid()) return 'The phone number is invalid.'

  return true
}

/** E.164 (`+491234567890`) when the number is valid, otherwise the input unchanged. */
export const normalizePhoneNumber = (
  value: string | null | undefined,
  data: PhoneNumberContext,
): string => {
  const trimmed = (value ?? '').trim()
  const phoneNumber = resolvePhoneNumber(trimmed, data)

  return phoneNumber?.isValid() ? phoneNumber.number : trimmed
}

// German convention: the trunk prefix in parentheses after the country code, `+49 (0) 30 …`.
export const formatPhoneNumber = (
  value: string | null | undefined,
  data: PhoneNumberContext,
): string => {
  const phoneNumber = resolvePhoneNumber(value, data)

  if (!phoneNumber?.isValid()) return ''

  return phoneNumber.formatInternational().split(' ').toSpliced(1, 0, '(0)').join(' ')
}

export const getPhoneNumberURI = (
  value: string | null | undefined,
  data: PhoneNumberContext,
): string => {
  const phoneNumber = resolvePhoneNumber(value, data)

  return phoneNumber?.isValid() ? phoneNumber.getURI() : ''
}
